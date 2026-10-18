// 音声ファイルを作るための、全セリフの一覧（スクリプト scripts/generate-game-audio.ts が使う）。
 
import { ARCHETYPES, SCENE_1 } from './content';
import type { Role } from './content';
import { LANGS, audioIds, endLineOf, reactionTextOf, turnTextOf } from '../../pages/api/game/text';
import type { Lang } from '../../pages/api/game/text';
 
export type AudioItem = { lang: Lang; id: string; text: string; character: 'woman' | 'man' };
 
export function allAudioItems(): AudioItem[] {
  const items: AudioItem[] = [];
  for (const lang of LANGS) {
    for (const role of ['W', 'M'] as Role[]) {
      // 相手の性別：女性役のとき相手は男性、男性役のとき相手は女性
      const character: 'woman' | 'man' = role === 'W' ? 'man' : 'woman';
      SCENE_1[role].forEach((_, i) => {
        items.push({ lang, id: audioIds.line(role, i), text: turnTextOf(role, i, lang).line, character });
      });
      for (const a of ARCHETYPES) {
        for (const b of ['good', 'normal', 'bad'] as const) {
          items.push({ lang, id: audioIds.reaction(role, a, b), text: reactionTextOf(role, a, b, lang), character });
        }
      }
      items.push({ lang, id: audioIds.end('reject', role), text: endLineOf('reject', lang), character });
      items.push({ lang, id: audioIds.end('friend', role), text: endLineOf('friend', lang), character });
    }
  }
  return items;
}
 