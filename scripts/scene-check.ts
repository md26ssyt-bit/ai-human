// 場面のデータの点検：8ターンあるか、空の文章がないか、長すぎないか（全場面・全言語・両方の役）。
//   npx tsx scripts/scene-check.ts

import { SCENE_COUNT } from '../src/lib/game/scenes';
import { TONES } from '../src/lib/game/content';
import type { Role } from '../src/lib/game/content';
import { LANGS, turnTextOf } from '../src/lib/game/text';

let bad = 0;
for (let sc = 0; sc < SCENE_COUNT; sc++) {
  for (const role of ['W', 'M'] as Role[]) {
    for (const lang of LANGS) {
      for (let turn = 0; turn < 8; turn++) {
        let t;
        try {
          t = turnTextOf(role, turn, lang, sc);
        } catch {
          t = undefined;
        }
        const where = `場面${sc} 役${role} ${lang} ターン${turn + 1}`;
        if (!t || !t.line) { console.log(`NG ${where}: 相手のセリフが、ありません`); bad++; continue; }
        if (t.line.length > 120) { console.log(`NG ${where}: セリフが長すぎます（${t.line.length}字）`); bad++; }
        for (const tone of TONES) {
          const c = t.choices?.[tone];
          if (!c) { console.log(`NG ${where}: 選択肢「${tone}」が、空です`); bad++; }
          else if (c.length > 120) { console.log(`NG ${where}: 選択肢「${tone}」が長すぎます`); bad++; }
        }
      }
    }
  }
  console.log(`場面${sc}：点検しました`);
}
console.log(bad === 0 ? '\n問題は、見つかりませんでした。' : `\n問題が ${bad} 件、見つかりました。`);