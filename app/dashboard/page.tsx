'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, getUserProfile, isAdmin } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, Package, User, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(new Set());
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

    // Load user orders (shop + services)
    const { data: ordersData } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          service_id,
          product_id,
          quantity,
          unit_price,
          total_price,
          services (name),
          shop_products:product_id (name)
        )
      `)
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (ordersData) {
      const rawOrders = ordersData as any[];

      const missingProductIds = new Set<string>();
      const missingServiceIds = new Set<string>();

      for (const o of rawOrders) {
        for (const it of (o.order_items || []) as any[]) {
          const hasName = Boolean(it?.services?.name || it?.shop_products?.name);
          if (!hasName) {
            if (it?.product_id) missingProductIds.add(it.product_id);
            if (it?.service_id) missingServiceIds.add(it.service_id);
          }
        }
      }

      let productsById: Record<string, string> = {};
      let servicesById: Record<string, string> = {};

      if (missingProductIds.size > 0) {
        const { data: productsData, error: productsError } = await supabase
          .from('shop_products')
          .select('id,name')
          .in('id', Array.from(missingProductIds));
        if (productsError) {
          console.warn('Failed to fetch product names for orders:', productsError.message);
        } else {
          productsById = Object.fromEntries((productsData || []).map((p: any) => [p.id, p.name]));
        }
      }

      if (missingServiceIds.size > 0) {
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('id,name')
          .in('id', Array.from(missingServiceIds));
        if (servicesError) {
          console.warn('Failed to fetch service names for orders:', servicesError.message);
        } else {
          servicesById = Object.fromEntries((servicesData || []).map((s: any) => [s.id, s.name]));
        }
      }

      const enrichedOrders = rawOrders.map((o) => {
        const enrichedItems = ((o.order_items || []) as any[]).map((it) => {
          if (it?.services?.name || it?.shop_products?.name) return it;

          const productName = it?.product_id ? productsById[it.product_id] : undefined;
          const serviceName = it?.service_id ? servicesById[it.service_id] : undefined;

          return {
            ...it,
            shop_products: productName ? { name: productName } : it.shop_products,
            services: serviceName ? { name: serviceName } : it.services,
          };
        });

        return {
          ...o,
          order_items: enrichedItems,
        };
      });

      setOrders(enrichedOrders as any);
    }

    setLoading(false);
  };

  const cancelBooking = async (bookingId: string) => {
    if (!confirm(t('dashboard.confirmCancel'))) return;

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) {
      toast.error(t('toast.error'));
    } else {
      toast.success(t('toast.bookingCancelled'));
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

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleOrderExpanded = (orderId: string) => {
    setExpandedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('dashboard.welcome')}, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-gray-600">{t('dashboard.subtitle')}</p>
        </div>

        {adminAccess && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="text-blue-600" size={20} />
              <span className="text-blue-800 font-medium">{t('dashboard.adminAccess')}</span>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('dashboard.goToAdmin')}
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{t('dashboard.stats.totalBookings')}</h3>
              <Calendar className="text-blue-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{t('dashboard.stats.activeBookings')}</h3>
              <Clock className="text-green-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {bookings.filter(b => ['pending', 'confirmed'].includes(b.status)).length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{t('dashboard.stats.profile')}</h3>
              <User className="text-purple-600" size={24} />
            </div>
            <p className="text-sm text-gray-600 mb-3">{profile?.email}</p>
            <Link
              href="/nastavitve"
              className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Settings size={16} />
              <span>{t('dashboard.stats.profile')}</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{t('dashboard.myBookings')}</h2>
              <Link
                href="/rezervacija"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                {t('dashboard.newBooking')}
              </Link>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {bookings.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 mb-4">{t('dashboard.noBookings')}</p>
                <Link
                  href="/rezervacija"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('dashboard.createFirst')}
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
                          {booking.status === 'pending' && t('dashboard.status.pending')}
                          {booking.status === 'confirmed' && t('dashboard.status.confirmed')}
                          {booking.status === 'completed' && t('dashboard.status.completed')}
                          {booking.status === 'cancelled' && t('dashboard.status.cancelled')}
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
                        <p className="mt-2 text-sm text-gray-500 italic">{booking.notes}</p>
                      )}
                    </div>
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        className="ml-4 px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        {t('dashboard.cancel')}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div id="orders" className="bg-white rounded-lg shadow mt-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Moja naročila</h2>
              <Link
                href="/trgovina"
                className="px-4 py-2 bg-[#00B5AD] text-white rounded-lg hover:bg-[#009891] transition-colors"
              >
                Nadaljuj z nakupovanjem
              </Link>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {orders.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">Trenutno nimate naročil.</p>
              </div>
            ) : (
              orders.map((order) => {
                const items = (order.order_items || []) as any[];
                const itemLabels = items
                  .map((it: any) => {
                    const name = it?.services?.name || it?.shop_products?.name;
                    return name ? `${name} ×${it.quantity}` : null;
                  })
                  .filter(Boolean) as string[];

                const itemTitle = (items
                  .map((it: any) => it?.services?.name || it?.shop_products?.name)
                  .filter(Boolean) as string[])
                  .join(', ');

                const reference = order?.metadata?.reference || order?.metadata?.order_reference || order?.metadata?.upn_reference;
                const itemsCount = (order.order_items || []).reduce((sum: number, it: any) => sum + (it?.quantity || 0), 0);
                const customer = order?.metadata?.customer || {};
                const expanded = expandedOrderIds.has(order.id);

                return (
                  <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <button
                      type="button"
                      onClick={() => toggleOrderExpanded(order.id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {itemTitle || 'Naročilo'}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar size={16} />
                              <span>{format(new Date(order.created_at), 'd. MMMM yyyy')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Package size={16} />
                              <span>{itemsCount} kos</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="font-medium">Plačilo:</span>
                              <span>{order.payment_method || order.metadata?.payment_method || 'N/A'}</span>
                            </div>
                            {order.shipping_method && (
                              <div className="flex items-center space-x-1">
                                <span className="font-medium">Dostava:</span>
                                <span>{order.shipping_method}</span>
                              </div>
                            )}
                          </div>

                          {reference && (
                            <p className="mt-2 text-sm text-gray-500 italic">Referenca: {reference}</p>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-lg font-bold text-gray-900">€{Number(order.total_amount).toFixed(2)}</div>
                          {order.shipping_cost != null && Number(order.shipping_cost) > 0 && (
                            <div className="text-xs text-gray-500">Dostava: €{Number(order.shipping_cost).toFixed(2)}</div>
                          )}
                          <div className="mt-2 inline-flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">Podrobnosti</span>
                            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>
                      </div>
                    </button>

                    {expanded && (
                      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs font-semibold text-gray-500 mb-2">Izdelki / storitve</div>
                            <div className="space-y-2">
                              {items.length === 0 ? (
                                <div className="text-sm text-gray-600">N/A</div>
                              ) : (
                                items.map((it: any) => {
                                  const name = it?.services?.name || it?.shop_products?.name || 'Izdelek';
                                  return (
                                    <div key={it.id} className="flex items-start justify-between text-sm gap-3">
                                      <div className="text-gray-900">
                                        <div className="font-medium">{name}</div>
                                        <div className="text-xs text-gray-500">
                                          {it.quantity} × €{Number(it.unit_price).toFixed(2)}
                                        </div>
                                      </div>
                                      <div className="text-gray-700 font-medium">€{Number(it.total_price).toFixed(2)}</div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-semibold text-gray-500 mb-2">Povzetek naročila</div>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Številka naročila</span>
                                <span className="text-gray-900 font-medium">{order.id.substring(0, 8)}...</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Plačilo</span>
                                <span className="text-gray-900 font-medium">{order.payment_method || order.metadata?.payment_method || 'N/A'}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Dostava</span>
                                <span className="text-gray-900 font-medium">{order.shipping_method || order.metadata?.shipping_method || 'N/A'}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Skupaj</span>
                                <span className="text-gray-900 font-bold">€{Number(order.total_amount).toFixed(2)}</span>
                              </div>
                              {reference && (
                                <div className="pt-2 text-xs text-gray-500">Referenca: {reference}</div>
                              )}
                              {(customer?.address || customer?.city || customer?.postal) && (
                                <div className="pt-2 text-xs text-gray-500">
                                  Dostava na: {customer.address || ''}{customer.address ? ', ' : ''}{customer.postal || ''} {customer.city || ''}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
