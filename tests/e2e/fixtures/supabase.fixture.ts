import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials in .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Test data generator
 */
export const testData = {
  user: {
    email: `test-user-${Date.now()}@ori369test.com`,
    password: 'TestPassword123!',
    fullName: 'Test User',
  },
  admin: {
    email: `test-admin-${Date.now()}@ori369test.com`,
    password: 'AdminPassword123!',
    fullName: 'Test Admin',
  },
};

/**
 * Seed test services
 */
export async function seedServices() {
  const services = [
    {
      name: 'Test Therapy Session',
      slug: 'test-therapy',
      description: 'A test therapy session',
      duration: 60,
      price: 50,
      is_package: false,
      sessions: 1,
      active: true,
    },
    {
      name: 'Test Package',
      slug: 'test-package',
      description: 'A test package with multiple sessions',
      duration: 60,
      price: 200,
      is_package: true,
      sessions: 5,
      active: true,
    },
  ];

  const insertedServices = [];
  for (const service of services) {
    const { data, error } = await supabase
      .from('services')
      .upsert(service, { onConflict: 'slug' })
      .select()
      .single();
    
    if (data) insertedServices.push(data);
  }

  return insertedServices;
}

/**
 * Seed availability slots
 */
export async function seedAvailability() {
  const slots = [
    { day_of_week: 1, start_time: '09:00', end_time: '17:00', active: true }, // Monday
    { day_of_week: 2, start_time: '09:00', end_time: '17:00', active: true }, // Tuesday
    { day_of_week: 3, start_time: '09:00', end_time: '17:00', active: true }, // Wednesday
    { day_of_week: 4, start_time: '09:00', end_time: '17:00', active: true }, // Thursday
    { day_of_week: 5, start_time: '09:00', end_time: '17:00', active: true }, // Friday
  ];

  for (const slot of slots) {
    await supabase
      .from('availability_slots')
      .upsert(slot, { onConflict: 'day_of_week,start_time' });
  }
}

/**
 * Create admin user
 */
export async function createAdminUser(email: string, password: string, fullName: string) {
  // Sign up user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (authError) throw authError;

  // Update profile to admin
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', authData.user.id);

    if (profileError) throw profileError;
  }

  return authData;
}

/**
 * Clean up test data
 */
export async function cleanupTestData() {
  // Delete test bookings
  await supabase
    .from('bookings')
    .delete()
    .like('user_id', '%');

  // Delete test users (profiles)
  await supabase
    .from('profiles')
    .delete()
    .or('email.like.*@ori369test.com*');

  // Note: Auth users need to be deleted via Supabase admin API or dashboard
  // For now, we'll just clean up the profiles table
}

/**
 * Get future date for booking tests
 */
export function getFutureDate(daysAhead: number = 2): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  
  // Ensure it's a weekday (Monday-Friday)
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0) { // Sunday
    date.setDate(date.getDate() + 1);
  } else if (dayOfWeek === 6) { // Saturday
    date.setDate(date.getDate() + 2);
  }
  
  return date.toISOString().split('T')[0];
}

/**
 * Get past date for validation tests
 */
export function getPastDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 5);
  return date.toISOString().split('T')[0];
}
