// ゲームの進行状態の保存（サーバー側だけで使う）。
// 環境変数 GAME_STORE=db のときは、状態を Supabase の game_runs 表に保存し、
// ブラウザには「記録の番号と版番号」だけを、暗号化して預ける。
// そうでないとき（または、保存に失敗したとき）は、これまでどおり、状態そのものを暗号化して預ける。

import { createClient } from '@supabase/supabase-js';
import type { RunState } from './engine';
import { open, seal } from './token';

export type RunRef = { id: string; ver: number } | null;
type DbToken = { db: 1; id: string; ver: number; exp: number };

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

// 期限切れの記録を、ときどき（約2%）消す
async function sweep() {
  if (Math.random() > 0.02) return;
  try {
    await admin().from('game_runs').delete().lt('expires_at', new Date().toISOString());
  } catch {
    /* 何もしない */
  }
}

// ゲームの開始：記録を作って、ブラウザに預ける文字列を返す
export async function createRun(state: RunState): Promise<string> {
  if (process.env.GAME_STORE === 'db') {
    try {
      const { data, error } = await admin()
        .from('game_runs')
        .insert({ state, version: 0, expires_at: new Date(state.exp).toISOString() })
        .select('id')
        .single();
      if (!error && data?.id) {
        await sweep();
        const t: DbToken = { db: 1, id: data.id as string, ver: 0, exp: state.exp };
        return seal(t);
      }
      console.error('game_runs 作成エラー（従来の方式で始めます）:', error);
    } catch (e) {
      console.error('game_runs 作成例外（従来の方式で始めます）:', e);
    }
  }
  return seal(state);
}

// 預けられた文字列から、状態を取り出す。古い状態や、見つからない記録は null
export async function loadRun(token: string): Promise<{ state: RunState; ref: RunRef } | null> {
  const p = open<Record<string, unknown>>(token);
  if (!p) return null;
  if (p.db === 1) {
    const id = p.id;
    const ver = p.ver;
    const exp = p.exp;
    if (typeof id !== 'string' || typeof ver !== 'number') return null;
    if (typeof exp === 'number' && exp < Date.now()) return null;
    try {
      const { data, error } = await admin().from('game_runs').select('state, version').eq('id', id).maybeSingle();
      if (error || !data) return null;
      if (data.version !== ver) return null; // 古い状態（すでに、先へ進んでいる）
      return { state: data.state as RunState, ref: { id, ver } };
    } catch {
      return null;
    }
  }
  return { state: p as unknown as RunState, ref: null }; // 従来の方式
}

// 次の状態を保存して、次に預ける文字列を返す。版番号が合わなかった（古い・同時の送信）ときは null
export async function saveRun(ref: RunRef, next: RunState): Promise<string | null> {
  if (!ref) return seal(next);
  try {
    const { data, error } = await admin()
      .from('game_runs')
      .update({ state: next, version: ref.ver + 1, updated_at: new Date().toISOString() })
      .eq('id', ref.id)
      .eq('version', ref.ver)
      .select('id');
    if (error || !data || data.length === 0) return null;
    const t: DbToken = { db: 1, id: ref.id, ver: ref.ver + 1, exp: next.exp };
    return seal(t);
  } catch {
    return null;
  }
}

// ゲームの終了：記録を消す。版番号が合わなかったときは false
export async function endRun(ref: RunRef): Promise<boolean> {
  if (!ref) return true;
  try {
    const { data, error } = await admin()
      .from('game_runs')
      .delete()
      .eq('id', ref.id)
      .eq('version', ref.ver)
      .select('id');
    return !error && !!data && data.length > 0;
  } catch {
    return false;
  }
}