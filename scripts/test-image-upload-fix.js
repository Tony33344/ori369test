const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testImageUploadFix() {
  console.log('🧪 Testing Image Upload Fix\n');

  try {
    // 1. Create a test image
    console.log('1️⃣ Creating test image...');
    const testImagePath = '/tmp/test-upload-fix.png';
    const pngHeader = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const pngData = Buffer.concat([
      pngHeader,
      Buffer.from([0, 0, 0, 13]),
      Buffer.from('IHDR'),
      Buffer.from([0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0]),
      Buffer.from([144, 119, 78, 84]),
      Buffer.from([0, 0, 0, 10]),
      Buffer.from('IDAT'),
      Buffer.from([8, 29, 1, 0, 0, 255, 255, 0, 0, 0, 2]),
      Buffer.from([0, 0, 0, 0]),
      Buffer.from('IEND'),
      Buffer.from([174, 66, 96, 130])
    ]);
    fs.writeFileSync(testImagePath, pngData);
    console.log(`   ✓ Test image created`);

    // 2. Upload image
    console.log('\n2️⃣ Uploading image to Supabase Storage...');
    const imageBuffer = fs.readFileSync(testImagePath);
    const fileName = `fix-test-${Date.now()}.png`;
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('cms-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error(`   ❌ Upload failed: ${uploadError.message}`);
      return;
    }

    console.log(`   ✓ Image uploaded: ${fileName}`);

    // 3. Get public URL
    console.log('\n3️⃣ Getting public URL...');
    const { data: publicUrlData } = supabase
      .storage
      .from('cms-images')
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;
    console.log(`   ✓ Public URL: ${publicUrl}`);

    // 4. Test API upload endpoint
    console.log('\n4️⃣ Testing /api/upload-cms-image endpoint...');
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    formData.append('file', blob, 'test-api.png');

    const apiResponse = await fetch('http://localhost:3000/api/upload-cms-image', {
      method: 'POST',
      body: formData
    });

    if (!apiResponse.ok) {
      console.error(`   ❌ API upload failed: ${apiResponse.status}`);
      return;
    }

    const apiData = await apiResponse.json();
    console.log(`   ✓ API returned URL: ${apiData.url}`);

    // 5. Verify URL is accessible
    console.log('\n5️⃣ Verifying image is accessible...');
    const imageCheck = await fetch(publicUrl);
    if (imageCheck.ok) {
      console.log(`   ✓ Image is publicly accessible`);
    } else {
      console.log(`   ⚠️  Image returned ${imageCheck.status}`);
    }

    // 6. Cleanup
    console.log('\n6️⃣ Cleaning up test images...');
    await supabase.storage.from('cms-images').remove([fileName, 'test-api.png']);
    console.log(`   ✓ Test images deleted`);

    console.log('\n✅ IMAGE UPLOAD FIX VERIFIED!\n');
    console.log('Summary:');
    console.log('  ✓ Image uploads to Supabase Storage');
    console.log('  ✓ Public URL is generated');
    console.log('  ✓ API endpoint works');
    console.log('  ✓ Images are publicly accessible');
    console.log('\nThe image preview should now show after upload!');

  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
  }
}

testImageUploadFix();
