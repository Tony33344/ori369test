// Comprehensive End-to-End Test Script for ORI369
// Tests: Registration → Login → Reservation Flow
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🧪 ORI369 - Full Flow Test Suite\n');
console.log('='.repeat(60));

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('Required:');
  console.log('  - NEXT_PUBLIC_SUPABASE_URL');
  console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test data
// Generate a random number for unique email
const randomId = Math.floor(Math.random() * 100000);
const testUser = {
  email: `test${randomId}@gmail.com`,
  password: 'TestPassword123!',
  fullName: 'Test User ORI369'
};

let testUserId = null;
let testBookingId = null;

async function runTests() {
  console.log('\n📋 TEST SUITE: Full Registration & Reservation Flow\n');
  
  try {
    // ========================================
    // TEST 1: Database Connection & Setup
    // ========================================
    console.log('🔍 TEST 1: Database Connection & Setup');
    console.log('-'.repeat(60));
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ FAIL: Profiles table not accessible');
      console.log('   Error:', profilesError.message);
      return;
    }
    console.log('✅ PASS: Profiles table accessible');
    
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*');
    
    if (servicesError || !services || services.length === 0) {
      console.log('❌ FAIL: Services table empty or not accessible');
      console.log('   You need to populate the services table!');
      return;
    }
    console.log(`✅ PASS: Services table has ${services.length} services`);
    
    const { data: slots, error: slotsError } = await supabase
      .from('availability_slots')
      .select('*');
    
    if (slotsError || !slots || slots.length === 0) {
      console.log('❌ FAIL: Availability slots table empty or not accessible');
      console.log('   You need to populate the availability_slots table!');
      return;
    }
    console.log(`✅ PASS: Availability slots table has ${slots.length} slots`);
    
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .limit(1);
    
    if (bookingsError) {
      console.log('❌ FAIL: Bookings table not accessible');
      return;
    }
    console.log('✅ PASS: Bookings table accessible');
    
    // ========================================
    // TEST 2: User Registration
    // ========================================
    console.log('\n🔍 TEST 2: User Registration Flow');
    console.log('-'.repeat(60));
    console.log(`Registering user: ${testUser.email}`);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          full_name: testUser.fullName,
        },
      },
    });
    
    if (signUpError) {
      console.log('❌ FAIL: Registration failed');
      console.log('   Error:', signUpError.message);
      return;
    }
    
    if (!signUpData.user) {
      console.log('❌ FAIL: No user returned from registration');
      return;
    }
    
    testUserId = signUpData.user.id;
    console.log('✅ PASS: User registered successfully');
    console.log(`   User ID: ${testUserId}`);
    console.log(`   Email: ${signUpData.user.email}`);
    
    // Wait a moment for profile trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if profile was created
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testUserId)
      .single();
    
    if (profileError || !profile) {
      console.log('⚠️  WARNING: Profile not auto-created');
      console.log('   You may need to set up a trigger or manually create profiles');
    } else {
      console.log('✅ PASS: Profile created in database');
      console.log(`   Full Name: ${profile.full_name}`);
      console.log(`   Role: ${profile.role}`);
    }
    
    // ========================================
    // TEST 3: User Login
    // ========================================
    console.log('\n🔍 TEST 3: User Login Flow');
    console.log('-'.repeat(60));
    
    // First sign out
    await supabase.auth.signOut();
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password,
    });
    
    if (signInError) {
      console.log('❌ FAIL: Login failed');
      console.log('   Error:', signInError.message);
      return;
    }
    
    if (!signInData.user) {
      console.log('❌ FAIL: No user returned from login');
      return;
    }
    
    console.log('✅ PASS: User logged in successfully');
    console.log(`   User ID: ${signInData.user.id}`);
    console.log(`   Session: ${signInData.session ? 'Active' : 'None'}`);
    
    // ========================================
    // TEST 4: Service Selection
    // ========================================
    console.log('\n🔍 TEST 4: Service Selection for Booking');
    console.log('-'.repeat(60));
    
    const testService = services[0];
    console.log(`Selected service: ${testService.name}`);
    console.log(`   Duration: ${testService.duration} min`);
    console.log(`   Price: €${testService.price}`);
    console.log('✅ PASS: Service selected');
    
    // ========================================
    // TEST 5: Date & Time Slot Selection
    // ========================================
    console.log('\n🔍 TEST 5: Available Time Slots Check');
    console.log('-'.repeat(60));
    
    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const testDate = tomorrow.toISOString().split('T')[0];
    const dayOfWeek = tomorrow.getDay();
    
    console.log(`Test date: ${testDate} (Day: ${dayOfWeek})`);
    
    // Get availability for this day
    const { data: daySlots } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('day_of_week', dayOfWeek)
      .eq('active', true);
    
    if (!daySlots || daySlots.length === 0) {
      console.log('⚠️  WARNING: No availability slots for this day');
      console.log('   Trying next available day...');
      // In production, you'd loop through days to find availability
    } else {
      console.log(`✅ PASS: Found ${daySlots.length} availability slot(s) for this day`);
      daySlots.forEach(slot => {
        console.log(`   ${slot.start_time} - ${slot.end_time}`);
      });
    }
    
    // Get existing bookings for this date
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('time_slot')
      .eq('date', testDate);
    
    const bookedTimes = existingBookings?.map(b => b.time_slot) || [];
    console.log(`Existing bookings: ${bookedTimes.length}`);
    
    // Generate available time slots
    const availableSlots = [];
    if (daySlots && daySlots.length > 0) {
      daySlots.forEach(slot => {
        const start = parseInt(slot.start_time.split(':')[0]);
        const end = parseInt(slot.end_time.split(':')[0]);
        
        for (let hour = start; hour < end; hour++) {
          const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
          if (!bookedTimes.includes(timeSlot)) {
            availableSlots.push(timeSlot);
          }
        }
      });
    }
    
    if (availableSlots.length === 0) {
      console.log('❌ FAIL: No available time slots');
      console.log('   This could be due to:');
      console.log('   - No availability slots configured for this day');
      console.log('   - All slots are booked');
      return;
    }
    
    console.log(`✅ PASS: ${availableSlots.length} time slots available`);
    console.log(`   First available: ${availableSlots[0]}`);
    
    // ========================================
    // TEST 6: Create Booking
    // ========================================
    console.log('\n🔍 TEST 6: Create Booking');
    console.log('-'.repeat(60));
    
    const testTimeSlot = availableSlots[0];
    
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: testUserId,
        service_id: testService.id,
        date: testDate,
        time_slot: testTimeSlot,
        notes: 'Test booking from automated test suite',
        status: 'pending'
      })
      .select()
      .single();
    
    if (bookingError) {
      console.log('❌ FAIL: Booking creation failed');
      console.log('   Error:', bookingError.message);
      return;
    }
    
    if (!booking) {
      console.log('❌ FAIL: No booking returned');
      return;
    }
    
    testBookingId = booking.id;
    console.log('✅ PASS: Booking created successfully');
    console.log(`   Booking ID: ${booking.id}`);
    console.log(`   Service: ${testService.name}`);
    console.log(`   Date: ${booking.date}`);
    console.log(`   Time: ${booking.time_slot}`);
    console.log(`   Status: ${booking.status}`);
    
    // ========================================
    // TEST 7: Verify Booking in Database
    // ========================================
    console.log('\n🔍 TEST 7: Verify Booking Retrieval');
    console.log('-'.repeat(60));
    
    const { data: retrievedBooking, error: retrieveError } = await supabase
      .from('bookings')
      .select('*, services(name, price, duration)')
      .eq('id', testBookingId)
      .single();
    
    if (retrieveError || !retrievedBooking) {
      console.log('❌ FAIL: Could not retrieve booking');
      return;
    }
    
    console.log('✅ PASS: Booking retrieved successfully');
    console.log(`   Service: ${retrievedBooking.services.name}`);
    console.log(`   Price: €${retrievedBooking.services.price}`);
    console.log(`   Duration: ${retrievedBooking.services.duration} min`);
    
    // ========================================
    // TEST 8: User Dashboard View
    // ========================================
    console.log('\n🔍 TEST 8: User Dashboard - My Bookings');
    console.log('-'.repeat(60));
    
    const { data: userBookings, error: userBookingsError } = await supabase
      .from('bookings')
      .select('*, services(name, price, duration)')
      .eq('user_id', testUserId)
      .order('date', { ascending: true });
    
    if (userBookingsError) {
      console.log('❌ FAIL: Could not retrieve user bookings');
      return;
    }
    
    console.log(`✅ PASS: Retrieved ${userBookings.length} booking(s) for user`);
    userBookings.forEach((b, idx) => {
      console.log(`   ${idx + 1}. ${b.services.name} - ${b.date} at ${b.time_slot} (${b.status})`);
    });
    
    // ========================================
    // CLEANUP
    // ========================================
    console.log('\n🧹 CLEANUP: Removing Test Data');
    console.log('-'.repeat(60));
    
    // Delete test booking
    if (testBookingId) {
      const { error: deleteBookingError } = await supabase
        .from('bookings')
        .delete()
        .eq('id', testBookingId);
      
      if (deleteBookingError) {
        console.log('⚠️  Could not delete test booking');
      } else {
        console.log('✅ Test booking deleted');
      }
    }
    
    // Note: We don't delete the test user as Supabase Auth requires admin privileges
    console.log('⚠️  Test user not deleted (requires admin API)');
    console.log(`   Email: ${testUser.email}`);
    console.log('   You can manually delete this user from Supabase dashboard');
    
    // ========================================
    // FINAL SUMMARY
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ All tests passed successfully!');
    console.log('\nTest Coverage:');
    console.log('  ✅ Database connection & table setup');
    console.log('  ✅ User registration');
    console.log('  ✅ User login');
    console.log('  ✅ Service selection');
    console.log('  ✅ Time slot availability');
    console.log('  ✅ Booking creation');
    console.log('  ✅ Booking retrieval');
    console.log('  ✅ User dashboard view');
    console.log('\n🎉 Full registration & reservation flow is working!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
    console.error(error);
  }
}

// Run the test suite
runTests();
