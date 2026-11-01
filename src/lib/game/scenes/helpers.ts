// 日本語の1ターンを、書きやすくするための道具：
// J(セリフ, 表情, 優しい, 積極的, 冗談, 誠実, そっけない, はぐらかす)

import type { Expr, Turn } from '../content';

export const J = (
  line: string,
  expr: Expr,
  gentle: string,
  bold: string,
  joke: string,
  sincere: string,
  curt: string,
  evasive: string
): Turn => ({
  line,
  expr,
  choices: { '優しい': gentle, '積極的': bold, '冗談': joke, '誠実': sincere, 'そっけない': curt, 'はぐらかす': evasive },
});