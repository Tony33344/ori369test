'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n';
import { toast } from 'react-hot-toast';
import { Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface BookingCalendarProps {
  serviceId: string;
  onDateSelect: (date: string, timeSlot: string) => void;
  selectedDate?: string;
  selectedTime?: string;
}

export default function BookingCalendar({
  serviceId,
  onDateSelect,
  selectedDate,
  selectedTime
}: BookingCalendarProps) {
  const { t } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [googleBusyEvents, setGoogleBusyEvents] = useState<any[]>([]);
  const [bookedEvents, setBookedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (serviceId) {
      loadBookings();
      loadAvailability();
    }
  }, [serviceId]);

  useEffect(() => {
    if (currentMonth) {
      const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      loadGoogleBusy(start.toISOString(), end.toISOString());
    }
  }, [currentMonth]);

  const loadBookings = async () => {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('date, time_slot, status, services(duration)')
      .in('status', ['pending', 'confirmed']);

    if (error) {
      console.error('Error loading bookings:', error);
      setLoading(false);
      return;
    }

    if (bookings) {
      const events = bookings.map((booking: any) => ({
        date: booking.date,
        timeSlot: booking.time_slot,
        duration: booking.services?.duration || 60,
      }));
      setBookedEvents(events);
    }
    setLoading(false);
  };

  const loadGoogleBusy = async (timeMin: string, timeMax: string) => {
    try {
      const res = await fetch(`/api/google-calendar/busy?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`);
      if (!res.ok) return;
      const json = await res.json();
      const busy = (json?.busy || []).map((e: any) => ({
        start: e?.start,
        end: e?.end,
      }));
      console.log('Google Calendar busy events for calendar:', busy);
      setGoogleBusyEvents(busy);
    } catch (e) {
      console.error('Failed to load Google Calendar busy events:', e);
    }
  };

  const loadAvailability = async () => {
    const { data: slots, error } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('active', true);

    if (error) {
      console.error('Error loading availability:', error);
      return;
    }

    if (slots) {
      setAvailableSlots(slots);
    }
  };

  const isSlotBusy = (dateStr: string, timeSlot: string) => {
    const dateTime = new Date(`${dateStr}T${timeSlot}`);
    for (const event of bookedEvents) {
      if (event.date === dateStr && event.timeSlot === timeSlot) return true;
    }
    for (const event of googleBusyEvents) {
      const start = new Date(event.start);
      const end = new Date(event.end);
      if (dateTime >= start && dateTime < end) return true;
    }
    return false;
  };

  const getAvailableTimeSlots = (date: Date) => {
    const dayOfWeek = date.getDay();
    const daySlots = availableSlots.filter(slot => slot.day_of_week === dayOfWeek);
    if (daySlots.length === 0) return [];

    const dateStr = date.toISOString().split('T')[0];
    const slots: string[] = [];

    for (const slot of daySlots) {
      const [startHour, startMin] = slot.start_time.split(':').map(Number);
      const [endHour, endMin] = slot.end_time.split(':').map(Number);
      let current = new Date(date);
      current.setHours(startHour, startMin, 0, 0);
      const end = new Date(date);
      end.setHours(endHour, endMin, 0, 0);

      while (current < end) {
        const timeStr = current.toTimeString().slice(0, 5);
        if (!isSlotBusy(dateStr, timeStr)) {
          slots.push(timeStr);
        }
        current.setMinutes(current.getMinutes() + 30);
      }
    }
    return slots;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    const startDayOfWeek = firstDay.getDay();
    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  };

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    const daySlots = availableSlots.filter(slot => slot.day_of_week === dayOfWeek);
    if (daySlots.length === 0) {
      toast.error(t('booking.noSlotsAvailable'));
      return;
    }
    onDateSelect(dateStr, '');
  };

  const handleTimeSlotClick = (timeSlot: string) => {
    if (!selectedDate) return;
    onDateSelect(selectedDate, timeSlot);
  };

  const selectedDateObj = selectedDate ? new Date(selectedDate) : null;
  const availableTimeSlots = selectedDateObj ? getAvailableTimeSlots(selectedDateObj) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const days = getDaysInMonth(currentMonth);
  const locale = t('common.locale');
  const monthNames = locale === 'sl'
    ? ['Januar', 'Februar', 'Marec', 'April', 'Maj', 'Junij', 'Julij', 'Avgust', 'September', 'Oktober', 'November', 'December']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = locale === 'sl'
    ? ['Ne', 'Po', 'To', 'Sr', 'Če', 'Pe', 'So']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-4">
      {/* Compact Month Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white">
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-base font-semibold text-white">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="p-3">
          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) return <div key={index} className="aspect-square"></div>;

              const dateStr = date.toISOString().split('T')[0];
              const isToday = date.getTime() === today.getTime();
              const isPast = date < today;
              const isSelected = selectedDate === dateStr;
              const dayOfWeek = date.getDay();
              const hasAvailability = availableSlots.some(slot => slot.day_of_week === dayOfWeek);

              return (
                <button
                  key={dateStr}
                  onClick={() => !isPast && hasAvailability && handleDateClick(date)}
                  disabled={isPast || !hasAvailability}
                  className={`
                    aspect-square rounded-md flex items-center justify-center text-sm font-medium transition-all
                    ${isPast || !hasAvailability ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-indigo-50 cursor-pointer text-gray-700'}
                    ${isToday && !isPast && hasAvailability ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-400' : ''}
                    ${isSelected ? 'bg-indigo-600 text-white hover:bg-indigo-700' : ''}
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="font-medium text-gray-900 flex items-center gap-2 text-sm">
              <Clock size={16} className="text-indigo-600" />
              {selectedDateObj?.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
          </div>
          <div className="p-3">
            {availableTimeSlots.length === 0 ? (
              <div className="flex items-center gap-2 text-gray-500 py-3 text-sm">
                <AlertCircle size={16} />
                <span>{t('booking.noSlotsAvailable')}</span>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                {availableTimeSlots.map((timeSlot) => (
                  <button
                    key={timeSlot}
                    onClick={() => handleTimeSlotClick(timeSlot)}
                    className={`
                      py-2 px-3 rounded-lg text-sm font-medium transition-all
                      ${selectedTime === timeSlot
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {timeSlot}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-indigo-600"></div>
          <span>{t('booking.selected')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-indigo-100 ring-1 ring-indigo-400"></div>
          <span>{t('booking.today')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-200"></div>
          <span>{t('booking.unavailable')}</span>
        </div>
      </div>
    </div>
  );
}
