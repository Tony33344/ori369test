import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  console.log('🚀 CMS image upload API called');
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing environment variables');
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Missing file' },
        { status: 400 }
      );
    }

    console.log('📤 Uploading CMS image:', file.name);

    const buffer = await file.arrayBuffer();
    const fileExt = file.name.split('.').pop();
    const fileName = `cms-${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cms-images')
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

    const { data: urlData } = supabase.storage
      .from('cms-images')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;
    console.log('🔗 Public URL:', publicUrl);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      imageUrl: publicUrl,
      message: 'Image uploaded successfully',
    });
  } catch (error: any) {
    console.error('❌ Caught error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
