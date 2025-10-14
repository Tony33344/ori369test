// Script to Set User as Admin
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔐 ORI369 - Set User as Admin\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setAdmin() {
  // Get email from command line argument
  const email = process.argv[2];
  
  if (!email) {
    console.log('Usage: node set-admin.js <email>');
    console.log('Example: node set-admin.js admin@ori369.com');
    process.exit(1);
  }

  console.log(`Looking for user with email: ${email}\n`);

  // Find user by email in profiles table
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email);

  if (profileError) {
    console.error('❌ Error querying profiles:', profileError.message);
    process.exit(1);
  }

  if (!profiles || profiles.length === 0) {
    console.error('❌ No user found with that email');
    console.log('\nMake sure:');
    console.log('1. User has registered on the website');
    console.log('2. Email is correct');
    console.log('3. Profile was created in database');
    process.exit(1);
  }

  const profile = profiles[0];
  console.log('✅ User found:');
  console.log(`   Name: ${profile.full_name}`);
  console.log(`   Email: ${profile.email}`);
  console.log(`   Current Role: ${profile.role}`);

  if (profile.role === 'admin') {
    console.log('\n⚠️  User is already an admin!');
    process.exit(0);
  }

  // Update role to admin
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', profile.id);

  if (updateError) {
    console.error('\n❌ Error updating role:', updateError.message);
    process.exit(1);
  }

  console.log('\n✅ SUCCESS! User is now an admin!');
  console.log('\nNext steps:');
  console.log('1. User should logout and login again');
  console.log('2. Navigate to /admin');
  console.log('3. Admin panel will be accessible');
}

setAdmin();
