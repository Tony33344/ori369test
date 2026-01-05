import { NextRequest, NextResponse } from 'next/server';
import { listEventsInRange } from '@/lib/googleCalendar';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeMin = searchParams.get('timeMin');
    const timeMax = searchParams.get('timeMax');

    if (!timeMin || !timeMax) {
      return NextResponse.json({ error: 'Missing timeMin/timeMax' }, { status: 400 });
    }

    const events = await listEventsInRange(timeMin, timeMax);

    const busy = events
      .filter((e) => e.start && e.end)
      .map((e) => ({
        id: e.id,
        summary: e.summary || 'Busy',
        start: e.start?.dateTime || e.start?.date,
        end: e.end?.dateTime || e.end?.date,
      }));

    console.log(`Google Calendar: Found ${busy.length} events between ${timeMin} and ${timeMax}`);
    return NextResponse.json({ busy });
  } catch (error) {
    console.error('Google Calendar busy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch busy events', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
