// ゲームのセリフの音声ファイルを、まとめて作るスクリプト。
// 使い方（開発サーバー npm run dev を動かしたまま、別のターミナルで）：
//   npx tsx scripts/generate-game-audio.ts
// 開発サーバーが 3001 番のときは：
//   set TTS_BASE=http://localhost:3001 && npx tsx scripts/generate-game-audio.ts
// すでにあるファイルは、飛ばします（途中で止まっても、続きから作れます）。
 
import fs from 'fs';
import path from 'path';
import { allAudioItems } from '../src/lib/game/audioList';
 
const BASE = process.env.TTS_BASE || 'http://localhost:3000';
const OUT = path.join(process.cwd(), 'public', 'game-audio');
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
 
async function main() {
  const items = allAudioItems();
  console.log(`音声ファイル：${items.length} 件（${BASE}/api/tts を使います）`);
  let made = 0, skipped = 0, failed = 0;
 
  for (const [i, item] of items.entries()) {
    const dir = path.join(OUT, item.lang);
    const file = path.join(dir, `${item.id}.mp3`);
    if (fs.existsSync(file) && fs.statSync(file).size > 1000) { skipped++; continue; }
    fs.mkdirSync(dir, { recursive: true });
    try {
      const res = await fetch(`${BASE}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: item.text, character: item.character, lang: item.lang }),
      });
      const type = res.headers.get('content-type') || '';
      if (!res.ok || !(type.includes('audio') || type.includes('octet-stream'))) {
        throw new Error(`状態 ${res.status} / ${type}`);
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 1000) throw new Error('音声が短すぎます');
      fs.writeFileSync(file, buf);
      made++;
      console.log(`[${i + 1}/${items.length}] ${item.lang}/${item.id}.mp3 （${buf.length} バイト）`);
    } catch (e) {
      failed++;
      console.error(`[${i + 1}/${items.length}] 失敗 ${item.lang}/${item.id}:`, (e as Error).message);
    }
    await sleep(150); // 続けて送りすぎない
  }
  console.log(`\n完了：作成 ${made} 件、スキップ ${skipped} 件、失敗 ${failed} 件`);
  if (failed > 0) console.log('失敗があった場合は、もう一度、同じコマンドを実行してください（失敗した分だけ、作り直します）。');
}
 
main();
 