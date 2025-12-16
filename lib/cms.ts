import { supabase } from './supabase';

export interface Page {
  id: string;
  slug: string;
  title: string;
  status: 'published' | 'draft';
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  page_id: string;
  type: string;
  order_index: number;
  visible: boolean;
  settings: any;
  created_at: string;
  updated_at: string;
}

export interface Block {
  id: string;
  section_id: string;
  type: string;
  order_index: number;
  content: any;
  settings: any;
  created_at: string;
  updated_at: string;
}

export interface BlockTranslation {
  id: string;
  block_id: string;
  lang: string;
  content: any;
}

export async function getPageBySlug(slug: string) {
  const { data: page, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !page) return null;

  const { data: sections } = await supabase
    .from('sections')
    .select('*')
    .eq('page_id', page.id)
    .order('order_index', { ascending: true });

  const sectionIds = ((sections as Section[] | null | undefined) || []).map((s: Section) => s.id);
  const { data: blocks } = await supabase
    .from('blocks')
    .select('*, block_translations(*)')
    .in('section_id', sectionIds)
    .order('order_index', { ascending: true });

  return { page, sections: sections || [], blocks: blocks || [] };
}

export async function getAllPages() {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .order('created_at', { ascending: false });

  return data || [];
}

export function getTranslatedContent(block: any, lang: string, fallbackLang: string = 'sl') {
  if (!block) return {};
  
  const translations = block.block_translations || [];
  const translation = translations.find((t: any) => t.lang === lang)
    || translations.find((t: any) => t.lang === fallbackLang);
  
  return translation?.content || block.content || {};
}
