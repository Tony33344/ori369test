import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, getUserProfile } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { data: profile } = await getUserProfile(user.id);
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { block_id, lang, content } = body;

  const { data, error } = await supabase
    .from('block_translations')
    .upsert({ block_id, lang, content }, { onConflict: 'block_id,lang' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, translation: data });
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { data: profile } = await getUserProfile(user.id);
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const block_id = request.nextUrl.searchParams.get('block_id');
  const lang = request.nextUrl.searchParams.get('lang');
  
  if (!block_id || !lang) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

  const { error } = await supabase
    .from('block_translations')
    .delete()
    .eq('block_id', block_id)
    .eq('lang', lang);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
