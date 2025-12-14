import { NextResponse } from 'next/server';
import { getReviews } from '@/lib/googlePlaces';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const reviews = await getReviews();
    
    return NextResponse.json({
      success: true,
      reviews,
      source: process.env.GOOGLE_PLACES_API_KEY ? 'google' : 'fallback',
    });
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
