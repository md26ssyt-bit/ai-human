// ゲームの進行状態を、暗号化して、ブラウザに預ける（中身は読めず、書き換えもできない）。
// ランキングを作る段階で、サーバーのデータベースに保存する形に切り替える。
 
import crypto from 'crypto';
 
function key(): Buffer {
  const secret =
    process.env.GAME_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-only-secret-change-me' : '');
  if (!secret) throw new Error('GAME_SECRET is not set');
  return crypto.createHash('sha256').update(secret).digest();
}
 
export function seal(obj: unknown): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([cipher.update(JSON.stringify(obj), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64url');
}
 
export function open<T>(token: string): T | null {
  try {
    const buf = Buffer.from(token, 'base64url');
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const enc = buf.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key(), iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
    return JSON.parse(dec.toString('utf8')) as T;
  } catch {
    return null;
  }
}
 