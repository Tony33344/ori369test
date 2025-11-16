import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, getUserProfile } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await getUserProfile(user.id);
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only images allowed' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const storagePath = `cms/${filename}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('media')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(storagePath);

    // Save media record to database
    const { error: dbError } = await supabase
      .from('media')
      .insert({
        name: file.name,
        url: publicUrl,
        size: file.size,
        mime_type: file.type,
        storage_path: storagePath,
        uploaded_by: user.id
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Still return the URL even if DB record fails
    }

    return NextResponse.json({ url: publicUrl, success: true });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
