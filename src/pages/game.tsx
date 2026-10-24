import { useRef, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { UI, UI_LANGS, LANG_NAME } from "@/lib/game/ui";
import type { UiLang } from "@/lib/game/ui";
import { UI_RPS, RPS_ICONS } from "@/lib/game/uiRps";

// 3Dの舞台は、ブラウザだけで動かす（サーバー側の描画では、使わない）
const GameStage = dynamic(() => import("../components/GameStage"), {
  ssr: false,
  loading: () => <div style={{ height: 340 }} />,
});

// 恋愛ランゲーム（試作）。ゲームの進行と点数の計算は、すべて、サーバー（/api/game/*）が行う。
// この画面は、表示と、選択の送信、音声の再生だけを担当する。

type Expr = "happy" | "neutral" | "sad" | "angry" | "surprised";
type Gesture = "idle" | "nod" | "tilt" | "look_away" | "lean_in" | "arms_crossed" | "wave";
type View = {
  partnerIndex: number; turn: number; maxTurns: number;
  partnerLine: string; partnerExpr: Expr; partnerAudio: string;
  choices: { id: number; text: string }[];
  stats: { spark: number; trust: number; wary: number };
  threshold: number; wariLimit: number; multiplier: number; total: number; cleared: number;
  rps: boolean; // true のとき、じゃんけんの画面を出す
};
type Breakdown = { feeling: number; balance: number; speed: number; event: number; low: number; subtotal: number };
type StepResp = {
  bucket: "good" | "normal" | "bad";
  reaction: { text: string; expr: Expr };
  reactionAudio: string;
  outcome: "continue" | "cleared" | "rejected" | "friend";
  animation: "fall" | "smoke" | null;
  partnerType: string | null;
  breakdown: Breakdown | null;
  partnerPoints: number | null;
  playerGesture: Gesture;
  playerExpr: Expr;
  partnerGesture: Gesture;
  endLine: string | null;
  endAudio: string | null;
  final: { total: number; cleared: number } | null;
  token: string | null;
  view: View | null;
};
type RpsResp = {
  result: "win" | "lose" | "draw";
  cpuHand: number;
  winLine: string | null;
  winAudio: string | null;
  token: string;
  view: View;
};

export default function Game() {
  const [lang, setLang] = useState<UiLang>("ja");
  const [sound, setSound] = useState(true);
  const [stage, setStage] = useState<"age" | "role" | "play" | "end">("age");
  const [role, setRole] = useState<"W" | "M">("W");
  const [token, setToken] = useState<string | null>(null);
  const [view, setView] = useState<View | null>(null);
  const [resp, setResp] = useState<StepResp | null>(null); // 選択のあとの、相手の反応
  const [pending, setPending] = useState<{ token: string | null; view: View | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [anim, setAnim] = useState<"fall" | "smoke" | null>(null);

  // じゃんけん
  const [rpsRes, setRpsRes] = useState<RpsResp | null>(null);
  const [myHand, setMyHand] = useState(0);
  const [near, setNear] = useState(false); // 勝ったとき、相手が近づく

  // アバターの動き
  const [playerExpr, setPlayerExpr] = useState<Expr>("neutral");
  const [playerGesture, setPlayerGesture] = useState<Gesture>("idle");
  const [partnerGesture, setPartnerGesture] = useState<Gesture>("idle");
  const [playerKey, setPlayerKey] = useState(0);
  const [partnerKey, setPartnerKey] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  const t = UI[lang];
  const r = UI_RPS[lang];

  // 音声（public/game-audio/言語/ID.mp3）。順番に、続けて再生する。ファイルがなくても、エラーにはしない
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopAudio = () => {
    const a = audioRef.current;
    if (a) { a.onended = null; a.onerror = null; a.pause(); audioRef.current = null; }
    setSpeaking(false);
  };
  const play = (ids: (string | null | undefined)[], l: UiLang) => {
    stopAudio();
    if (!sound) return;
    const list = ids.filter((x): x is string => !!x);
    let i = 0;
    const go = () => {
      if (i >= list.length) { setSpeaking(false); return; }
      const a = new Audio(`/game-audio/${l}/${list[i]}.mp3`);
      audioRef.current = a;
      a.onended = () => { i++; go(); };
      a.onerror = () => { setSpeaking(false); };
      a.onplaying = () => setSpeaking(true);
      a.play().catch(() => { /* 再生が許可されないときは、何もしない */ });
    };
    go();
  };
  const toggleSound = () => {
    if (sound) stopAudio();
    setSound(!sound);
  };

  const resetMotion = () => {
    setPlayerExpr("neutral"); setPlayerGesture("idle"); setPartnerGesture("idle");
    setPlayerKey((k) => k + 1); setPartnerKey((k) => k + 1);
  };

  const start = async (rl: "W" | "M") => {
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/game/start", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: rl, lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      setRole(rl); setToken(data.token); setView(data.view); setResp(null); setPending(null); setAnim(null);
      setRpsRes(null); setNear(false);
      resetMotion();
      setStage("play");
      play([data.view.partnerAudio], lang);
    } catch (e) { setError(t.startFail); }
    setBusy(false);
  };

  const choose = async (id: number) => {
    if (!token || busy) return;
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/game/choose", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, choice: id, lang }),
      });
      const data: StepResp & { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      setResp(data);
      setPending({ token: data.token, view: data.view });
      setPlayerExpr(data.playerExpr); setPlayerGesture(data.playerGesture); setPlayerKey((k) => k + 1);
      setPartnerGesture(data.partnerGesture); setPartnerKey((k) => k + 1);
      if (data.outcome === "rejected") setAnim(data.animation);
      play([data.reactionAudio, data.endAudio], lang);
    } catch (e) { setError(t.commFail); }
    setBusy(false);
  };

  const next = () => {
    if (!resp || !pending) return;
    if (resp.outcome === "rejected" || resp.outcome === "friend") { stopAudio(); setStage("end"); return; }
    setToken(pending.token); setView(pending.view); setResp(null); setPending(null);
    setRpsRes(null); setNear(false);
    resetMotion();
    // じゃんけんのときは、相手のセリフは、まだ流さない
    if (pending.view && !pending.view.rps) play([pending.view.partnerAudio], lang);
    else stopAudio();
  };

  // じゃんけん：手を出す（勝ち負けは、サーバーが決める）
  const playHand = async (hand: number) => {
    if (!token || busy) return;
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/game/rps", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, hand, lang }),
      });
      const data: RpsResp & { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      setMyHand(hand);
      setRpsRes(data);
      if (data.result === "draw") {
        setToken(data.token); // あいこ：状態は、変わらない。もう一度、選べる
      } else {
        setPending({ token: data.token, view: data.view });
        if (data.result === "win") {
          setNear(true);
          setPartnerGesture("lean_in"); setPartnerKey((k) => k + 1);
          play([data.winAudio], lang);
        }
      }
    } catch (e) { setError(t.commFail); }
    setBusy(false);
  };

  // じゃんけんのあと、次の相手へ
  const nextFromRps = () => {
    if (!pending || !pending.view) return;
    setToken(pending.token); setView(pending.view); setPending(null);
    setRpsRes(null); setNear(false);
    resetMotion();
    play([pending.view.partnerAudio], lang);
  };

  const pct = (v: number) => Math.max(0, Math.min(100, v));

  // 言語ボタンと音声ボタン
  const langBar = (
    <div className="langbar">
      {UI_LANGS.map((l) => (
        <button key={l} className={`lang ${l === lang ? "on" : ""}`} onClick={() => setLang(l)}>{LANG_NAME[l]}</button>
      ))}
      <button className="lang snd" onClick={toggleSound}>{sound ? t.soundOn : t.soundOff}</button>
    </div>
  );

  const rpsDone = !!rpsRes && rpsRes.result !== "draw";

  return (
    <div className="page">
      <Head><title>{t.title} | ADIKIO Technologies</title></Head>

      {stage === "age" && (
        <div className="card center">
          {langBar}
          <h1>{t.title}</h1>
          <p>{t.ageIntro}</p>
          <p className="small">{t.ageNote}</p>
          <button className="btn" onClick={() => setStage("role")}>{t.ageButton}</button>
          <p className="small"><a href="/">{t.backTop}</a></p>
        </div>
      )}

      {stage === "role" && (
        <div className="card center">
          {langBar}
          <h1>{t.roleTitle}</h1>
          <button className="btn" disabled={busy} onClick={() => start("W")}>{t.roleW}</button>
          <button className="btn alt" disabled={busy} onClick={() => start("M")}>{t.roleM}</button>
          <p className="small">{t.roleNote}</p>
          {error && <p className="err">{error}</p>}
        </div>
      )}

      {stage === "play" && view && (
        <div className="card">
          <div className="hud">
            <span className="chip">{t.nth(view.partnerIndex)}</span>
            <span className="chip gold">{t.combo} ×{view.multiplier.toFixed(2)}</span>
            <span className="chip">{view.total.toLocaleString()} {t.points}</span>
            <button className="chip sndbtn" onClick={toggleSound}>{sound ? "🔊" : "🔇"}</button>
          </div>

          {!view.rps && (
            <>
              <div className="bars">
                <Bar label={t.spark} v={view.stats.spark} mark={view.threshold} color="#f07aa8" />
                <Bar label={t.trust} v={view.stats.trust} mark={view.threshold} color="#6eaaf0" />
                <Bar label={t.wary} v={pct((view.stats.wary / view.wariLimit) * 100)} shown={view.stats.wary} color="#f09650" danger={view.stats.wary / view.wariLimit > 0.7} />
              </div>
              <p className="small hint">{t.hint}</p>
            </>
          )}

          <div className="stagebox">
            <div className="rain" />
            <GameStage
              role={role}
              playerExpr={playerExpr}
              partnerExpr={resp ? resp.reaction.expr : view.rps && rpsRes?.result === "win" ? "happy" : view.partnerExpr}
              playerGesture={playerGesture}
              partnerGesture={partnerGesture}
              playerKey={playerKey}
              partnerKey={partnerKey}
              effect={anim ?? "none"}
              partnerSpeaking={speaking}
              partnerNear={near}
            />
          </div>

          {view.rps ? (
            <div className="rps">
              <div className="bubble">
                <div className="who">{r.title}</div>
                <div className="line">
                  {rpsRes?.result === "win" && rpsRes.winLine ? rpsRes.winLine : rpsRes ? "" : r.pick}
                  {rpsRes && rpsRes.result !== "win" && (rpsRes.result === "draw" ? r.draw : r.lose)}
                </div>
              </div>
              <p className="small rule">{r.rule}</p>

              {rpsRes && (
                <p className="vs">
                  {r.you} {RPS_ICONS[myHand]}　vs　{RPS_ICONS[rpsRes.cpuHand]} {r.cpu}
                </p>
              )}

              {(!rpsRes || rpsRes.result === "draw") && (
                <div className="hands">
                  {[0, 1, 2].map((h) => (
                    <button key={h} className="hand" disabled={busy} onClick={() => playHand(h)}>
                      <span className="ico">{RPS_ICONS[h]}</span>
                      <span>{r.hands[h]}</span>
                    </button>
                  ))}
                </div>
              )}

              {rpsDone && rpsRes && (
                <div className="after">
                  <p className={`mood ${rpsRes.result === "win" ? "good" : "bad"}`}>{rpsRes.result === "win" ? r.win : r.lose}</p>
                  <p className="small">{rpsRes.result === "win" ? r.winNote : r.loseNote}</p>
                  <button className="btn" onClick={nextFromRps}>{r.next}</button>
                </div>
              )}
              {error && <p className="err">{error}</p>}
            </div>
          ) : (
            <>
              <div className="bubble">
                <div className="who">{t.partnerWho(view.turn, view.maxTurns)}</div>
                <div className="line">{resp ? resp.reaction.text : view.partnerLine}</div>
                {resp && resp.outcome !== "continue" && resp.endLine && <div className="line end">{resp.endLine}</div>}
              </div>

              {!resp && (
                <div className="choices">
                  {view.choices.map((c) => (
                    <button key={c.id} className="choice" disabled={busy} onClick={() => choose(c.id)}>{c.text}</button>
                  ))}
                </div>
              )}

              {resp && (
                <div className="after">
                  <p className={`mood ${resp.bucket}`}>{resp.bucket === "good" ? t.moodGood : resp.bucket === "bad" ? t.moodBad : t.moodNormal}</p>
                  {resp.outcome === "cleared" && resp.breakdown && (
                    <div className="clear">
                      <h2>{t.clearTitle(resp.partnerType ?? "")}</h2>
                      <table><tbody>
                        <tr><td>{t.feeling}</td><td>{resp.breakdown.feeling}</td></tr>
                        <tr><td>{t.balance}</td><td>{resp.breakdown.balance}</td></tr>
                        <tr><td>{t.speed}</td><td>{resp.breakdown.speed}</td></tr>
                        <tr><td>{t.low}</td><td>{resp.breakdown.low}</td></tr>
                        <tr><td><b>{t.subtotal}</b></td><td><b>{resp.partnerPoints} {t.points}</b></td></tr>
                      </tbody></table>
                    </div>
                  )}
                  {(resp.outcome === "rejected" || resp.outcome === "friend") && <p className="partner-type">{t.partnerTypeWas(resp.partnerType ?? "")}</p>}
                  <button className="btn" onClick={next}>
                    {resp.outcome === "continue" ? t.next : resp.outcome === "cleared" ? t.nextPartner : t.seeResult}
                  </button>
                </div>
              )}
              {error && <p className="err">{error}</p>}
            </>
          )}
        </div>
      )}

      {stage === "end" && resp?.final && (
        <div className="card center">
          {langBar}
          <h1>{t.endTitle}</h1>
          <p className="big">{resp.outcome === "rejected" ? t.endRejected : t.endFriend}</p>
          <p>{t.clearedCount}　<b>{resp.final.cleared}</b></p>
          <p className="score">{resp.final.total.toLocaleString()} {t.points}</p>
          <button className="btn" onClick={() => setStage("role")}>{t.again}</button>
          <p className="small">{t.rankLater}</p>
        </div>
      )}

      <style jsx>{`
        .page { background: #14131f; color: #f2efe6; min-height: 100vh; padding: 20px 12px 60px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif; }
        .card { max-width: 480px; margin: 0 auto; }
        .center { text-align: center; padding-top: 20px; }
        .langbar { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-bottom: 20px; }
        .lang { padding: 6px 10px; border: 1px solid rgba(255,255,255,0.25); border-radius: 999px; background: transparent; color: #cfc9df; font-size: 13px; cursor: pointer; }
        .lang.on { background: #7c4dff; border-color: #7c4dff; color: #fff; font-weight: 700; }
        .lang.snd { border-style: dashed; }
        h1 { font-size: 24px; font-weight: 600; margin: 0 0 16px; }
        h2 { font-size: 18px; margin: 8px 0; }
        p { line-height: 1.7; color: #cfc9df; }
        .small { font-size: 12px; color: #a79fc0; }
        .big { font-size: 20px; color: #f2efe6; }
        .score { font-size: 40px; font-weight: 700; color: #ffd76a; margin: 8px 0 20px; }
        a { color: #cfc9df; }
        .btn { display: block; width: 100%; margin: 12px 0; padding: 14px; border: none; border-radius: 12px; font-size: 16px; font-weight: 700;
          background: #7c4dff; color: #fff; cursor: pointer; }
        .btn.alt { background: #3a6fd8; }
        .btn:disabled { opacity: 0.6; }
        .hud { display: flex; gap: 8px; justify-content: space-between; margin-bottom: 14px; }
        .chip { flex: 1; text-align: center; padding: 8px 6px; border-radius: 999px; background: rgba(255,255,255,0.09); font-weight: 700; font-size: 14px; }
        .chip.gold { background: rgba(201,162,39,0.22); color: #ffe08a; }
        .chip.sndbtn { flex: 0 0 44px; border: none; color: #f2efe6; cursor: pointer; }
        .bars { display: grid; gap: 22px; margin-top: 18px; }
        .hint { margin: 10px 0 0; }
        .stagebox { position: relative; margin: 14px 0 6px; border-radius: 16px; overflow: hidden;
          background: linear-gradient(#2a2058, #15102c 70%, #0d0a1c); }
        .rain { position: absolute; inset: 0; pointer-events: none; opacity: .5;
          background-image: repeating-linear-gradient(100deg, rgba(190,205,255,.35) 0 1px, transparent 1px 16px);
          background-size: 100% 200%; animation: rainfall .9s linear infinite; }
        @keyframes rainfall { from { background-position: 0 0; } to { background-position: -30px 100%; } }
        .bubble { margin-top: 10px; padding: 14px 16px; border-radius: 16px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); }
        .who { font-size: 12px; color: #f0abfc; margin-bottom: 4px; }
        .line { font-size: 18px; line-height: 1.6; color: #fff; min-height: 1.6em; }
        .line.end { margin-top: 8px; color: #ffd0d0; }
        .choices { display: grid; gap: 10px; margin-top: 14px; }
        .choice { padding: 14px; border: none; border-radius: 12px; background: #f1eefc; color: #231c40; font-size: 16px; font-weight: 700; text-align: left; cursor: pointer; }
        .choice:disabled { opacity: .6; }
        .after { margin-top: 12px; }
        .mood { font-weight: 700; font-size: 16px; margin: 6px 0; }
        .mood.good { color: #7ff0a6; } .mood.bad { color: #ff9a9a; } .mood.normal { color: #e8e0ff; }
        .clear { padding: 10px 14px; border-radius: 12px; background: rgba(201,162,39,0.14); border: 1px solid rgba(201,162,39,0.5); }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        td { padding: 4px 0; color: #e8e0ff; } td:last-child { text-align: right; }
        .partner-type { font-size: 14px; }
        .err { color: #ff9a9a; font-size: 14px; }
        .rule { text-align: center; margin: 10px 0 0; }
        .vs { text-align: center; font-size: 20px; margin: 10px 0 0; color: #fff; }
        .hands { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 14px; }
        .hand { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 14px 4px; border: none; border-radius: 12px;
          background: #f1eefc; color: #231c40; font-size: 14px; font-weight: 700; cursor: pointer; }
        .hand .ico { font-size: 34px; line-height: 1.1; }
        .hand:disabled { opacity: .6; }
      `}</style>
      <style jsx global>{`body { margin: 0; }`}</style>
    </div>
  );
}

// ときめき・安心・警戒度のバー。mark があれば、目標の線を、表示する
function Bar(props: { label: string; v: number; mark?: number; color: string; shown?: number; danger?: boolean }) {
  const shown = props.shown ?? props.v;
  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
        <span>{props.label}</span>
        <span>{shown.toFixed(1)}</span>
      </div>
      <div style={{ position: "relative", height: 14, borderRadius: 7, background: "rgba(255,255,255,0.14)" }}>
        <div style={{ width: `${Math.max(2, Math.min(100, props.v))}%`, height: "100%", borderRadius: 7, background: props.danger ? "#ff5a5a" : props.color, transition: "width .5s" }} />
        {props.mark !== undefined && (
          <div style={{ position: "absolute", left: `${props.mark}%`, top: -4, width: 2, height: 22, background: "#ffe08a" }} />
        )}
      </div>
    </div>
  );
}