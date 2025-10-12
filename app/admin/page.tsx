'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, getUserProfile } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import { Calendar as CalendarIcon, Users, Activity, CheckCircle, XCircle, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface Booking {
  id: string;
  date: string;
  time_slot: string;
  status: string;
  notes: string | null;
  google_calendar_event_id: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string;
  };
  services: {
    name: string;
    duration: number;
  };
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0
  });

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadBookings();
      subscribeToBookings();
    }
  }, [isAdmin]);

  useEffect(() => {
    filterBookings();
  }, [bookings, filter]);

  const checkAdmin = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      window.location.href = '/prijava?redirect=/admin';
      return;
    }

    const { data: profile } = await getUserProfile(currentUser.id);
    if (!profile || profile.role !== 'admin') {
      toast.error('Nimate dostopa do te strani.');
      window.location.href = '/';
      return;
    }

    setUser(currentUser);
    setIsAdmin(true);
  };

  const loadBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        profiles:user_id (full_name, email, phone),
        services:service_id (name, duration)
      `)
      .order('date', { ascending: true })
      .order('time_slot', { ascending: true });

    if (data) {
      setBookings(data as any);
      calculateStats(data);
    }
    setLoading(false);
  };

  const subscribeToBookings = () => {
    const channel = supabase
      .channel('bookings_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          loadBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const calculateStats = (data: any[]) => {
    setStats({
      total: data.length,
      pending: data.filter(b => b.status === 'pending').length,
      confirmed: data.filter(b => b.status === 'confirmed').length,
      completed: data.filter(b => b.status === 'completed').length
    });
  };

  const filterBookings = () => {
    if (filter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(b => b.status === filter));
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);

    if (error) {
      toast.error('Napaka pri posodabljanju statusa.');
    } else {
      toast.success('Status posodobljen!');
      loadBookings();
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Ali ste prepričani, da želite izbrisati to rezervacijo?')) return;

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (error) {
      toast.error('Napaka pri brisanju.');
    } else {
      toast.success('Rezervacija izbrisana!');
      loadBookings();
    }
  };

  const syncToGoogleCalendar = async (booking: Booking) => {
    try {
      const response = await fetch('/api/google-calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          date: booking.date,
          time: booking.time_slot,
          serviceName: booking.services.name,
          duration: booking.services.duration,
          clientName: booking.profiles.full_name,
          clientEmail: booking.profiles.email
        })
      });

      if (response.ok) {
        const { eventId } = await response.json();
        
        // Update booking with Google Calendar event ID
        await supabase
          .from('bookings')
          .update({ google_calendar_event_id: eventId })
          .eq('id', booking.id);
        
        toast.success('Sinhronizirano z Google Calendar!');
        loadBookings();
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      toast.error('Napaka pri sinhronizaciji. Preverite Google Calendar nastavitve.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Preverjam dostop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Upravljanje rezervacij in statistika</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Skupaj rezervacij</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Activity className="text-blue-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Na čakanju</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <CalendarIcon className="text-yellow-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Potrjeno</p>
                <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
              <CheckCircle className="text-green-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Zaključeno</p>
                <p className="text-3xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <Users className="text-blue-600" size={32} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Vse ({stats.total})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Na čakanju ({stats.pending})
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'confirmed' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Potrjeno ({stats.confirmed})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Zaključeno ({stats.completed})
            </button>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Datum & Čas</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Klient</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Storitev</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Nalaganje...
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Ni rezervacij za prikaz
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {format(new Date(booking.date), 'd. M. yyyy')}
                        </div>
                        <div className="text-sm text-gray-500">{booking.time_slot}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{booking.profiles.full_name}</div>
                        <div className="text-sm text-gray-500">{booking.profiles.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{booking.services.name}</div>
                        <div className="text-sm text-gray-500">{booking.services.duration} min</div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={booking.status}
                          onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                          className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(booking.status)}`}
                        >
                          <option value="pending">Na čakanju</option>
                          <option value="confirmed">Potrjeno</option>
                          <option value="completed">Zaključeno</option>
                          <option value="cancelled">Preklicano</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => syncToGoogleCalendar(booking)}
                            title="Sinhroniziraj z Google Calendar"
                            className={`p-2 rounded-lg transition-colors ${
                              booking.google_calendar_event_id
                                ? 'bg-green-100 text-green-600'
                                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            }`}
                          >
                            <ExternalLink size={18} />
                          </button>
                          <button
                            onClick={() => deleteBooking(booking.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
