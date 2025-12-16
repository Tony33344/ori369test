import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, getUserProfile } from '@/lib/auth';

type BookingStatRow = {
  status: string;
  date: string;
  service_id: string | null;
  services?: { name?: string | null; price?: number | null } | null;
};

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await getUserProfile(user.id);
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get booking statistics
    const { data: bookingStats } = await supabase
      .from('bookings')
      .select('status, date, service_id, services(name, price)')
      .gte('date', startDate.toISOString().split('T')[0]);

    // Get page views
    const { data: pageViews } = await supabase
      .from('page_views')
      .select('page_path, created_at')
      .gte('created_at', startDate.toISOString());

    // Get service analytics
    const { data: serviceAnalytics } = await supabase
      .from('service_analytics')
      .select('*, services(name)')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    // Calculate summary stats
    const totalBookings = bookingStats?.length || 0;
    const confirmedBookings = bookingStats?.filter((b: any) => b.status === 'confirmed').length || 0;
    const totalRevenue = bookingStats
      ?.filter((b: any) => b.status === 'confirmed')
      .reduce((sum: number, b: any) => sum + (b.services?.price || 0), 0) || 0;
    const totalPageViews = pageViews?.length || 0;

    // Group bookings by date
    const bookingsByDate = (bookingStats as BookingStatRow[] | null | undefined)?.reduce(
      (acc: Record<string, number>, booking: BookingStatRow) => {
        const date = booking.date;
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date]++;
      return acc;
      },
      {}
    );

    // Top services
    const serviceBookings = bookingStats?.reduce((acc: any, booking: any) => {
      const serviceName = booking.services?.name || 'Unknown';
      if (!acc[serviceName]) {
        acc[serviceName] = 0;
      }
      acc[serviceName]++;
      return acc;
    }, {});

    const topServices = Object.entries(serviceBookings || {})
      .map(([name, count]) => ({ name, bookings: count }))
      .sort((a: any, b: any) => b.bookings - a.bookings)
      .slice(0, 5);

    return NextResponse.json({
      summary: {
        totalBookings,
        confirmedBookings,
        totalRevenue,
        totalPageViews,
        conversionRate: totalPageViews > 0 ? ((totalBookings / totalPageViews) * 100).toFixed(2) : 0
      },
      bookingsByDate,
      topServices,
      serviceAnalytics: serviceAnalytics || []
    });
  } catch (error) {
    console.error('Analytics stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
