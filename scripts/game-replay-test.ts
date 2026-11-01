// 古い状態の送り直し・同時の送信が、断られるかを調べる（手元の開発サーバーを、動かしたままで実行）。
//   npx tsx scripts/game-replay-test.ts
// GAME_STORE=db のとき：2回目は断られ、同時5回は、成功が1つだけになる。
// GAME_STORE がないとき：従来の方式なので、すべて成功する（これは、既知の弱点）。

const BASE = process.env.GAME_BASE || 'http://localhost:3000';

async function post(path: string, body: unknown): Promise<{ status: number; data: any }> {
  const r = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  let data: any = null;
  try { data = await r.json(); } catch { /* 何もしない */ }
  return { status: r.status, data };
}

async function main() {
  const s = await post('/api/game/start', { role: 'W', lang: 'ja' });
  console.log('開始:', s.status);
  if (s.status !== 200) return;

  const a = await post('/api/game/choose', { token: s.data.token, choice: 0, lang: 'ja' });
  console.log('1回目:', a.status, a.data?.outcome ?? a.data?.error);
  const b = await post('/api/game/choose', { token: s.data.token, choice: 0, lang: 'ja' });
  console.log('同じ状態で、2回目:', b.status, b.data?.outcome ?? b.data?.error);

  const s2 = await post('/api/game/start', { role: 'M', lang: 'ja' });
  const rs = await Promise.all(
    [0, 1, 2, 3, 4].map(() => post('/api/game/choose', { token: s2.data.token, choice: 0, lang: 'ja' }))
  );
  console.log('同時に5回:', rs.map((r) => r.status).join(', '));
}
main();