import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { serviceId, language = 'sl' } = await req.json();

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single();

    if (serviceError || !service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = service.stripe_price_id
      ? [
          { price: service.stripe_price_id, quantity: 1 },
        ]
      : [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: service.name,
                description: service.description || '',
              },
              unit_amount: Math.round(Number(service.price) * 100),
            },
            quantity: 1,
          },
        ];

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${baseUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/terapije/${service.slug}?payment=cancelled`,
      customer_email: user.email || undefined,
      metadata: {
        userId: String(user.id),
        serviceId: String(service.id),
        language: String(language),
      },
    });

    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        stripe_session_id: session.id,
        total_amount: service.price,
        currency: 'eur',
        status: 'pending',
        metadata: {
          serviceId: service.id,
          serviceName: service.name,
          language,
        },
      });

    if (orderError) {
      console.error('Error creating order:', orderError);
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
