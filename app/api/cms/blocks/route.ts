import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  // For now, skip auth check for CMS operations (admin panel only)
  // In production, implement proper session validation

  const body = await request.json();
  const { section_id, type, order_index, content, settings, translations } = body;

  const { data, error } = await supabase
    .from('blocks')
    .insert({ section_id, type, order_index: order_index || 0, content: content || {}, settings: settings || {} })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const block = data;

  // Persist translations if provided
  if (translations && typeof translations === 'object') {
    const rows = Object.entries(translations).map(([lang, c]: any) => ({
      block_id: block.id,
      lang,
      content: c || {},
    }));
    if (rows.length > 0) {
      // Delete existing provided languages then insert new
      const langs = rows.map(r => r.lang);
      await supabase.from('block_translations').delete().eq('block_id', block.id).in('lang', langs);
      const { error: trErr } = await supabase.from('block_translations').insert(rows as any);
      if (trErr) return NextResponse.json({ error: trErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, block });
}

export async function PUT(request: NextRequest) {
  // For now, skip auth check for CMS operations (admin panel only)
  // In production, implement proper session validation

  const body = await request.json();
  const { id, type, order_index, content, settings, translations } = body;

  const { data, error } = await supabase
    .from('blocks')
    .update({ type, order_index, content, settings, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const block = data;

  // Upsert translations if provided
  if (translations && typeof translations === 'object') {
    const rows = Object.entries(translations).map(([lang, c]: any) => ({
      block_id: id,
      lang,
      content: c || {},
    }));
    if (rows.length > 0) {
      const langs = rows.map(r => r.lang);
      await supabase.from('block_translations').delete().eq('block_id', id).in('lang', langs);
      const { error: trErr } = await supabase.from('block_translations').insert(rows as any);
      if (trErr) return NextResponse.json({ error: trErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, block });
}

export async function DELETE(request: NextRequest) {
  // For now, skip auth check for CMS operations (admin panel only)
  // In production, implement proper session validation

  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
