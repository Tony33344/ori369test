-- Analytics Schema for ORI369 Platform
-- Track page views, booking conversions, and user behavior

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  event_name VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(100),
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Booking Analytics Table
CREATE TABLE IF NOT EXISTS booking_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  booking_time VARCHAR(10),
  status VARCHAR(20) NOT NULL,
  source VARCHAR(50), -- web, mobile, admin
  conversion_time INTEGER, -- seconds from first visit to booking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page Views Table
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL,
  page_title VARCHAR(200),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(100),
  referrer TEXT,
  duration INTEGER, -- seconds spent on page
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Analytics Table (aggregated stats)
CREATE TABLE IF NOT EXISTS service_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  bookings INTEGER DEFAULT 0,
  conversions DECIMAL(5,2) DEFAULT 0, -- conversion rate percentage
  revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(service_id, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_analytics_date ON booking_analytics(booking_date DESC);
CREATE INDEX IF NOT EXISTS idx_booking_analytics_service ON booking_analytics(service_id);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_analytics_date ON service_analytics(date DESC);

-- Row Level Security Policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_analytics ENABLE ROW LEVEL SECURITY;

-- Admin can view all analytics
CREATE POLICY "Admins can view all analytics events"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can view all booking analytics"
  ON booking_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can view all page views"
  ON page_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can view all service analytics"
  ON service_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow anonymous tracking (for page views and events)
CREATE POLICY "Anyone can insert analytics events"
  ON analytics_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can insert page views"
  ON page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Function to update service analytics
CREATE OR REPLACE FUNCTION update_service_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert service analytics for the booking date
  INSERT INTO service_analytics (service_id, date, bookings, revenue)
  VALUES (
    NEW.service_id,
    NEW.date,
    1,
    (SELECT price FROM services WHERE id = NEW.service_id)
  )
  ON CONFLICT (service_id, date)
  DO UPDATE SET
    bookings = service_analytics.bookings + 1,
    revenue = service_analytics.revenue + (SELECT price FROM services WHERE id = NEW.service_id),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update service analytics on booking
CREATE TRIGGER trigger_update_service_analytics
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_service_analytics();

-- Function to calculate conversion rates
CREATE OR REPLACE FUNCTION calculate_conversion_rates()
RETURNS void AS $$
BEGIN
  UPDATE service_analytics sa
  SET 
    conversions = CASE 
      WHEN sa.views > 0 THEN (sa.bookings::DECIMAL / sa.views::DECIMAL) * 100
      ELSE 0
    END,
    updated_at = NOW()
  WHERE sa.date >= CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE analytics_events IS 'Tracks all user events and interactions';
COMMENT ON TABLE booking_analytics IS 'Detailed analytics for each booking';
COMMENT ON TABLE page_views IS 'Tracks page views and user navigation';
COMMENT ON TABLE service_analytics IS 'Aggregated analytics per service per day';
