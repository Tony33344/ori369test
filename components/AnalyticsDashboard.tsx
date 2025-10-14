'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { TrendingUp, Users, DollarSign, Calendar, Eye, BarChart3 } from 'lucide-react';

interface AnalyticsStats {
  summary: {
    totalBookings: number;
    confirmedBookings: number;
    totalRevenue: number;
    totalPageViews: number;
    conversionRate: string;
  };
  bookingsByDate: Record<string, number>;
  topServices: Array<{ name: string; bookings: number }>;
  serviceAnalytics: any[];
}

export default function AnalyticsDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/stats?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-500 py-12">
        Failed to load analytics data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Overview</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Bookings</h3>
            <Calendar className="text-blue-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.summary.totalBookings}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Confirmed</h3>
            <Users className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.summary.confirmedBookings}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Revenue</h3>
            <DollarSign className="text-purple-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900">€{stats.summary.totalRevenue.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Page Views</h3>
            <Eye className="text-orange-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.summary.totalPageViews}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Conversion</h3>
            <TrendingUp className="text-teal-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.summary.conversionRate}%</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="text-blue-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">Top Services</h3>
          </div>
          <div className="space-y-3">
            {stats.topServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{service.name}</span>
                    <span className="text-sm font-bold text-gray-900">{service.bookings}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(service.bookings / stats.summary.totalBookings) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bookings Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="text-green-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">Booking Trend</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(stats.bookingsByDate || {})
              .sort(([a], [b]) => b.localeCompare(a))
              .slice(0, 10)
              .map(([date, count]) => (
                <div key={date} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{new Date(date).toLocaleDateString()}</span>
                  <span className="font-semibold text-gray-900">{count} bookings</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Service Performance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Service Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Views</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Bookings</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Conversion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.serviceAnalytics.slice(0, 10).map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{item.services?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.views}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.bookings}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">€{item.revenue}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.conversions}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
