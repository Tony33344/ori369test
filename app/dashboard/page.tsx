'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, getUserProfile, isAdmin } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, Package, User, Settings } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminAccess, setAdminAccess] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      window.location.href = '/prijava?redirect=/dashboard';
      return;
    }

    setUser(currentUser);

    const { data: profileData } = await getUserProfile(currentUser.id);
    setProfile(profileData);

    const admin = await isAdmin(currentUser.id);
    setAdminAccess(admin);

    // Load user bookings
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select(`
        *,
        services:service_id (name, duration, price)
      `)
      .eq('user_id', currentUser.id)
      .order('date', { ascending: true })
      .order('time_slot', { ascending: true });

    if (bookingsData) {
      setBookings(bookingsData);
    }

    setLoading(false);
  };

  const cancelBooking = async (bookingId: string) => {
    if (!confirm('Ali ste prepričani, da želite preklicati to rezervacijo?')) return;

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) {
      toast.error('Napaka pri preklicu rezervacije.');
    } else {
      toast.success('Rezervacija preklicana!');
      loadUserData();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Nalaganje...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dobrodošli, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-gray-600">Upravljajte svoje rezervacije in nastavitve</p>
        </div>

        {adminAccess && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="text-blue-600" size={20} />
              <span className="text-blue-800 font-medium">Imate administratorski dostop</span>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Pojdi na Admin Dashboard
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Skupaj rezervacij</h3>
              <Calendar className="text-blue-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Aktivne rezervacije</h3>
              <Clock className="text-green-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {bookings.filter(b => ['pending', 'confirmed'].includes(b.status)).length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Profil</h3>
              <User className="text-purple-600" size={24} />
            </div>
            <p className="text-sm text-gray-600">{profile?.email}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Moje rezervacije</h2>
              <Link
                href="/rezervacija"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Nova rezervacija
              </Link>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {bookings.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 mb-4">Še nimate nobene rezervacije</p>
                <Link
                  href="/rezervacija"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ustvari prvo rezervacijo
                </Link>
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.services.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status === 'pending' && 'Na čakanju'}
                          {booking.status === 'confirmed' && 'Potrjeno'}
                          {booking.status === 'completed' && 'Zaključeno'}
                          {booking.status === 'cancelled' && 'Preklicano'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar size={16} />
                          <span>{format(new Date(booking.date), 'd. MMMM yyyy')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={16} />
                          <span>{booking.time_slot}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Package size={16} />
                          <span>{booking.services.duration} min</span>
                        </div>
                      </div>
                      {booking.notes && (
                        <p className="mt-2 text-sm text-gray-500 italic">Opomba: {booking.notes}</p>
                      )}
                    </div>
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        className="ml-4 px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Prekliči
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
