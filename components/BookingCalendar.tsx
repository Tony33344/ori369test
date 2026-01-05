'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

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
  const [events, setEvents] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [googleBusyEvents, setGoogleBusyEvents] = useState<any[]>([]);
  const [bookedEvents, setBookedEvents] = useState<any[]>([]);

  useEffect(() => {
    if (serviceId) {
      loadBookings();
      loadAvailability();
    }
  }, [serviceId]);

  useEffect(() => {
    // Combine all events with proper display
    setEvents([...googleBusyEvents, ...bookedEvents]);
  }, [googleBusyEvents, bookedEvents]);

  const loadBookings = async () => {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('date, time_slot, status, services(duration)')
      .in('status', ['pending', 'confirmed']);

    if (error) {
      console.error('Error loading bookings:', error);
      return;
    }

    if (bookings) {
      const events = bookings.map((booking: any) => {
        const duration = booking.services?.duration || 60;
        const startTime = new Date(`${booking.date}T${booking.time_slot}`);
        const endTime = new Date(startTime.getTime() + duration * 60000);
        
        return {
          title: '🔒 Zasedeno',
          start: startTime.toISOString(),
          end: endTime.toISOString(),
          backgroundColor: '#ef4444',
          borderColor: '#dc2626',
          textColor: '#ffffff',
          classNames: ['booked-event'],
        };
      });
      setBookedEvents(events);
    }
  };

  const loadGoogleBusy = async (timeMin: string, timeMax: string) => {
    try {
      const res = await fetch(`/api/google-calendar/busy?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`);
      if (!res.ok) return;
      const json = await res.json();

      const busy = (json?.busy || []).map((e: any) => {
        const start = e?.start?.dateTime || e?.start?.date;
        const end = e?.end?.dateTime || e?.end?.date;
        return {
          id: e.id,
          title: '📅 ' + (e.summary || 'Zasedeno'),
          start,
          end,
          backgroundColor: '#f97316',
          borderColor: '#ea580c',
          textColor: '#ffffff',
          classNames: ['google-busy-event'],
        };
      });

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

  const handleDateClick = (arg: any) => {
    const clickedDate = arg.dateStr;
    const dayOfWeek = new Date(clickedDate).getDay();
    
    // Check if there's availability for this day
    const daySlots = availableSlots.filter(slot => slot.day_of_week === dayOfWeek);
    
    if (daySlots.length === 0) {
      toast.error(t('booking.noSlotsAvailable'));
      return;
    }

    // For now, just select the date - time selection will be in a separate UI
    onDateSelect(clickedDate, '');
  };

  return (
    <div className="booking-calendar">
      {/* Legend */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500 shadow-sm"></div>
            <span className="text-gray-700">{t('booking.legendBooked')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500 shadow-sm"></div>
            <span className="text-gray-700">{t('booking.legendBusy')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-indigo-100 border-2 border-indigo-300 shadow-sm"></div>
            <span className="text-gray-700">{t('booking.legendToday')}</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .booking-calendar .fc {
          font-family: inherit;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .booking-calendar .fc-toolbar {
          padding: 16px 20px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        }
        .booking-calendar .fc-toolbar-title {
          color: white !important;
          font-weight: 600;
          font-size: 1.25rem;
        }
        .booking-calendar .fc-button {
          background-color: rgba(255,255,255,0.2) !important;
          border-color: rgba(255,255,255,0.3) !important;
          text-transform: capitalize;
          font-weight: 500;
          padding: 10px 18px !important;
          border-radius: 10px !important;
          transition: all 0.2s ease;
        }
        .booking-calendar .fc-button:hover {
          background-color: rgba(255,255,255,0.35) !important;
          border-color: rgba(255,255,255,0.45) !important;
          transform: translateY(-1px);
        }
        .booking-calendar .fc-button-active {
          background-color: rgba(255,255,255,0.45) !important;
          border-color: rgba(255,255,255,0.55) !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .booking-calendar .fc-day-today {
          background-color: #e0e7ff !important;
          box-shadow: inset 0 0 0 2px #6366f1;
        }
        .booking-calendar .fc-daygrid-day {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .booking-calendar .fc-daygrid-day:hover:not(.fc-day-today) {
          background-color: #f0f9ff;
          transform: scale(1.015);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .booking-calendar .fc-daygrid-day.fc-day-selected {
          background-color: #c7d2fe !important;
        }
        .booking-calendar .fc-event {
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          padding: 3px 6px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .booking-calendar .booked-event {
          animation: pulse 2s infinite;
        }
        .booking-calendar .google-busy-event {
          opacity: 0.92;
        }
        .booking-calendar .fc-timegrid-slot {
          height: 44px !important;
          border-color: #e5e7eb;
        }
        .booking-calendar .fc-timegrid-event {
          border-radius: 8px;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.78; }
        }
      `}</style>
      
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events}
        datesSet={(arg: any) => {
          const timeMin = arg.start?.toISOString?.() || new Date(arg.start).toISOString();
          const timeMax = arg.end?.toISOString?.() || new Date(arg.end).toISOString();
          loadGoogleBusy(timeMin, timeMax);
          loadBookings();
        }}
        dateClick={handleDateClick}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        height="auto"
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
        nowIndicator={true}
        locale={t('common.locale')}
        buttonText={{
          today: t('booking.today'),
          month: t('booking.month'),
          week: t('booking.week'),
          day: t('booking.day')
        }}
        validRange={{
          start: new Date().toISOString().split('T')[0],
          end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }}
        eventContent={(arg) => (
          <div className="flex items-center gap-1 px-1 py-0.5 overflow-hidden">
            <span className="truncate">{arg.event.title}</span>
          </div>
        )}
      />
    </div>
  );
}
