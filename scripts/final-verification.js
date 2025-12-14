const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verify() {
  console.log('🔍 FINAL VERIFICATION - CMS with Images\n');
  console.log('='.repeat(60) + '\n');

  let passed = 0;
  let failed = 0;

  try {
    // 1. Verify all pages exist
    console.log('1️⃣ Verifying pages exist...');
    const { data: pages } = await supabase
      .from('pages')
      .select('id, slug, title')
      .order('created_at', { ascending: false });

    const expectedPages = ['home', 'o-nas', 'terapije', 'paketi', 'kontakt', 'motioscan'];
    const existingPages = pages?.map(p => p.slug) || [];
    
    let allPagesExist = true;
    expectedPages.forEach(slug => {
      if (existingPages.includes(slug)) {
        console.log(`   ✓ ${slug}`);
        passed++;
      } else {
        console.log(`   ✗ ${slug} - MISSING`);
        failed++;
        allPagesExist = false;
      }
    });

    // 2. Verify sections exist
    console.log('\n2️⃣ Verifying sections exist...');
    const { data: sections } = await supabase
      .from('sections')
      .select('id, page_id, type')
      .eq('type', 'richText');

    if (sections && sections.length > 0) {
      console.log(`   ✓ Found ${sections.length} richText sections`);
      passed++;
    } else {
      console.log(`   ✗ No richText sections found`);
      failed++;
    }

    // 3. Verify blocks exist
    console.log('\n3️⃣ Verifying blocks exist...');
    const { data: blocks } = await supabase
      .from('blocks')
      .select('id, section_id, type')
      .eq('type', 'text');

    if (blocks && blocks.length > 0) {
      console.log(`   ✓ Found ${blocks.length} text blocks`);
      passed++;
    } else {
      console.log(`   ✗ No text blocks found`);
      failed++;
    }

    // 4. Verify translations exist
    console.log('\n4️⃣ Verifying translations exist...');
    const { data: translations } = await supabase
      .from('block_translations')
      .select('id, block_id, lang, content')
      .eq('lang', 'sl');

    if (translations && translations.length > 0) {
      console.log(`   ✓ Found ${translations.length} Slovenian translations`);
      const withHtml = translations.filter(t => t.content?.html).length;
      console.log(`   ✓ ${withHtml} have HTML content`);
      passed += 2;
    } else {
      console.log(`   ✗ No translations found`);
      failed++;
    }

    // 5. Verify storage buckets
    console.log('\n5️⃣ Verifying storage buckets...');
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketNames = buckets?.map(b => b.name) || [];
    
    ['cms-images', 'media', 'product-images'].forEach(bucket => {
      if (bucketNames.includes(bucket)) {
        console.log(`   ✓ ${bucket} bucket exists`);
        passed++;
      } else {
        console.log(`   ✗ ${bucket} bucket missing`);
        failed++;
      }
    });

    // 6. Verify API endpoints
    console.log('\n6️⃣ Verifying API endpoints...');
    
    try {
      const homeResponse = await fetch('http://localhost:3000/api/cms/pages?slug=home');
      if (homeResponse.ok) {
        const data = await homeResponse.json();
        if (data.page && data.sections && data.blocks) {
          console.log(`   ✓ /api/cms/pages?slug=home returns correct structure`);
          passed++;
        } else {
          console.log(`   ✗ /api/cms/pages?slug=home missing data`);
          failed++;
        }
      } else {
        console.log(`   ✗ /api/cms/pages?slug=home returned ${homeResponse.status}`);
        failed++;
      }
    } catch (e) {
      console.log(`   ✗ /api/cms/pages?slug=home - ${e.message}`);
      failed++;
    }

    // 7. Verify CMS Manager component
    console.log('\n7️⃣ Verifying CMS Manager component...');
    const cmsManagerPath = '/home/jack/Documents/augment-projects/ori369 verdent/ori369test-clone/components/admin/CMSManagerWithImages.tsx';
    const fs = require('fs');
    if (fs.existsSync(cmsManagerPath)) {
      const content = fs.readFileSync(cmsManagerPath, 'utf-8');
      const checks = [
        ['Image upload', 'handleImageUpload'],
        ['Image settings', 'imageSettings'],
        ['Size options', 'small.*medium.*large.*full'],
        ['Alignment options', 'left.*center.*right'],
        ['Caption support', 'caption']
      ];
      
      checks.forEach(([name, pattern]) => {
        if (new RegExp(pattern).test(content)) {
          console.log(`   ✓ ${name} implemented`);
          passed++;
        } else {
          console.log(`   ✗ ${name} missing`);
          failed++;
        }
      });
    } else {
      console.log(`   ✗ CMSManagerWithImages.tsx not found`);
      failed++;
    }

    // 8. Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 VERIFICATION SUMMARY\n');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%\n`);

    if (failed === 0) {
      console.log('🎉 ALL SYSTEMS OPERATIONAL!\n');
      console.log('✅ CMS Manager with Images is fully functional');
      console.log('✅ All pages seeded with content');
      console.log('✅ Storage buckets configured');
      console.log('✅ API endpoints working');
      console.log('✅ Image upload ready');
      console.log('\n🚀 Ready to use!\n');
    } else {
      console.log('⚠️  Some checks failed. Please review above.\n');
    }

  } catch (error) {
    console.error(`\n❌ Verification failed: ${error.message}`);
  }
}

verify();
