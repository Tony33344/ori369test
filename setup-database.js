// Database Setup Script - Populate Supabase with Initial Data
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 ORI369 - Database Setup Script\n');
console.log('='.repeat(60));

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Services data from data.json
const servicesData = [
  {
    name: 'Elektrostimulacija',
    slug: 'elektrostimulacija',
    description: 'Elektrostimulacija aktivira mišično tkivo, izboljšuje krvni obtok in lajša bolečine.',
    duration: 20,
    price: 20.00,
    is_package: false,
    sessions: 1
  },
  {
    name: 'Manualna Terapija',
    slug: 'manualna-terapija',
    description: 'Z nežnimi ročnimi tehnikami terapevt sprošča napetosti in izboljšuje gibljivost.',
    duration: 20,
    price: 30.00,
    is_package: false,
    sessions: 1
  },
  {
    name: 'Tecar Terapija',
    slug: 'tecar-terapija',
    description: 'Napredna terapija s pomočjo radiofrekvenčne energije.',
    duration: 30,
    price: 40.00,
    is_package: false,
    sessions: 1
  },
  {
    name: 'Magnetna Terapija',
    slug: 'magnetna-terapija',
    description: 'Uporaba magnetnih polj za stimulacijo telesa in regeneracijo.',
    duration: 20,
    price: 30.00,
    is_package: false,
    sessions: 1
  },
  {
    name: 'MIS (Magnetna indukcijska stimulacija)',
    slug: 'mis',
    description: 'Magnetna indukcijska stimulacija - revolucionarna terapija.',
    duration: 20,
    price: 30.00,
    is_package: false,
    sessions: 1
  },
  {
    name: 'Laserska Terapija',
    slug: 'laserska-terapija',
    description: 'Neinvazivna metoda z laserskimi svetlobnimi žarki.',
    duration: 10,
    price: 10.00,
    is_package: false,
    sessions: 1
  },
  {
    name: 'Media Taping',
    slug: 'media-taping',
    description: 'Metoda z elastičnimi traki za odpravo bolečin in otekline.',
    duration: 10,
    price: 10.00,
    is_package: false,
    sessions: 1
  },
  {
    name: 'Cupping (Ventuze)',
    slug: 'cupping',
    description: 'Terapija z ventuzami za celjenje in regeneracijo.',
    duration: 30,
    price: 30.00,
    is_package: false,
    sessions: 1
  },
  {
    name: 'Dry Needling',
    slug: 'dryneedeling',
    description: 'Invazivna fizioterapevtska metoda s suhim iglanjem.',
    duration: 30,
    price: 30.00,
    is_package: false,
    sessions: 1
  },
  {
    name: 'Iteracare',
    slug: 'iteracare',
    description: 'Terapija z iteracare tehnologijo.',
    duration: 20,
    price: 20.00,
    is_package: false,
    sessions: 1
  },
  {
    name: 'AO Scan',
    slug: 'ao-scan',
    description: 'Napredno skeniranje za oceno stanja organizma.',
    duration: 30,
    price: 50.00,
    is_package: false,
    sessions: 1
  },
  {
    name: 'Trakcijska miza',
    slug: 'trakcijska-miza',
    description: 'Terapija za razbremenitev hrbtenice.',
    duration: 30,
    price: 40.00,
    is_package: false,
    sessions: 1
  },
  {
    name: 'Skalarni valovi (čakre)',
    slug: 'skalarni-valovi',
    description: 'Uravnovešanje čaker s skalarnimi valovi.',
    duration: 30,
    price: 35.00,
    is_package: false,
    sessions: 1
  },
  {
    name: 'Individualno vodeno dihanje',
    slug: 'vodeno-dihanje',
    description: 'Terapija z vodenim dihanjem.',
    duration: 30,
    price: 30.00,
    is_package: false,
    sessions: 1
  },
  // Packages
  {
    name: 'Prebudi Telo',
    slug: 'prebudi-telo',
    description: '3x Elektrostimulacija, 3x Tacer terapija, 3x Iteracare in masaža, 3x Manualna - Storm terapija, 1x Končna obravnava',
    duration: 60,
    price: 196.00,
    is_package: true,
    sessions: 13
  },
  {
    name: 'Osveščanje Telesa',
    slug: 'osvescanje-telesa',
    description: '6x Elektrostimulacija, 6x Iteracare in masaža, 6x Laser, 6x Tacer terapija, 6x Manualna - Storm terapija, 1x Končna obravnava',
    duration: 60,
    price: 396.00,
    is_package: true,
    sessions: 31
  },
  {
    name: 'Univerzum',
    slug: 'univerzum',
    description: '9x Elektrostimulacija, 9x Tacer terapija in masaža, 9x Trakcijska miza, 9x Manualna - Storm terapija, 9x MIS Magnetna indukcijska stimulacija, 9x Skalarni valovi - uravnovešanje čaker, 3x AO Scan, 1x Moti-physio Scan',
    duration: 90,
    price: 796.00,
    is_package: true,
    sessions: 58
  }
];

