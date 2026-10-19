import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { RequestError } from './request-error';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
export const CLOUD_MODE = Boolean(url && key);
export const CLOUD_CONFIGURATION_ERROR = Boolean(url) !== Boolean(key);
let client: SupabaseClient | undefined;
export function getSupabase() {
  if (!CLOUD_MODE) throw new RequestError('ยังไม่ได้เชื่อมฐานข้อมูลออนไลน์', 503);
  if (!client) client = createClient(url, key, { auth: { detectSessionInUrl: false }, realtime: { params: { eventsPerSecond: 5 } } });
  return client;
}
