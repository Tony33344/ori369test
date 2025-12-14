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
    let totalAmount = 0;
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
      totalAmount += itemTotal;

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

    // Add shipping cost if applicable
    if (shippingCost > 0) {
      totalAmount += shippingCost;
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Dostava',
            description: shippingMethod === 'post' ? 'Poštnina' : 'Dostava na dom',
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    if (lineItems.length === 0) {
      return NextResponse.json(
        { error: 'No valid items found' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout?cancelled=true`,
      customer_email: customerEmail || user?.email || undefined,
      metadata: {
        userId: user?.id ? String(user.id) : '',
        bookingId: bookingId ? String(bookingId) : '',
        customerName: customerName || '',
        shippingMethod: shippingMethod || '',
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
        total_amount: totalAmount,
        currency: 'eur',
        status: 'pending',
        payment_method: 'card',
        shipping_method: shippingMethod || null,
        shipping_cost: shippingCost || 0,
        metadata: {
          items: orderItemsData,
          customer: customerMetadata,
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
