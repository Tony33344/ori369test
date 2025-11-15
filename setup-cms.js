const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('CMS Setup Script');
console.log('='.repeat(60));

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupCMS() {
  try {
    console.log('\nNote: Migrations must be applied via Supabase CLI or Dashboard');
    console.log('  1. supabase/migrations/20250115000000_cms_schema.sql');
    console.log('  2. supabase/seed-cms.sql (optional seed data)');
    console.log('\nChecking CMS tables...\n');
    
    const { data: pages, error: pagesError } = await supabase.from('pages').select('count');
    const { data: sections, error: sectionsError } = await supabase.from('sections').select('count');
    const { data: blocks, error: blocksError } = await supabase.from('blocks').select('count');
    
    if (pagesError) {
      console.error('Pages table not found. Please apply migration 20250115000000_cms_schema.sql');
      console.log('\nHow to apply:');
      console.log('  Option 1: Via Supabase Dashboard > SQL Editor');
      console.log('  Option 2: Via Supabase CLI: supabase db push');
      return;
    }
    
    console.log('CMS tables verified:');
    console.log(`  Pages: ${pages?.[0]?.count || 0}`);
    console.log(`  Sections: ${sections?.[0]?.count || 0}`);
    console.log(`  Blocks: ${blocks?.[0]?.count || 0}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('CMS Setup Ready!');
    console.log('='.repeat(60));
    console.log('\nNext steps:');
    console.log('  1. Start dev server: npm run dev');
    console.log('  2. Visit: http://localhost:3000/admin');
    console.log('  3. Click "Content" tab to manage pages');
    console.log('  4. Create pages and sections');
    console.log('  5. View rendered pages at /cms/{slug}');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\nSetup failed:', error.message);
  }
}

setupCMS();
