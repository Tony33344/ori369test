const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('🔍 Checking MotioScan content in database\n');

  try {
    // Get motioscan page
    const { data: page } = await supabase
      .from('pages')
      .select('id')
      .eq('slug', 'motioscan')
      .single();

    if (!page) {
      console.log('❌ Page not found');
      return;
    }

    console.log('✓ Found page:', page.id);

    // Get sections
    const { data: sections } = await supabase
      .from('sections')
      .select('id')
      .eq('page_id', page.id);

    if (!sections || sections.length === 0) {
      console.log('❌ No sections found');
      return;
    }

    console.log('✓ Found sections:', sections.length);

    // Get blocks with translations
    const { data: blocks } = await supabase
      .from('blocks')
      .select('id, block_translations(*)')
      .eq('section_id', sections[0].id);

    if (!blocks || blocks.length === 0) {
      console.log('❌ No blocks found');
      return;
    }

    console.log('✓ Found blocks:', blocks.length);

    const block = blocks[0];
    const translation = block.block_translations?.[0];
    
    console.log('\nBlock details:');
    console.log('  ID:', block.id);
    console.log('  Translation lang:', translation?.lang);
    console.log('  HTML length:', translation?.content?.html?.length);
    console.log('  Has <img> tag:', translation?.content?.html?.includes('<img'));
    console.log('  Has <figure> tag:', translation?.content?.html?.includes('<figure'));
    
    console.log('\nHTML content (first 1000 chars):');
    console.log(translation?.content?.html?.substring(0, 1000));

    // Check API response
    console.log('\n\n📡 Checking API response...');
    const apiResponse = await fetch('http://localhost:3000/api/cms/pages?slug=motioscan');
    const apiData = await apiResponse.json();
    
    const apiBlock = apiData.blocks?.[0];
    const apiTranslation = apiBlock?.block_translations?.[0];
    
    console.log('✓ API returned block:', apiBlock?.id);
    console.log('  Has <img> tag:', apiTranslation?.content?.html?.includes('<img'));
    console.log('  Has <figure> tag:', apiTranslation?.content?.html?.includes('<figure'));
    console.log('\nAPI HTML (first 1000 chars):');
    console.log(apiTranslation?.content?.html?.substring(0, 1000));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
