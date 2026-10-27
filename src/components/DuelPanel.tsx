import { useEffect, useRef, useState } from "react";
import { UI } from "@/lib/game/ui";
import type { UiLang } from "@/lib/game/ui";
import { UI_DUEL } from "@/lib/game/uiDuel";
import { sfxFoul, sfxGo, sfxLose, sfxPetal, sfxShot, sfxStopPetal, sfxUnlock, sfxWin } from "@/lib/game/sfx";

// 早撃ち（3回勝負）の画面。反応時間と、勝ち負けは、サーバー（/api/game/duel）が決める。

type Expr = "happy" | "neutral" | "sad" | "angry" | "surprised";
type RoundRes = {
  result: "win" | "lose" | "foul" | "late";
  reactionMs: number | null;
  cpuMs: number;
  round: number;
  wins: number;
  rounds: number;
  finished: boolean;
  bonus: number;
  penalty: boolean;
  token: string;
  view: unknown;
};

type Props = {
  token: string;
  lang: UiLang;
  sound: boolean;
  onPetal: (ms: number | null) => void; // 花びらを落とす（null で、消す）
  onMood: (e: Expr | null) => void; // 相手の表情
  onNext: (token: string, view: unknown) => void; // 3回終わって、次の相手へ
};

export default function DuelPanel({ token, lang, sound, onPetal, onMood, onNext }: Props) {
  const T = UI_DUEL[lang];
  const U = UI[lang];
  const [phase, setPhase] = useState<"ready" | "wait" | "go" | "result">("ready");
  const [res, setRes] = useState<RoundRes | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const tokenRef = useRef(token);
  const sent = useRef(false);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };
  useEffect(() => () => { clearTimers(); sfxStopPetal(); }, []);

  // 1回分の結果を、サーバーに送る
  const send = async (action: "shot" | "foul" | "timeout") => {
    if (sent.current) return;
    sent.current = true;
    clearTimers();
    sfxStopPetal();
    onPetal(null);
    if (sound) { if (action === "shot") sfxShot(); else if (action === "foul") sfxFoul(); }
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/game/duel", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenRef.current, action, lang }),
      });
      const data: RoundRes & { error?: string } = await r.json();
      if (!r.ok) throw new Error(data.error || "failed");
      tokenRef.current = data.token;
      setRes(data);
      setPhase("result");
      onMood(data.result === "win" ? "surprised" : "happy");
      if (sound) window.setTimeout(() => { if (data.result === "win") sfxWin(); else if (data.result !== "foul") sfxLose(); }, 220);
    } catch (e) {
      setError(U.commFail);
      sent.current = false;
      setPhase("ready"); // やり直せる
    }
    setBusy(false);
  };

  // 1回分を、はじめる（サーバーが、合図までの時間を決める）
  const begin = async () => {
    if (busy) return;
    setBusy(true); setError("");
    if (sound) sfxUnlock();
    try {
      const r = await fetch("/api/game/duel", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenRef.current, action: "start", lang }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "failed");
      tokenRef.current = data.token;
      sent.current = false;
      onMood(null);
      onPetal(data.delayMs);
      if (sound) sfxPetal(data.delayMs);
      setPhase("wait");
      clearTimers();
      timers.current.push(window.setTimeout(() => {
        setPhase("go");
        if (sound) sfxGo();
        // 押さないまま、時間が過ぎたら、負け
        timers.current.push(window.setTimeout(() => { void send("timeout"); }, 2600));
      }, data.delayMs));
    } catch (e) { setError(U.commFail); }
    setBusy(false);
  };

  // ボタンを押す（合図の前なら、フライング）
  const press = () => {
    if (phase === "wait") void send("foul");
    else if (phase === "go") void send("shot");
  };

  const total = res?.rounds ?? 3;
  const current = phase === "result" && res ? res.round : res ? res.round + 1 : 1;
  const lineOf = (r: RoundRes["result"]) => ({ win: T.win, lose: T.lose, foul: T.foul, late: T.late }[r]);
  const line = phase === "go" ? T.go : phase === "wait" ? T.wait : phase === "result" && res ? lineOf(res.result) : T.ready;

  return (
    <div className="duel">
      <div className="bubble">
        <div className="who">{T.title}　{T.round(Math.min(current, total), total)}</div>
        <div className="line">{line}</div>
      </div>
      <p className="small rule">{T.rule}</p>

      {phase === "ready" && (
        <button className="btn" disabled={busy} onClick={begin}>{res && !res.finished ? T.nextRound : T.start}</button>
      )}

      {(phase === "wait" || phase === "go") && (
        <button className={`duelbtn ${phase}`} onClick={press}>
          {phase === "go" ? T.go : T.wait}
        </button>
      )}

      {phase === "result" && res && (
        <div className="after">
          <p className={`mood ${res.result === "win" ? "good" : "bad"}`}>{lineOf(res.result)}</p>
          {res.result === "foul" && <p className="small">{T.foulNote}</p>}
          {res.result === "late" && <p className="small">{T.lateNote}</p>}
          {res.reactionMs !== null && (
            <p className="vs">{T.you} {res.reactionMs}{T.ms}　vs　{res.cpuMs}{T.ms} {T.cpu}</p>
          )}

          {!res.finished && (
            <>
              <p className="small">{T.score(res.wins, total)}（{T.round(res.round, total)}）</p>
              <button className="btn" onClick={() => { onPetal(null); setPhase("ready"); }}>{T.nextRound}</button>
            </>
          )}

          {res.finished && (
            <div className="final">
              <p className={`mood ${res.penalty ? "bad" : "good"}`}>{res.penalty ? T.finalLose : T.finalWin}　{T.score(res.wins, total)}</p>
              {res.bonus > 0 && <p className="small">{T.winNote(res.bonus)}</p>}
              {res.penalty && <p className="small">{T.loseNote}</p>}
              <button className="btn" onClick={() => onNext(res.token, res.view)}>{T.next}</button>
            </div>
          )}
        </div>
      )}
      {error && <p className="err">{error}</p>}

      <style jsx>{`
        p { line-height: 1.7; color: #cfc9df; }
        .small { font-size: 12px; color: #a79fc0; }
        .rule { text-align: center; margin: 10px 0 0; }
        .btn { display: block; width: 100%; margin: 12px 0; padding: 14px; border: none; border-radius: 12px; font-size: 16px; font-weight: 700;
          background: #7c4dff; color: #fff; cursor: pointer; }
        .btn:disabled { opacity: 0.6; }
        .bubble { margin-top: 10px; padding: 14px 16px; border-radius: 16px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); }
        .who { font-size: 12px; color: #f0abfc; margin-bottom: 4px; }
        .line { font-size: 18px; line-height: 1.6; color: #fff; min-height: 1.6em; }
        .after { margin-top: 12px; }
        .mood { font-weight: 700; font-size: 16px; margin: 6px 0; }
        .mood.good { color: #7ff0a6; } .mood.bad { color: #ff9a9a; }
        .vs { text-align: center; font-size: 20px; margin: 10px 0 0; color: #fff; }
        .final { margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.18); }
        .err { color: #ff9a9a; font-size: 14px; }
        .duelbtn { display: block; width: 100%; margin: 14px 0; padding: 28px 14px; border: none; border-radius: 16px;
          font-size: 26px; font-weight: 800; color: #fff; cursor: pointer; }
        .duelbtn.wait { background: #4a4568; }
        .duelbtn.go { background: #e8456b; }
      `}</style>
    </div>
  );
}