import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, eventName, userId, sessionId, pageUrl, referrer, metadata } = body;

    // Get user agent and IP from request
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';

    // Insert analytics event
    const { data, error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: eventType,
        event_name: eventName,
        user_id: userId || null,
        session_id: sessionId,
        page_url: pageUrl,
        referrer: referrer,
        user_agent: userAgent,
        ip_address: ip,
        metadata: metadata || {}
      });

    if (error) {
      console.error('Analytics tracking error:', error);
      return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
