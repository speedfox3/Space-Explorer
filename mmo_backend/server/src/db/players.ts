import { supabase } from './supabase.js';
import { Player } from '../models/player.js';

export async function loadPlayer(id: string): Promise<Player | null> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    fuel: data.fuel,
    cargo: data.cargo,
    signals: data.signals ?? [],
    analyses: data.analyses ?? [],

    currentAction: data.current_action ?? undefined,
  };
}

export async function savePlayer(player: Player): Promise<void> {
  await supabase.from('players').upsert({
    id: player.id,
    fuel: player.fuel,
    cargo: player.cargo,
    signals: player.signals,
    analyses: player.analyses,
    current_action: player.currentAction ?? null,
    updated_at: new Date().toISOString(),
  });
}
