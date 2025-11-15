'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, getUserProfile } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { toast } from 'react-hot-toast';
import { Calendar as CalendarIcon, Users, Activity, CheckCircle, XCircle, Edit2, Trash2, ExternalLink, Package, DollarSign, Clock, Plus, BarChart3, FileText } from 'lucide-react';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';

const AnalyticsDashboard = dynamic(() => import('@/components/AnalyticsDashboard'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
});

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

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  duration: number;
  price: number;
  is_package: boolean;
  sessions: number;
  active: boolean;
  created_at: string;
}

interface Order {
  id: string;
  user_id: string;
  stripe_session_id: string;
  stripe_payment_intent_id: string | null;
  total_amount: number;
  currency: string;
  status: string;
  metadata: any;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    services: {
      name: string;
    };
  }[];
}

export default function AdminPage() {
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookings' | 'services' | 'analytics' | 'content' | 'orders'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStats, setOrderStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    paidOrders: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadBookings();
      loadServices();
      loadOrders();
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
      toast.error(t('toast.error'));
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
      toast.error(t('toast.error'));
    } else {
      toast.success(t('toast.statusUpdated'));
      loadBookings();
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm(t('admin.bookings.confirmDelete'))) return;

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (error) {
      toast.error(t('toast.error'));
    } else {
      toast.success(t('toast.bookingCancelled'));
      loadBookings();
    }
  };

  // Services Management
  const loadServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name');

    if (data) {
      setServices(data);
    }
  };

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles (full_name, email),
        order_items (
          id,
          quantity,
          unit_price,
          total_price,
          services (name)
        )
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setOrders(data as any);
      
      const totalRevenue = data.reduce((sum, order) => 
        order.status === 'paid' ? sum + parseFloat(order.total_amount.toString()) : sum, 
        0
      );
      const paidOrders = data.filter(order => order.status === 'paid').length;
      const pendingOrders = data.filter(order => order.status === 'pending').length;
      
      setOrderStats({
        totalRevenue,
        totalOrders: data.length,
        paidOrders,
        pendingOrders
      });
    }
  };

  const saveService = async (serviceData: Partial<Service>) => {
    if (editingService) {
      // Update existing service
      const { error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', editingService.id);

      if (error) {
        toast.error(t('toast.error'));
      } else {
        toast.success(t('toast.serviceUpdated'));
        setShowServiceModal(false);
        setEditingService(null);
        loadServices();
      }
    } else {
      // Create new service
      const { error } = await supabase
        .from('services')
        .insert(serviceData);

      if (error) {
        toast.error(t('toast.error'));
      } else {
        toast.success(t('toast.serviceAdded'));
        setShowServiceModal(false);
        loadServices();
      }
    }
  };

  const deleteService = async (serviceId: string) => {
    if (!confirm(t('admin.services.confirmDelete'))) return;

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);

    if (error) {
      toast.error(t('toast.error'));
    } else {
      toast.success(t('toast.serviceDeleted'));
      loadServices();
    }
  };

  const toggleServiceActive = async (serviceId: string, currentActive: boolean) => {
    const { error } = await supabase
      .from('services')
      .update({ active: !currentActive })
      .eq('id', serviceId);

    if (error) {
      toast.error(t('toast.error'));
    } else {
      toast.success(t('toast.statusUpdated'));
      loadServices();
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
        
        toast.success(t('toast.syncSuccess'));
        loadBookings();
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      toast.error(t('toast.syncError'));
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
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('admin.title')}</h1>
          <p className="text-gray-600">{t('admin.subtitle')}</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'bookings'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarIcon size={20} />
              <span>{t('admin.tabs.bookings')}</span>
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'services'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Package size={20} />
              <span>{t('admin.tabs.services')}</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 size={20} />
              <span>{t('admin.tabs.analytics')}</span>
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'content'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText size={20} />
              <span>Content</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <DollarSign size={20} />
              <span>Orders</span>
            </button>
          </div>
        </div>

        {activeTab === 'bookings' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('admin.stats.total')}</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Activity className="text-blue-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('admin.stats.pending')}</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <CalendarIcon className="text-yellow-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('admin.stats.confirmed')}</p>
                <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
              <CheckCircle className="text-green-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('admin.stats.completed')}</p>
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
              {t('admin.filters.all')} ({stats.total})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('admin.filters.pending')} ({stats.pending})
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'confirmed' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('admin.filters.confirmed')} ({stats.confirmed})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('admin.filters.completed')} ({stats.completed})
            </button>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('admin.bookings.dateTime')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('admin.bookings.client')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('admin.bookings.service')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('admin.bookings.status')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('admin.bookings.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {t('admin.bookings.loading')}
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {t('admin.bookings.noBookings')}
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
                          <option value="pending">{t('dashboard.status.pending')}</option>
                          <option value="confirmed">{t('dashboard.status.confirmed')}</option>
                          <option value="completed">{t('dashboard.status.completed')}</option>
                          <option value="cancelled">{t('dashboard.status.cancelled')}</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => syncToGoogleCalendar(booking)}
                            title={t('admin.bookings.syncCalendar')}
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
          </>
        )}

        {activeTab === 'services' && (
          <>
            {/* Services Management */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('admin.services.manage')}</h2>
                <button
                  onClick={() => {
                    setEditingService(null);
                    setShowServiceModal(true);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} />
                  <span>{t('admin.services.add')}</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('admin.services.name')}</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('admin.services.type')}</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('admin.services.duration')}</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('admin.services.price')}</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('admin.services.status')}</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('admin.bookings.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {services.map((service) => (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{service.name}</div>
                          <div className="text-sm text-gray-500">{service.slug}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                            service.is_package
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {service.is_package ? t('admin.services.package') : t('admin.services.therapy')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1 text-sm text-gray-900">
                            <Clock size={16} />
                            <span>{service.duration} min</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1 text-sm font-medium text-gray-900">
                            <DollarSign size={16} />
                            <span>€{service.price}</span>
                          </div>
                          {service.is_package && service.sessions > 0 && (
                            <div className="text-xs text-gray-500">{service.sessions} seans</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleServiceActive(service.id, service.active)}
                            className={`text-xs px-3 py-1 rounded-full font-medium ${
                              service.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {service.active ? t('admin.services.active') : t('admin.services.inactive')}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingService(service);
                                setShowServiceModal(true);
                              }}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => deleteService(service.id)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}

        {activeTab === 'content' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Management</h2>
            <p className="text-gray-600 mb-6">
              Manage website pages and sections with WordPress-like flexibility.
            </p>
            <Link
              href="/admin/content"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText size={20} />
              <span>Manage Pages & Sections</span>
            </Link>
          </div>
        )}

        {activeTab === 'orders' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-green-600">€{orderStats.totalRevenue.toFixed(2)}</p>
                  </div>
                  <DollarSign className="text-green-600" size={32} />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900">{orderStats.totalOrders}</p>
                  </div>
                  <Package className="text-gray-900" size={32} />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Paid Orders</p>
                    <p className="text-3xl font-bold text-green-600">{orderStats.paidOrders}</p>
                  </div>
                  <CheckCircle className="text-green-600" size={32} />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Orders</p>
                    <p className="text-3xl font-bold text-yellow-600">{orderStats.pendingOrders}</p>
                  </div>
                  <Clock className="text-yellow-600" size={32} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.profiles.full_name}</div>
                          <div className="text-sm text-gray-500">{order.profiles.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.order_items.map(item => item.services.name).join(', ') || 
                             (order.metadata?.serviceName || 'N/A')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          €{order.total_amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === 'paid' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(order.created_at), 'dd.MM.yyyy HH:mm')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {orders.length === 0 && (
                <div className="text-center py-12">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
                  <p className="mt-1 text-sm text-gray-500">No orders have been placed yet.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Service Modal */}
        {showServiceModal && (
          <ServiceModal
            service={editingService}
            onClose={() => {
              setShowServiceModal(false);
              setEditingService(null);
            }}
            onSave={saveService}
          />
        )}
      </div>
    </div>
  );
}

// Service Modal Component
function ServiceModal({
  service,
  onClose,
  onSave
}: {
  service: Service | null;
  onClose: () => void;
  onSave: (data: Partial<Service>) => void;
}) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: service?.name || '',
    slug: service?.slug || '',
    description: service?.description || '',
    duration: service?.duration || 30,
    price: service?.price || 0,
    is_package: service?.is_package || false,
    sessions: service?.sessions || 1,
    active: service?.active ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/č/g, 'c')
      .replace(/š/g, 's')
      .replace(/ž/g, 'z')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {service ? t('admin.services.edit') : t('admin.services.add')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('admin.services.name')} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  name: e.target.value,
                  slug: generateSlug(e.target.value)
                });
              }}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="npr. Elektrostimulacija"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('admin.services.slug')} *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="npr. elektrostimulacija"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('admin.services.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Kratek opis storitve..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('admin.services.duration')} (min) *
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                required
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('admin.services.price')} (€) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_package}
                onChange={(e) => setFormData({ ...formData, is_package: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{t('admin.services.package')}</span>
            </label>

            {formData.is_package && (
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('admin.services.sessions')}
                </label>
                <input
                  type="number"
                  value={formData.sessions}
                  onChange={(e) => setFormData({ ...formData, sessions: parseInt(e.target.value) })}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{t('admin.services.active')}</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('admin.services.cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('admin.services.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
