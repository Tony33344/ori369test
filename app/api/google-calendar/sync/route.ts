import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, date, time, serviceName, duration, clientName, clientEmail } = body;

    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Note: In production, you'd need to implement proper OAuth flow
    // For now, this assumes you have a refresh token stored
    // You can get this by implementing the OAuth flow first
    
    // Set credentials (you'll need to get these through OAuth flow)
    // oauth2Client.setCredentials({
    //   refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    // });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Parse date and time
    const [hours, minutes] = time.split(':');
    const startDateTime = new Date(date);
    startDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + duration);

    // Create calendar event
    const event = {
      summary: `ORI 369 - ${serviceName}`,
      description: `Klient: ${clientName}\\nEmail: ${clientEmail}\\nID rezervacije: ${bookingId}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Europe/Ljubljana',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Europe/Ljubljana',
      },
      attendees: [
        { email: clientEmail },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 60 },
        ],
      },
    };

    // Insert event into calendar
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      sendUpdates: 'all', // Send email notifications to attendees
    });

    return NextResponse.json({
      success: true,
      eventId: response.data.id,
      eventLink: response.data.htmlLink
    });

  } catch (error) {
    console.error('Google Calendar sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync with Google Calendar' },
      { status: 500 }
    );
  }
}
