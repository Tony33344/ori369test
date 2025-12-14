const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setupStorage() {
  console.log('🔧 Setting up Supabase Storage buckets...\n');

  try {
    // Create cms-images bucket
    console.log('1️⃣ Creating cms-images bucket...');
    const { data: bucket1, error: error1 } = await supabase
      .storage
      .createBucket('cms-images', {
        public: true,
        fileSizeLimit: 52428800 // 50MB
      });

    if (error1 && !error1.message.includes('already exists')) {
      console.error(`   ❌ Error: ${error1.message}`);
    } else if (bucket1) {
      console.log('   ✓ cms-images bucket created');
    } else {
      console.log('   ✓ cms-images bucket already exists');
    }

    // Create media bucket
    console.log('2️⃣ Creating media bucket...');
    const { data: bucket2, error: error2 } = await supabase
      .storage
      .createBucket('media', {
        public: true,
        fileSizeLimit: 52428800 // 50MB
      });

    if (error2 && !error2.message.includes('already exists')) {
      console.error(`   ❌ Error: ${error2.message}`);
    } else if (bucket2) {
      console.log('   ✓ media bucket created');
    } else {
      console.log('   ✓ media bucket already exists');
    }

    // List buckets
    console.log('\n3️⃣ Listing all buckets...');
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets();

    if (listError) {
      console.error(`   ❌ Error: ${listError.message}`);
    } else {
      buckets?.forEach(b => {
        console.log(`   ✓ ${b.name} (public: ${b.public})`);
      });
    }

    console.log('\n✅ Storage setup completed!');
  } catch (error) {
    console.error(`❌ Setup failed: ${error.message}`);
  }
}

setupStorage();
