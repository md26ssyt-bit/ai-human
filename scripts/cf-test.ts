// Cloudflare Workers AI の試験用スクリプト（本番のコードには、つながっていない）。
//   npx tsx scripts/cf-test.ts list
//   npx tsx scripts/cf-test.ts chat モデル名 [--tokens=1500] [--nothink] [--raw] [--only=0]
//   npx tsx scripts/cf-test.ts tts
// 秘密の値（アカウントID、トークン）は、画面に出さない。

import fs from 'fs';
import path from 'path';

function loadEnv() {
  const file = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*(CLOUDFLARE_ACCOUNT_ID|CLOUDFLARE_AI_TOKEN)\s*=\s*(.*?)\s*$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
}
loadEnv();

const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const TOKEN = process.env.CLOUDFLARE_AI_TOKEN;
if (!ACCOUNT || !TOKEN) {
  console.error('.env.local に、CLOUDFLARE_ACCOUNT_ID と CLOUDFLARE_AI_TOKEN を、入れてください。');
  process.exit(1);
}
const API = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/ai`;
const headers = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

// ---------- 一覧 ----------
async function list() {
  for (const task of ['Text Generation', 'Text-to-Speech']) {
    const res = await fetch(`${API}/models/search?task=${encodeURIComponent(task)}&per_page=100`, { headers });
    const data = (await res.json()) as { success?: boolean; result?: { name: string }[]; errors?: unknown };
    console.log(`\n== ${task}（状態 ${res.status}）==`);
    if (!data.success || !data.result) {
      console.log(JSON.stringify(data.errors ?? data).slice(0, 300));
      continue;
    }
    for (const m of data.result) console.log(m.name);
  }
}

// ---------- 文章 ----------
const RULE =
  '必ず自然な会話文だけを返してください。必ず3文以内で簡潔に答えてください。' +
  '返答の文章の最後に必ず[EMOTION:happy]か[EMOTION:sad]か[EMOTION:angry]か[EMOTION:surprised]か[EMOTION:neutral]のどれか1つだけを、文末に1回だけ付けてください。';

const CASES: { name: string; system: string; user: string }[] = [
  { name: 'ja 相談', system: '必ず日本語で答えてください。あなたは優しく話を聞く相談相手です。相手の気持ちを否定せず、共感的に耳を傾けてください。', user: '最近、仕事がうまくいかなくて、少し疲れています。' },
  { name: 'ja 激辛(女性)', system: '必ず日本語で答えてください。あなたは辛口でドSな女性です。腕組みをするような強気な態度で、ズバズバ物を言ってお説教してください。ただし人格否定はせず、ユーモアのある憎めない毒舌に留め、最後には相手を思う気持ちが伝わるようにしてください。', user: '明日から本気出すって、また決めたんだ。' },
  { name: 'en 相談', system: 'Always respond in English. You are a kind listener. Do not deny the other person\'s feelings; listen with empathy.', user: 'Work has not been going well lately and I feel a bit tired.' },
  { name: 'zh 相談', system: '请务必用中文回答。你是一位温柔倾听的咨询对象。不要否定对方的感受，请带着共情倾听。', user: '最近工作不太顺利，我有点累了。' },
  { name: 'id 相談', system: 'Selalu jawab dalam Bahasa Indonesia. Kamu adalah teman bicara yang mendengarkan dengan lembut. Jangan menyangkal perasaan lawan bicara; dengarkan dengan empati.', user: 'Akhir-akhir ini pekerjaanku tidak lancar dan aku agak lelah.' },
  { name: 'es 相談', system: 'Responde siempre en español. Eres un interlocutor amable que escucha. No niegues los sentimientos de la otra persona; escucha con empatía.', user: 'Últimamente el trabajo no va bien y estoy un poco cansado.' },
];

type Opts = { tokens: number; nothink: boolean; raw: boolean; only: number | null };

type Msg = { content?: string | null; reasoning_content?: string | null; reasoning?: string | null };
type Result = {
  response?: string | null;
  choices?: { message?: Msg; finish_reason?: string | null }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number };
};

async function chat(models: string[], opts: Opts) {
  if (models.length === 0) {
    console.log('モデル名を、1つ以上、指定してください。例：npx tsx scripts/cf-test.ts chat @cf/google/gemma-4-26b-a4b-it');
    return;
  }
  const cases = opts.only === null ? CASES : CASES.filter((_, i) => i === opts.only);
  for (const model of models) {
    console.log(`\n\n######## ${model}（最大 ${opts.tokens} トークン${opts.nothink ? '、考える機能を止める' : ''}）########`);
    for (const c of cases) {
      const t0 = Date.now();
      try {
        const body: Record<string, unknown> = {
          messages: [
            { role: 'system', content: `${c.system} ${RULE}` },
            { role: 'user', content: c.user },
          ],
          max_tokens: opts.tokens,
        };
        if (opts.nothink) body.chat_template_kwargs = { enable_thinking: false };

        const res = await fetch(`${API}/run/${model}`, { method: 'POST', headers, body: JSON.stringify(body) });
        const data = (await res.json()) as { success?: boolean; result?: Result; errors?: unknown };
        const ms = Date.now() - t0;
        const r = data.result;
        const msg = r?.choices?.[0]?.message;
        const text = (r?.response ?? msg?.content ?? '') as string;
        const thought = (msg?.reasoning_content ?? msg?.reasoning ?? '') as string;
        const finish = r?.choices?.[0]?.finish_reason ?? '-';
        const used = r?.usage ? `入力${r.usage.prompt_tokens ?? '?'}／出力${r.usage.completion_tokens ?? '?'}トークン` : '使用量の情報なし';

        if (opts.raw) console.log(`\n[生の内容] ${JSON.stringify(data).slice(0, 1800)}`);

        if (!res.ok || !data.success) {
          console.log(`\n[${c.name}] 失敗（状態 ${res.status}、${ms}ms） ${JSON.stringify(data.errors ?? data).slice(0, 300)}`);
          continue;
        }
        const tags = text.match(/\[EMOTION:(happy|sad|angry|surprised|neutral)\]/g) ?? [];
        const bodyText = text.replace(/\[EMOTION:[a-z]+\]/g, '').trim();
        const sentences = bodyText.split(/[。.!?！？]+/).filter((s) => s.trim().length > 0).length;
        console.log(`\n[${c.name}] ${ms}ms / 感情タグ ${tags.length === 1 ? 'OK' : `NG(${tags.length}個)`} / 約${sentences}文 / ${used} / 終了理由 ${finish} / 考えた文字数 ${thought.length}`);
        console.log(text.trim() || '（本文が、空です）');
      } catch (e) {
        console.log(`\n[${c.name}] 失敗：${(e as Error).message}`);
      }
    }
  }
}

