import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Setup storage bucket for product images
 * GET /api/setup-storage
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Setting up storage bucket...');

    // Create product-images bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b: any) => b.name === 'product-images');

    if (!bucketExists) {
      const { data, error } = await supabase.storage.createBucket('product-images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });

      if (error) {
        console.error('Error creating bucket:', error.message);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      console.log('✅ Bucket created:', data);
    } else {
      console.log('✅ Bucket already exists');
    }

    return NextResponse.json({
      success: true,
      message: 'Storage bucket ready',
    });
  } catch (error: any) {
    console.error('❌ Setup error:', error);
    return NextResponse.json(
      { error: error.message || 'Setup failed' },
      { status: 500 }
    );
  }
}
