import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface CheckoutItem {
  serviceId?: string;
  productId?: string;
  quantity: number;
  type?: 'service' | 'product';
  bookingDate?: string;
  bookingTime?: string;
}

type DiscountAppliesTo = 'all' | 'products' | 'services';

interface DiscountCode {
  code: string;
  percent_off: number;
  applies_to: DiscountAppliesTo;
  min_subtotal: number | null;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const { 
      items, 
      serviceId, 
      bookingId,
      customerEmail, 
      customerName,
      shippingMethod,
      shippingCost = 0,
      discountCode,
      metadata: customerMetadata,
      language = 'sl' 
    } = body;

    // Support both old single-service format and new multi-item format
    const checkoutItems: CheckoutItem[] = items || (serviceId ? [{ serviceId, quantity: 1 }] : []);
    
    if (checkoutItems.length === 0) {
      return NextResponse.json(
        { error: 'No items provided for checkout' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let itemsSubtotal = 0;
    let servicesSubtotal = 0;
    let productsSubtotal = 0;
    const orderItemsData: any[] = [];

    // Process each item
    for (const item of checkoutItems) {
      const itemId = item.serviceId || item.productId;
      if (!itemId) continue;

      // Fetch from services or products table
      const isProduct = item.type === 'product';
      const tableName = isProduct ? 'shop_products' : 'services';
      
      const { data: itemData, error: itemError } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', itemId)
        .single();

      if (itemError || !itemData) {
        console.error(`Item not found: ${itemId}`, itemError);
        continue;
      }

      const itemTotal = Number(itemData.price) * item.quantity;
      itemsSubtotal += itemTotal;
      if (isProduct) productsSubtotal += itemTotal;
      else servicesSubtotal += itemTotal;

      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: itemData.name,
            description: itemData.description || '',
          },
          unit_amount: Math.round(Number(itemData.price) * 100),
        },
        quantity: item.quantity,
      });

      orderItemsData.push({
        itemId,
        itemName: itemData.name,
        type: item.type || 'service',
        quantity: item.quantity,
        unitPrice: itemData.price,
        totalPrice: itemTotal,
        bookingDate: item.bookingDate,
        bookingTime: item.bookingTime,
      });
    }

    let appliedDiscount: DiscountCode | null = null;
    let discountAmount = 0;
    let discountPercent: number | null = null;
    let appliedDiscountCode: string | null = null;

    if (discountCode && typeof discountCode === 'string') {
      const code = discountCode.trim();
      if (code) {
        const { data: dcData, error: dcError } = await supabase
          .from('discount_codes')
          .select('code,percent_off,applies_to,min_subtotal')
          .ilike('code', code)
          .limit(1)
          .maybeSingle();

        if (!dcError && dcData) {
          const dc = dcData as any as DiscountCode;
          const min = dc.min_subtotal != null ? Number(dc.min_subtotal) : 0;
          if (min <= 0 || itemsSubtotal >= min) {
            appliedDiscount = dc;
            appliedDiscountCode = dc.code;
            discountPercent = Number(dc.percent_off) || null;
            const eligibleSubtotal = dc.applies_to === 'products'
              ? productsSubtotal
              : dc.applies_to === 'services'
                ? servicesSubtotal
                : itemsSubtotal;
            const pct = Number(dc.percent_off) || 0;
            if (pct > 0 && eligibleSubtotal > 0) {
              const raw = (eligibleSubtotal * pct) / 100;
              discountAmount = Math.round(raw * 100) / 100;
            }
          }
        }
      }
    }

    const subtotalAfterDiscount = Math.max(0, itemsSubtotal - discountAmount);
    const totalAmount = subtotalAfterDiscount + (Number(shippingCost) || 0);

    if (lineItems.length === 0) {
      return NextResponse.json(
        { error: 'No valid items found' },
        { status: 400 }
      );
    }

    let stripeDiscounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
    if (discountAmount > 0) {
      const amountOffCents = Math.max(1, Math.round(discountAmount * 100));
      const coupon = await stripe.coupons.create({
        amount_off: amountOffCents,
        currency: 'eur',
        duration: 'once',
        name: appliedDiscountCode ? `ORI369 ${appliedDiscountCode}` : 'ORI369 Discount',
      });
      stripeDiscounts = [{ coupon: coupon.id }];
    }

    const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] | undefined =
      shippingCost > 0
        ? [
            {
              shipping_rate_data: {
                display_name: shippingMethod === 'post' ? 'Poštnina' : 'Dostava',
                type: 'fixed_amount',
                fixed_amount: {
                  currency: 'eur',
                  amount: Math.round(Number(shippingCost) * 100),
                },
              },
            },
          ]
        : undefined;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      discounts: stripeDiscounts,
      shipping_options: shippingOptions,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout?cancelled=true`,
      customer_email: customerEmail || user?.email || undefined,
      metadata: {
        userId: user?.id ? String(user.id) : '',
        bookingId: bookingId ? String(bookingId) : '',
        customerName: customerName || '',
        shippingMethod: shippingMethod || '',
        shippingCost: String(shippingCost || 0),
        discountCode: appliedDiscountCode || '',
        discountAmount: String(discountAmount || 0),
        language: String(language),
        ...customerMetadata,
      },
    });

    // Best-effort: link Stripe session to booking immediately (if provided)
    if (bookingId) {
      try {
        await supabase
          .from('bookings')
          .update({
            stripe_session_id: session.id,
            payment_status: 'pending',
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId);
      } catch (e) {
        console.error('Failed to update booking with stripe_session_id:', e);
      }
    }

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id || null,
        stripe_session_id: session.id,
        subtotal_amount: itemsSubtotal,
        discount_code: appliedDiscountCode,
        discount_percent: discountPercent,
        discount_amount: discountAmount > 0 ? discountAmount : null,
        total_amount: totalAmount,
        currency: 'eur',
        status: 'pending',
        payment_method: 'card',
        shipping_method: shippingMethod || null,
        shipping_cost: shippingCost || 0,
        metadata: {
          items: orderItemsData,
          customer: customerMetadata,
          discount: appliedDiscount
            ? {
                code: appliedDiscount.code,
                percent_off: appliedDiscount.percent_off,
                applies_to: appliedDiscount.applies_to,
                discount_amount: discountAmount,
              }
            : null,
          language,
        },
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
    }

    // Create order items if order was created
    if (order && orderItemsData.length > 0) {
      const orderItems = orderItemsData.map(item => ({
        order_id: order.id,
        service_id: item.type === 'service' ? item.itemId : null,
        product_id: item.type === 'product' ? item.itemId : null,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
        metadata: item.bookingDate ? { bookingDate: item.bookingDate, bookingTime: item.bookingTime } : null,
      }));

      await supabase.from('order_items').insert(orderItems);
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
