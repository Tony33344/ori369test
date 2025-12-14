const fetch = require('node-fetch');

async function testWebsiteImageRender() {
  console.log('🧪 Testing Website Image Render\n');

  try {
    // 1. Fetch the MotioScan page
    console.log('1️⃣ Fetching MotioScan website page...');
    const response = await fetch('http://localhost:3000/cms/motioscan');
    
    if (!response.ok) {
      console.error(`   ❌ Failed to fetch: ${response.status}`);
      return;
    }

    const html = await response.text();
    console.log(`   ✓ Page fetched (${html.length} bytes)`);

    // 2. Check for image tags
    console.log('\n2️⃣ Checking for image tags...');
    const hasImg = html.includes('<img');
    const hasFigure = html.includes('<figure');
    const hasImageUrl = html.includes('cms-images');
    
    console.log(`   Has <img> tag: ${hasImg ? '✓' : '❌'}`);
    console.log(`   Has <figure> tag: ${hasFigure ? '✓' : '❌'}`);
    console.log(`   Has image URL: ${hasImageUrl ? '✓' : '❌'}`);

    // 3. Extract image URL
    console.log('\n3️⃣ Extracting image URL...');
    const imgMatch = html.match(/src="([^"]*cms-images[^"]*)"/);
    if (imgMatch) {
      const imageUrl = imgMatch[1];
      console.log(`   ✓ Found image URL: ${imageUrl}`);

      // 4. Verify image is accessible
      console.log('\n4️⃣ Verifying image is accessible...');
      const imgResponse = await fetch(imageUrl);
      if (imgResponse.ok) {
        console.log(`   ✓ Image is accessible (${imgResponse.status})`);
      } else {
        console.log(`   ❌ Image returned ${imgResponse.status}`);
      }
    } else {
      console.log('   ❌ No image URL found in HTML');
    }

    // 5. Check for CSS styling
    console.log('\n5️⃣ Checking for figure styling...');
    const hasStyle = html.includes('figure') && html.includes('max-width');
    console.log(`   Figure styling present: ${hasStyle ? '✓' : '❌'}`);

    console.log('\n✅ WEBSITE IMAGE RENDER TEST COMPLETE\n');
    
    if (hasImg && hasFigure && hasImageUrl && imgMatch) {
      console.log('✓ Image should be visible on the website!');
      console.log('✓ Check http://localhost:3000/cms/motioscan in your browser');
    } else {
      console.log('❌ Image may not be rendering properly');
    }

  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
  }
}

testWebsiteImageRender();
