'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import dynamic from 'next/dynamic';

const BookingCalendar = dynamic(() => import('@/components/BookingCalendar'), {
  ssr: false,
  loading: () => <div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
});

function BookingForm() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const packageId = searchParams.get('package');
  
  const [user, setUser] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [useCalendarView, setUseCalendarView] = useState(true);

  useEffect(() => {
    loadUser();
    loadServices();
  }, []);

  useEffect(() => {
    if (packageId && services.length > 0) {
      const pkg = services.find(s => s.slug === packageId);
      if (pkg) setSelectedService(pkg.id);
    }
  }, [packageId, services]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const loadUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  };

  const loadServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .order('name');
    
    if (data) setServices(data);
    if (error) console.error('Error loading services:', error);
  };

  const loadAvailableSlots = async (date: string) => {
    if (!selectedService) return;
    
    const dayOfWeek = new Date(date).getDay();
    
    // Get schedules for this service and day
    const { data: schedules } = await supabase
      .from('schedules')
      .select('*')
      .eq('day_of_week', dayOfWeek)
      .eq('service_id', selectedService);

    if (!schedules || schedules.length === 0) {
      setAvailableSlots([]);
      return;
    }

    // Get existing bookings for this date and service
    const { data: bookings } = await supabase
      .from('bookings')
      .select('time_slot')
      .eq('date', date)
      .eq('service_id', selectedService);

    const bookedTimes = bookings?.map(b => b.time_slot) || [];

    // Extract available time slots from schedules
    const allSlots: string[] = schedules
      .map(schedule => schedule.time)
      .filter(time => !bookedTimes.includes(time))
      .sort();

    setAvailableSlots(allSlots);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error(t('booking.loginRequired'));
      window.location.href = '/prijava?redirect=/rezervacija';
      return;
    }

    if (!selectedService) {
      toast.error(t('booking.selectServiceFirst'));
      return;
    }
    
    if (!selectedDate) {
      toast.error(t('booking.selectDateFirst'));
      return;
    }
    
    if (!selectedTime) {
      toast.error(t('booking.selectDateFirst'));
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        service_id: selectedService,
        date: selectedDate,
        time_slot: selectedTime,
        notes: notes || null,
        status: 'pending'
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      toast.error(t('booking.error'));
      console.error(error);
    } else {
      toast.success(t('booking.success'));
      // Reset form
      setSelectedService('');
      setSelectedDate('');
      setSelectedTime('');
      setNotes('');
    }
  };

  // Generate next 14 days for date selection
  const dateOptions = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i);
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEEE, d. MMMM yyyy')
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('booking.title')}
            </h1>
            <p className="text-xl text-gray-600">
              {t('booking.subtitle')}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {!user && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">
                  {t('booking.loginRequired')}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('booking.selectService')} *
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t('booking.selectService')}</option>
                  {services.filter(s => !s.is_package).length > 0 && (
                    <optgroup label={t('nav.therapies')}>
                      {services.filter(s => !s.is_package).map(service => (
                        <option key={service.id} value={service.id}>
                          {service.name} - €{service.price} ({service.duration} min)
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {services.filter(s => s.is_package).length > 0 && (
                    <optgroup label={t('nav.packages')}>
                      {services.filter(s => s.is_package).map(service => (
                        <option key={service.id} value={service.id}>
                          {service.name} - €{service.price} ({service.sessions} {t('admin.services.sessions')})
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Date Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                    <Calendar size={18} />
                    <span>{t('booking.selectDate')} *</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseCalendarView(!useCalendarView)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {useCalendarView ? t('booking.useDropdown') : t('booking.useCalendar')}
                  </button>
                </div>
                
                {useCalendarView && selectedService ? (
                  <div className="border border-gray-300 rounded-lg p-4">
                    <BookingCalendar
                      serviceId={selectedService}
                      onDateSelect={(date, time) => {
                        setSelectedDate(date);
                        if (time) setSelectedTime(time);
                      }}
                      selectedDate={selectedDate}
                      selectedTime={selectedTime}
                    />
                  </div>
                ) : (
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">{t('booking.selectDate')}</option>
                    {dateOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                    <Clock size={18} />
                    <span>{t('booking.selectTime')} *</span>
                  </label>
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {availableSlots.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                            selectedTime === slot
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">{t('booking.noSlotsAvailable')}</p>
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <MessageSquare size={18} />
                  <span>{t('booking.additionalNotes')}</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('booking.notesPlaceholder')}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !user}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? t('common.loading') : t('booking.submit')}
              </button>
            </form>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">{t('contact.hours')}:</h3>
              <p className="text-sm text-gray-600">{t('contact.weekdays')}: {t('site.hours.weekdays')}</p>
              <p className="text-sm text-gray-600">{t('contact.saturday')}: {t('site.hours.saturday')}</p>
              <p className="text-sm text-gray-600 mt-2">{t('contact.phone')}: {t('site.phone')[0]} | {t('site.phone')[1]}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <BookingForm />
    </Suspense>
  );
}