// ---------- 音声 ----------
const TTS_CASES: { name: string; text: string; langs: string[] }[] = [
  { name: 'ja', text: 'こんにちは。今日も一日、おつかれさまでした。', langs: ['jp', 'ja'] },
  { name: 'zh', text: '你好，今天辛苦了。', langs: ['zh'] },
  { name: 'id', text: 'Halo, terima kasih sudah bekerja keras hari ini.', langs: ['id'] },
  { name: 'es', text: 'Hola, gracias por tu esfuerzo de hoy.', langs: ['es'] },
  { name: 'en', text: 'Hello, thank you for your hard work today.', langs: ['en'] },
];

async function tts() {
  const dir = path.join(process.cwd(), 'tts-test');
  fs.mkdirSync(dir, { recursive: true });
  for (const c of TTS_CASES) {
    for (const code of c.langs) {
      try {
        const res = await fetch(`${API}/run/@cf/myshell-ai/melotts`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ prompt: c.text, lang: code }),
        });
        const type = res.headers.get('content-type') || '';
        let buf: Buffer | null = null;
        let note = '';
        if (type.includes('json')) {
          const data = (await res.json()) as { result?: { audio?: string } | string; errors?: unknown };
          const audio = typeof data.result === 'object' ? data.result?.audio : data.result;
          if (typeof audio === 'string' && audio.length > 100) buf = Buffer.from(audio, 'base64');
          else note = JSON.stringify(data.errors ?? data).slice(0, 200);
        } else if (res.ok) {
          buf = Buffer.from(await res.arrayBuffer());
        }
        if (buf && buf.length > 1000) {
          const file = path.join(dir, `${c.name}-${code}.mp3`);
          fs.writeFileSync(file, buf);
          console.log(`${c.name}（lang=${code}）：作成 ${file}（${buf.length} バイト）`);
        } else {
          console.log(`${c.name}（lang=${code}）：失敗（状態 ${res.status}） ${note}`);
        }
      } catch (e) {
        console.log(`${c.name}（lang=${code}）：失敗 ${(e as Error).message}`);
      }
    }
  }
  console.log('\ntts-test フォルダの mp3 を、1つずつ、聞いて確かめてください。');
}

async function main() {
  const args = process.argv.slice(3);
  const flag = (name: string) => args.find((a) => a.startsWith(`--${name}`));
  const tokensArg = flag('tokens=');
  const onlyArg = flag('only=');
  const opts: Opts = {
    tokens: tokensArg ? Number(tokensArg.split('=')[1]) || 300 : 300,
    nothink: !!flag('nothink'),
    raw: !!flag('raw'),
    only: onlyArg ? Number(onlyArg.split('=')[1]) : null,
  };
  const names = args.filter((a) => !a.startsWith('--'));
  const cmd = process.argv[2];
  if (cmd === 'list') await list();
  else if (cmd === 'chat') await chat(names, opts);
  else if (cmd === 'tts') await tts();
  else console.log('使い方：list / chat モデル名... / tts');
}
main();