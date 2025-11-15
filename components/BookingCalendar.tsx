'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n';
import { toast } from 'react-hot-toast';

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

  useEffect(() => {
    if (serviceId) {
      loadBookings();
      loadAvailability();
    }
  }, [serviceId]);

  const loadBookings = async () => {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('date, time_slot, status')
      .eq('service_id', serviceId)
      .or('status.eq.pending,status.eq.confirmed');

    if (error) {
      console.error('Error loading bookings:', error);
      return;
    }

    if (bookings) {
      const bookedEvents = bookings.map(booking => ({
        title: t('booking.booked'),
        start: `${booking.date}T${booking.time_slot}`,
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        display: 'background'
      }));
      setEvents(bookedEvents);
    }
  };

  const loadAvailability = async () => {
    const { data: schedules, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('service_id', serviceId);

    if (error) {
      console.error('Error loading schedules:', error);
      return;
    }

    if (schedules) {
      setAvailableSlots(schedules);
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
      <style jsx global>{`
        .booking-calendar .fc {
          font-family: inherit;
        }
        .booking-calendar .fc-button {
          background-color: #2563eb;
          border-color: #2563eb;
          text-transform: capitalize;
        }
        .booking-calendar .fc-button:hover {
          background-color: #1d4ed8;
          border-color: #1d4ed8;
        }
        .booking-calendar .fc-button-active {
          background-color: #1e40af !important;
          border-color: #1e40af !important;
        }
        .booking-calendar .fc-day-today {
          background-color: #dbeafe !important;
        }
        .booking-calendar .fc-daygrid-day:hover {
          background-color: #f3f4f6;
          cursor: pointer;
        }
        .booking-calendar .fc-daygrid-day.fc-day-selected {
          background-color: #bfdbfe !important;
        }
      `}</style>
      
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek'
        }}
        events={events}
        dateClick={handleDateClick}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        height="auto"
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
      />
    </div>
  );
}
