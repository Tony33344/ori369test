const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function cleanup() {
  console.log('🧹 Cleaning up test images...\n');

  try {
    // List all files in cms-images bucket
    const { data: files, error: listError } = await supabase
      .storage
      .from('cms-images')
      .list();

    if (listError) {
      console.error(`❌ Error listing files: ${listError.message}`);
      return;
    }

    // Delete test images
    const testFiles = files?.filter(f => f.name.startsWith('test-')) || [];
    
    if (testFiles.length === 0) {
      console.log('✓ No test images to clean up');
      return;
    }

    console.log(`Found ${testFiles.length} test image(s):`);
    
    for (const file of testFiles) {
      const { error: deleteError } = await supabase
        .storage
        .from('cms-images')
        .remove([file.name]);

      if (deleteError) {
        console.log(`  ❌ ${file.name}: ${deleteError.message}`);
      } else {
        console.log(`  ✓ Deleted: ${file.name}`);
      }
    }

    console.log('\n✅ Cleanup completed!');
  } catch (error) {
    console.error(`❌ Cleanup failed: ${error.message}`);
  }
}

cleanup();
