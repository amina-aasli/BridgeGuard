import { createClient, RealtimeChannel } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabaseConfigured =
  Boolean(url && anonKey && !url.includes('your-project'));

export const supabase = supabaseConfigured
  ? createClient(url, anonKey)
  : null;

export function subscribeSensors(onInsert: (payload: unknown) => void): RealtimeChannel | null {
  if (!supabase) return null;

  return supabase
    .channel('sensors-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensors' }, (payload) => {
      onInsert(payload.new);
    })
    .subscribe();
}
