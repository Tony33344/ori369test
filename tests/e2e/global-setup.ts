import { test as setup, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const authFile = 'playwright/.auth/user.json';
const adminAuthFile = 'playwright/.auth/admin.json';

setup('create test user', async ({ page }) => {
  // Create test user
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const testEmail = `test-${Date.now()}@example.com`;
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: 'TestPassword123!',
    options: {
      data: {
        full_name: 'Test User'
      }
    }
  });
  
  if (error) {
    console.error('Failed to create test user:', error);
    return;
  }
  
  // Store auth state
  await page.context().storageState({ path: authFile });
  console.log('Test user created:', testEmail);
});

setup('create admin user', async ({ page }) => {
  const adminEmail = `admin-${Date.now()}@example.com`;
  
  // Login as admin (using existing admin credentials)
  await page.goto('/prijava');
  await page.fill('[name="email"]', 'admin@example.com');
  await page.fill('[name="password"]', 'admin123');
  await page.click('[type="submit"]');
  
  // Wait for login success
  await page.waitForURL('/dashboard');
  
  // Store admin auth state
  await page.context().storageState({ path: adminAuthFile });
  console.log('Admin authenticated');
});

setup('setup test database', async () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  try {
    // Clean up any existing test data
    await supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Insert test services
    const testServices = [
      {
        name: 'Test Massage Therapy',
        slug: 'test-massage-therapy',
        description: 'Test massage therapy service',
        duration: 60,
        price: 75.00,
        is_package: false,
        sessions: 1,
        active: true
      },
      {
        name: 'Test Package',
        slug: 'test-package', 
        description: 'Test therapy package',
        duration: 90,
        price: 200.00,
        is_package: true,
        sessions: 3,
        active: true
      }
    ];
    
    const { error: servicesError } = await supabase
      .from('services')
      .insert(testServices);
    
    if (servicesError) {
      console.error('Failed to insert test services:', servicesError);
    }
    
    // Insert test availability slots
    const testSlots = [
      { day_of_week: 1, start_time: '09:00', end_time: '17:00', active: true },
      { day_of_week: 2, start_time: '09:00', end_time: '17:00', active: true },
      { day_of_week: 3, start_time: '09:00', end_time: '17:00', active: true },
      { day_of_week: 4, start_time: '09:00', end_time: '17:00', active: true },
      { day_of_week: 5, start_time: '09:00', end_time: '17:00', active: true },
    ];
    
    const { error: slotsError } = await supabase
      .from('availability_slots')
      .insert(testSlots);
    
    if (slotsError) {
      console.error('Failed to insert test availability slots:', slotsError);
    }
    
    console.log('Test database setup completed');
  } catch (error) {
    console.error('Test database setup failed:', error);
  }
});
