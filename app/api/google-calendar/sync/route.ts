import { NextRequest, NextResponse } from 'next/server';
import { createCalendarEvent } from '@/lib/googleCalendar';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, date, time, serviceName, duration, clientName, clientEmail, clientPhone, notes } = body;

    // Validate required fields
    if (!bookingId || !date || !time || !serviceName || !duration || !clientName || !clientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create calendar event using service account
    const result = await createCalendarEvent({
      bookingId,
      date,
      time,
      serviceName,
      duration,
      clientName,
      clientEmail,
      clientPhone,
      notes,
    });

    return NextResponse.json({
      success: true,
      eventId: result.eventId,
      eventLink: result.eventLink
    });

  } catch (error) {
    console.error('Google Calendar sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync with Google Calendar', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
