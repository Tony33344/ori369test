// Test Supabase connection and database setup
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('Required:');
  console.log('  - NEXT_PUBLIC_SUPABASE_URL');
  console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test 1: Check profiles table
    console.log('📋 Test 1: Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Profiles table error:', profilesError.message);
    } else {
      console.log('✅ Profiles table exists');
      console.log(`   Found ${profiles?.length || 0} profile(s)`);
    }

    // Test 2: Check services table
    console.log('\n📋 Test 2: Checking services table...');
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*');
    
    if (servicesError) {
      console.log('❌ Services table error:', servicesError.message);
      console.log('   ⚠️  You need to create the services table and populate it!');
    } else {
      console.log('✅ Services table exists');
      console.log(`   Found ${services?.length || 0} service(s)`);
      if (services && services.length > 0) {
        console.log('   Services:');
        services.forEach(s => console.log(`     - ${s.name} (€${s.price}, ${s.duration}min)`));
      } else {
        console.log('   ⚠️  No services found - you need to insert therapy data!');
      }
    }

    // Test 3: Check bookings table
    console.log('\n📋 Test 3: Checking bookings table...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .limit(5);
    
    if (bookingsError) {
      console.log('❌ Bookings table error:', bookingsError.message);
    } else {
      console.log('✅ Bookings table exists');
      console.log(`   Found ${bookings?.length || 0} booking(s)`);
    }

    // Test 4: Check availability_slots table
    console.log('\n📋 Test 4: Checking availability_slots table...');
    const { data: slots, error: slotsError } = await supabase
      .from('availability_slots')
      .select('*');
    
    if (slotsError) {
      console.log('❌ Availability slots table error:', slotsError.message);
      console.log('   ⚠️  You need to create the availability_slots table!');
    } else {
      console.log('✅ Availability slots table exists');
      console.log(`   Found ${slots?.length || 0} slot(s)`);
      if (slots && slots.length > 0) {
        console.log('   Slots:');
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        slots.forEach(s => console.log(`     - ${days[s.day_of_week]}: ${s.start_time} - ${s.end_time}`));
      } else {
        console.log('   ⚠️  No availability slots found - booking won\'t work!');
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    
    const issues = [];
    if (profilesError) issues.push('Profiles table missing/error');
    if (servicesError) issues.push('Services table missing/error');
    if (!services || services.length === 0) issues.push('No services data');
    if (bookingsError) issues.push('Bookings table missing/error');
    if (slotsError) issues.push('Availability slots table missing/error');
    if (!slots || slots.length === 0) issues.push('No availability slots data');

    if (issues.length === 0) {
      console.log('✅ All systems operational!');
      console.log('✅ Database is properly set up');
      console.log('✅ Ready for testing booking flow');
    } else {
      console.log('⚠️  Issues found:');
      issues.forEach(issue => console.log(`   - ${issue}`));
      console.log('\n📝 Action required:');
      console.log('   1. Run the SQL scripts in COMPREHENSIVE_TEST_PLAN.md');
      console.log('   2. Create missing tables in Supabase');
      console.log('   3. Insert sample data for services and availability slots');
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testConnection();
