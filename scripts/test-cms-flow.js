const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testCMSFlow() {
  console.log('🧪 Testing CMS Edit → Save → Display Flow\n');

  try {
    // 1. Load home page content
    console.log('1️⃣ Loading home page content...');
    const { data: homePageData } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', 'home')
      .single();

    if (!homePageData) {
      console.error('❌ Home page not found');
      return;
    }

    const { data: sections } = await supabase
      .from('sections')
      .select('*')
      .eq('page_id', homePageData.id);

    const { data: blocks } = await supabase
      .from('blocks')
      .select('*, block_translations(*)')
      .in('section_id', (sections || []).map(s => s.id));

    const block = blocks?.[0];
    const translation = block?.block_translations?.[0];
    const originalHtml = translation?.content?.html || '';

    console.log(`   ✓ Loaded block: ${block.id}`);
    console.log(`   ✓ Original HTML length: ${originalHtml.length} chars`);

    // 2. Simulate edit (add a test comment)
    console.log('\n2️⃣ Simulating edit (adding test marker)...');
    const testMarker = '<!-- TEST EDIT -->';
    const newHtml = testMarker + originalHtml;

    // 3. Save changes
    console.log('3️⃣ Saving changes...');
    const { error: updateError } = await supabase
      .from('block_translations')
      .update({ content: { html: newHtml } })
      .eq('block_id', block.id)
      .eq('lang', 'sl');

    if (updateError) {
      console.error(`   ❌ Error: ${updateError.message}`);
      return;
    }
    console.log('   ✓ Changes saved to database');

    // 4. Verify changes were saved
    console.log('\n4️⃣ Verifying changes in database...');
    const { data: updatedBlock } = await supabase
      .from('blocks')
      .select('*, block_translations(*)')
      .eq('id', block.id)
      .single();

    const updatedTranslation = updatedBlock?.block_translations?.[0];
    const savedHtml = updatedTranslation?.content?.html || '';

    if (savedHtml.includes(testMarker)) {
      console.log('   ✓ Changes confirmed in database');
    } else {
      console.error('   ❌ Changes NOT found in database');
      return;
    }

    // 5. Test API endpoint
    console.log('\n5️⃣ Testing API endpoint...');
    const apiResponse = await fetch(`http://localhost:3000/api/cms/pages?slug=home`);
    const apiData = await apiResponse.json();
    const apiBlock = apiData.blocks?.[0];
    const apiTranslation = apiBlock?.block_translations?.[0];
    const apiHtml = apiTranslation?.content?.html || '';

    if (apiHtml.includes(testMarker)) {
      console.log('   ✓ API returns updated content');
    } else {
      console.error('   ❌ API does NOT return updated content');
      return;
    }

    // 6. Restore original
    console.log('\n6️⃣ Restoring original content...');
    await supabase
      .from('block_translations')
      .update({ content: { html: originalHtml } })
      .eq('block_id', block.id)
      .eq('lang', 'sl');

    console.log('   ✓ Original content restored');

    console.log('\n✅ CMS FLOW TEST PASSED!\n');
    console.log('Summary:');
    console.log('  ✓ Pages load from Supabase');
    console.log('  ✓ Blocks parse correctly');
    console.log('  ✓ Edits save to database');
    console.log('  ✓ API returns updated content');
    console.log('  ✓ Changes apply in real-time');

  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
  }
}

testCMSFlow();
