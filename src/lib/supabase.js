// Supabase Configuration
// To connect: replace with your actual Supabase project URL and anon key
// Get these from: https://app.supabase.com → Project Settings → API

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth helpers
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Database helpers
export const getShopByOwner = async (userId) => {
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('owner_id', userId)
    .single();
  return { data, error };
};

export const getShopForEmployee = async (userEmail) => {
  const { data, error } = await supabase
    .from('employees')
    .select('*, shops(*)')
    .eq('email', userEmail)
    .single();
  return { data, error };
};

export const createShop = async (shopData) => {
  const { data, error } = await supabase
    .from('shops')
    .insert([shopData])
    .select()
    .single();
  return { data, error };
};

export const updateShop = async (shopId, updates) => {
  const { data, error } = await supabase
    .from('shops')
    .update(updates)
    .eq('id', shopId)
    .select()
    .single();
  return { data, error };
};

export const getEmployees = async (shopId) => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: true });
  return { data, error };
};

export const createEmployee = async (employeeData) => {
  const { data, error } = await supabase
    .from('employees')
    .insert([employeeData])
    .select()
    .single();
  return { data, error };
};
