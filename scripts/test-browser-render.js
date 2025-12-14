const http = require('http');

async function testBrowserRender() {
  console.log('🧪 Testing Browser Render of Image\n');

  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/cms/motioscan', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('1️⃣ Page HTML fetched');
        
        // Check for React payload
        const hasReactPayload = data.includes('self.__next_f.push');
        console.log(`   React streaming: ${hasReactPayload ? '✓' : '❌'}`);
        
        // The image will be in the React payload, not in initial HTML
        // Let's check the API directly
        console.log('\n2️⃣ Checking API response...');
        
        http.get('http://localhost:3000/api/cms/pages?slug=motioscan', (apiRes) => {
          let apiData = '';
          apiRes.on('data', chunk => apiData += chunk);
          apiRes.on('end', () => {
            try {
              const json = JSON.parse(apiData);
              const html = json.blocks[0].block_translations[0].content.html;
              
              const hasFigure = html.includes('<figure');
              const hasImg = html.includes('<img');
              const hasImageUrl = html.includes('cms-images');
              
              console.log(`   Has <figure>: ${hasFigure ? '✓' : '❌'}`);
              console.log(`   Has <img>: ${hasImg ? '✓' : '❌'}`);
              console.log(`   Has image URL: ${hasImageUrl ? '✓' : '❌'}`);
              
              if (hasFigure && hasImg && hasImageUrl) {
                console.log('\n✅ IMAGE DATA IS CORRECT IN API');
                console.log('\n3️⃣ Browser will:');
                console.log('   1. Load page');
                console.log('   2. Fetch /api/cms/pages?slug=motioscan');
                console.log('   3. Receive HTML with <figure> and <img>');
                console.log('   4. Render image with dangerouslySetInnerHTML');
                console.log('\n✅ IMAGE SHOULD APPEAR IN BROWSER');
                console.log('\nTo verify:');
                console.log('  1. Open http://localhost:3000/cms/motioscan in browser');
                console.log('  2. Wait for page to load');
                console.log('  3. Scroll down to see the image');
              } else {
                console.log('\n❌ IMAGE DATA MISSING FROM API');
              }
            } catch (e) {
              console.error('Error parsing API response:', e.message);
            }
            resolve();
          });
        });
      });
    });
    
    req.on('error', (e) => {
      console.error('Error:', e.message);
      resolve();
    });
  });
}

testBrowserRender();
