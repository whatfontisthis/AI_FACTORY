import { supabase } from '../config/supabase';

// Cache Firebase UID -> Supabase UUID mapping
const uidCache = new Map<string, string>();

export async function getSupabaseUserId(firebaseUid: string): Promise<string> {
  const cached = uidCache.get(firebaseUid);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('firebase_uid', firebaseUid)
    .single();

  if (error || !data) throw new Error('User not found in database');

  uidCache.set(firebaseUid, data.id);
  return data.id;
}
