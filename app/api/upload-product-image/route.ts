import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  console.log('🚀 API route called');
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('🔍 Checking env vars...');
    console.log('URL:', supabaseUrl ? '✅' : '❌');
    console.log('Service Key:', supabaseServiceKey ? '✅' : '❌');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing environment variables');
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    // Use service role key for uploads (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const productId = formData.get('productId') as string;

    console.log('📋 Form data:', { fileName: file?.name, productId });

    if (!file || !productId) {
      return NextResponse.json(
        { error: 'Missing file or productId' },
        { status: 400 }
      );
    }

    console.log('📤 Uploading file:', file.name, 'for product:', productId);

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}-${Date.now()}.${fileExt}`;

    console.log('📁 File name:', fileName);

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Upload successful:', uploadData);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;
    console.log('🔗 Public URL:', publicUrl);

    // Update product with image URL
    const { error: updateError } = await supabase
      .from('shop_products')
      .update({ image_url: publicUrl })
      .eq('id', productId);

    if (updateError) {
      console.error('❌ Update error:', updateError);
      return NextResponse.json(
        { error: `DB update failed: ${updateError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ All done!');
    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      message: 'Image uploaded successfully',
    });
  } catch (error: any) {
    console.error('❌ Caught error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
