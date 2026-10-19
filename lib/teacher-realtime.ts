import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from './supabase-client';
export type RealtimeStatus = 'connecting' | 'live' | 'reconnecting';
export function subscribeTeacherScores(onChange: () => void, onStatus: (status: RealtimeStatus) => void, client: SupabaseClient = getSupabase()) {
  onStatus('connecting');
  const channel = client.channel('teacher-score-dashboard')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'game_profiles' }, () => onChange())
    .subscribe(status => {
      onStatus(status === 'SUBSCRIBED' ? 'live' : 'reconnecting');
      if (status === 'SUBSCRIBED') onChange();
    });
  return () => { void client.removeChannel(channel); };
}
