/**
 * Setup Verification Script
 * Run this to verify your test environment is properly configured
 * 
 * Usage: npx ts-node tests/e2e/verify-setup.ts
 */

import { supabase } from './fixtures/supabase.fixture';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function verifySetup() {
  console.log('🔍 Verifying E2E Test Setup...\n');

  // Check environment variables
  console.log('1️⃣ Checking environment variables...');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  }
  console.log('✅ Environment variables found\n');

  // Test Supabase connection
  console.log('2️⃣ Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('services').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Supabase connection successful\n');
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    console.error('   Check your credentials and network connection');
    process.exit(1);
  }

  // Check required tables
  console.log('3️⃣ Checking required database tables...');
  const requiredTables = ['profiles', 'services', 'bookings', 'availability_slots'];
  
  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select('count').limit(1);
      if (error) throw error;
      console.log(`   ✅ Table '${table}' exists`);
    } catch (error) {
      console.error(`   ❌ Table '${table}' not found or inaccessible`);
      console.error(`      Error: ${error}`);
      process.exit(1);
    }
  }
  console.log('✅ All required tables exist\n');

  // Check services data
  console.log('4️⃣ Checking test services...');
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('*')
    .eq('active', true);

  if (servicesError) {
    console.error('❌ Error fetching services:', servicesError);
    process.exit(1);
  }

  if (!services || services.length === 0) {
    console.warn('⚠️  No active services found');
    console.warn('   Run global-setup.ts to seed test data');
  } else {
    console.log(`✅ Found ${services.length} active service(s)`);
    services.forEach(s => console.log(`   - ${s.name}`));
  }
  console.log();

  // Check availability slots
  console.log('5️⃣ Checking availability slots...');
  const { data: slots, error: slotsError } = await supabase
    .from('availability_slots')
    .select('*')
    .eq('active', true);

  if (slotsError) {
    console.error('❌ Error fetching availability slots:', slotsError);
    process.exit(1);
  }

  if (!slots || slots.length === 0) {
    console.warn('⚠️  No availability slots found');
    console.warn('   Run global-setup.ts to seed test data');
  } else {
    console.log(`✅ Found ${slots.length} availability slot(s)`);
  }
  console.log();

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Setup verification complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📝 Next steps:');
  console.log('   1. Ensure dev server is running: npm run dev');
  console.log('   2. Install Playwright browsers: npx playwright install chromium');
  console.log('   3. Run tests: npm run test:e2e');
  console.log('   4. View UI mode: npm run test:e2e:ui\n');
}

verifySetup().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});
