import { supabase } from './supabase';

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  options?: { phone?: string; address?: string; city?: string; postal?: string; gdprConsentAt?: string }
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: options?.phone || null,
        address: options?.address || null,
        city: options?.city || null,
        postal: options?.postal || null,
        gdpr_consent_at: options?.gdprConsentAt || null,
      },
    },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
}

export async function isAdmin(userId: string) {
  const { data } = await getUserProfile(userId);
  return data?.role === 'admin';
}
