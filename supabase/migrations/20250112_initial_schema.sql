-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- in minutes
  price DECIMAL(10,2) NOT NULL,
  is_package BOOLEAN DEFAULT FALSE,
  sessions INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE RESTRICT NOT NULL,
  date DATE NOT NULL,
  time_slot TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  google_calendar_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, time_slot) -- Prevent double bookings
);

-- Create availability slots table
CREATE TABLE IF NOT EXISTS public.availability_slots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for services
CREATE POLICY "Anyone can view active services" ON public.services
  FOR SELECT USING (active = TRUE);

CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all bookings" ON public.bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for availability_slots
CREATE POLICY "Anyone can view availability slots" ON public.availability_slots
  FOR SELECT USING (active = TRUE);

CREATE POLICY "Admins can manage availability slots" ON public.availability_slots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default availability slots (Mon-Fri: 7:00-14:00 and 16:00-21:00, Sat: 8:00-14:00)
INSERT INTO public.availability_slots (day_of_week, start_time, end_time) VALUES
  -- Monday
  (1, '07:00', '14:00'),
  (1, '16:00', '21:00'),
  -- Tuesday
  (2, '07:00', '14:00'),
  (2, '16:00', '21:00'),
  -- Wednesday
  (3, '07:00', '14:00'),
  (3, '16:00', '21:00'),
  -- Thursday
  (4, '07:00', '14:00'),
  (4, '16:00', '21:00'),
  -- Friday
  (5, '07:00', '14:00'),
  (5, '16:00', '21:00'),
  -- Saturday
  (6, '08:00', '14:00');

-- Insert services from data.json
INSERT INTO public.services (name, slug, description, duration, price, is_package, sessions) VALUES
  ('Elektrostimulacija', 'elektrostimulacija', 'Elektrostimulacija aktivira mišično tkivo, izboljšuje krvni obtok in lajša bolečine. Uporablja se za rehabilitacijo, regeneracijo in krepitev mišic.', 60, 60.00, FALSE, 1),
  ('Manualna Terapija', 'manualna-terapija', 'Z nežnimi ročnimi tehnikami terapevt sprošča napetosti, izboljšuje gibljivost sklepov in zmanjšuje bolečino. Primerna je za vse vrste mišično-skeletnih težav.', 60, 65.00, FALSE, 1),
  ('TECAR Terapija', 'tecar-terapija', 'Napredna terapija, ki s pomočjo radiofrekvenčne energije pospešuje regeneracijo tkiv, lajša bolečine in izboljšuje cirkulacijo ter presnovo celic.', 60, 70.00, FALSE, 1),
  ('Magnetna Terapija', 'magnetna-terapija', 'Uporaba magnetnih polj za stimulacijo telesa, izboljšanje krvnega obtoka in regeneracijo. Pomaga pri celjenju poškodb in kroničnih bolečinah.', 45, 55.00, FALSE, 1),
  ('MIS', 'mis', 'Magnetna indukcijska stimulacija (MIS) je revolucionarna terapija, ki z inovativnim pristopom zagotavlja izjemne rezultate.', 60, 75.00, FALSE, 1),
  ('Laserska Terapija', 'laserska-terapija', 'Laserska terapija je neinvazivna metoda zdravljenja, ki s pomočjo laserskih svetlobnih žarkov stimulira človeško tkivo z namenom pospešitve celjenja.', 30, 50.00, FALSE, 1),
  ('Media Taping Terapija', 'media-taping', 'Medi taping je metoda zdravljenja, ki z aplikacijo samolepilnih elastičnih trakov na kožo odpravlja bolečine, otekline in druge simptome poškodb.', 30, 40.00, FALSE, 1),
  ('Cupping', 'cupping', 'Terapija z ventuzami (cupping), je manualna tehnika, ki s pomočjo majhnih skodelic (ventuz) pospešuje celjenje, regeneracijo in lajša bolečine.', 45, 55.00, FALSE, 1),
  ('Dryneedeling Terapija', 'dryneedeling', 'Dry needeling (terapija s suhim iglanjem), je invazivna fizioterapevtska metoda, ki s penetracijo tankih igel skozi kožo stimulira tkivo in sproža proces celjenja.', 60, 70.00, FALSE, 1),
  -- Packages
  ('Prebudi Telo', 'prebudi-telo', 'Paket združuje elektrostimulacijo, Tecar terapijo, iteracare z masažo in manualno terapijo Storm.', 240, 220.00, TRUE, 4),
  ('Osveščanje Telesa', 'osvescanje-telesa', 'Intenziven paket z šestimi seansami elektrostimulacije, iteracare, laserja in več.', 360, 350.00, TRUE, 6),
  ('Univerzum', 'univerzum', 'Najobsežnejši paket z MIS, trakcijsko mizo, manualno terapijo in AO Scan.', 480, 550.00, TRUE, 8),
  ('Aktivacija', 'aktivacija', 'Dinamična stimulacija telesa in uma z MIS, vodenim dihanjem in vibracijo.', 300, 300.00, TRUE, 5),
  ('Ravnotežje', 'ravnotezje', 'Umirjanje telesa in uma z vibracijskimi vajami, MIS in uravnoteženjem čaker.', 360, 380.00, TRUE, 6);

-- Enable realtime for bookings table
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
