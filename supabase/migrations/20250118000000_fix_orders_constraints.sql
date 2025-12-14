-- Fix orders CHECK constraints to support all payment methods and statuses used by the app

-- Normalize legacy values so constraints can be applied without existing row violations
UPDATE public.orders
SET payment_method = CASE payment_method
  WHEN 'stripe' THEN 'card'
  WHEN 'bank_transfer' THEN 'upn'
  WHEN 'pay_on_arrival' THEN 'cash_delivery'
  ELSE payment_method
END
WHERE payment_method IN ('stripe', 'bank_transfer', 'pay_on_arrival');

UPDATE public.orders
SET status = CASE status
  WHEN 'confirmed' THEN 'paid'
  ELSE status
END
WHERE status = 'confirmed';

-- payment_method constraint
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('card', 'upn', 'cash_pickup', 'cash_delivery'));

-- status constraint (extend to support pending_payment)
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'pending_payment', 'paid', 'cancelled', 'refunded'));
