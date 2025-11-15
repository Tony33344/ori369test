import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, getUserProfile } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  
  if (slug) {
    const { data: page } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { data: sections } = await supabase
      .from('sections')
      .select('*')
      .eq('page_id', page.id)
      .order('order_index', { ascending: true });

    const { data: blocks } = await supabase
      .from('blocks')
      .select('*, block_translations(*)')
      .in('section_id', (sections || []).map(s => s.id))
      .order('order_index', { ascending: true });

    return NextResponse.json({ page, sections, blocks });
  }

  const { data: pages } = await supabase
    .from('pages')
    .select('*')
    .order('created_at', { ascending: false });

  return NextResponse.json({ pages });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { data: profile } = await getUserProfile(user.id);
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { slug, title, status } = body;

  const { data, error } = await supabase
    .from('pages')
    .insert({ slug, title, status: status || 'published' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, page: data });
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { data: profile } = await getUserProfile(user.id);
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { id, slug, title, status } = body;

  const { data, error } = await supabase
    .from('pages')
    .update({ slug, title, status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, page: data });
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { data: profile } = await getUserProfile(user.id);
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