// Availability slots
// Day of week: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
const availabilitySlots = [
  // Monday to Friday morning (7-14)
  { day_of_week: 1, start_time: '07:00', end_time: '14:00', active: true },
  { day_of_week: 2, start_time: '07:00', end_time: '14:00', active: true },
  { day_of_week: 3, start_time: '07:00', end_time: '14:00', active: true },
  { day_of_week: 4, start_time: '07:00', end_time: '14:00', active: true },
  { day_of_week: 5, start_time: '07:00', end_time: '14:00', active: true },
  // Monday to Friday evening (16-21)
  { day_of_week: 1, start_time: '16:00', end_time: '21:00', active: true },
  { day_of_week: 2, start_time: '16:00', end_time: '21:00', active: true },
  { day_of_week: 3, start_time: '16:00', end_time: '21:00', active: true },
  { day_of_week: 4, start_time: '16:00', end_time: '21:00', active: true },
  { day_of_week: 5, start_time: '16:00', end_time: '21:00', active: true },
  // Saturday (8-14)
  { day_of_week: 6, start_time: '08:00', end_time: '14:00', active: true }
];

async function setupDatabase() {
  try {
    console.log('\n📋 Step 1: Checking existing data...\n');
    
    // Check services
    const { data: existingServices } = await supabase
      .from('services')
      .select('*');
    
    console.log(`Found ${existingServices?.length || 0} existing services`);
    
    // Check availability slots
    const { data: existingSlots } = await supabase
      .from('availability_slots')
      .select('*');
    
    console.log(`Found ${existingSlots?.length || 0} existing availability slots`);
    
    // Insert services
    if (!existingServices || existingServices.length === 0) {
      console.log('\n📋 Step 2: Inserting services...\n');
      
      for (const service of servicesData) {
        const { data, error } = await supabase
          .from('services')
          .insert(service)
          .select()
          .single();
        
        if (error) {
          console.log(`❌ Error inserting ${service.name}:`, error.message);
        } else {
          console.log(`✅ Inserted: ${service.name} (€${service.price}, ${service.duration}min)`);
        }
      }
    } else {
      console.log('\n⚠️  Services already exist, skipping insertion');
    }
    
    // Insert availability slots
    if (!existingSlots || existingSlots.length === 0) {
      console.log('\n📋 Step 3: Inserting availability slots...\n');
      
      for (const slot of availabilitySlots) {
        const { data, error } = await supabase
          .from('availability_slots')
          .insert(slot)
          .select()
          .single();
        
        if (error) {
          console.log(`❌ Error inserting slot:`, error.message);
        } else {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          console.log(`✅ Inserted: ${days[slot.day_of_week]} ${slot.start_time}-${slot.end_time}`);
        }
      }
    } else {
      console.log('\n⚠️  Availability slots already exist, skipping insertion');
    }
    
    // Final verification
    console.log('\n📋 Step 4: Final verification...\n');
    
    const { data: finalServices } = await supabase
      .from('services')
      .select('*');
    
    const { data: finalSlots } = await supabase
      .from('availability_slots')
      .select('*');
    
    console.log('='.repeat(60));
    console.log('📊 DATABASE SETUP COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Services: ${finalServices?.length || 0}`);
    console.log(`✅ Availability Slots: ${finalSlots?.length || 0}`);
    console.log('\n🎉 Database is ready for testing!');
    console.log('\nNext steps:');
    console.log('  1. Run: node test-supabase.js (to verify setup)');
    console.log('  2. Run: node test-full-flow.js (to test full flow)');
    console.log('  3. Start dev server: npm run dev');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ SETUP FAILED:', error.message);
    console.error(error);
  }
}

setupDatabase();
