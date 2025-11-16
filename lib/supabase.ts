import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const globalForSupabase = globalThis as unknown as { supabase?: any };

export const supabase = globalForSupabase.supabase ?? createSupabaseClient(supabaseUrl, supabaseAnonKey);

if (process.env.NODE_ENV !== 'production') {
  globalForSupabase.supabase = supabase;
}

export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          role: 'user' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          role?: 'user' | 'admin';
        };
        Update: {
          full_name?: string | null;
          phone?: string | null;
        };
      };
      services: {
        Row: {
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
          updated_at: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          service_id: string;
          date: string;
          time_slot: string;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          notes: string | null;
          google_calendar_event_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          service_id: string;
          date: string;
          time_slot: string;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          notes?: string | null;
        };
        Update: {
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          notes?: string | null;
          google_calendar_event_id?: string | null;
        };
      };
      availability_slots: {
        Row: {
          id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          active: boolean;
          created_at: string;
        };
      };
    };
  };
};
