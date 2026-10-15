import { useState } from "react";
import Head from "next/head";

// 恋愛ランゲーム（試作 v0.1）。ゲームの進行と点数の計算は、すべて、サーバー（/api/game/*）が行う。
// この画面は、表示と、選択の送信だけを担当する。

type Expr = "happy" | "neutral" | "sad" | "angry" | "surprised";
type View = {
  partnerIndex: number; turn: number; maxTurns: number;
  partnerLine: string; partnerExpr: Expr;
  choices: { id: number; text: string }[];
  stats: { spark: number; trust: number; wary: number };
  threshold: number; wariLimit: number; multiplier: number; total: number; cleared: number;
};
type Breakdown = { feeling: number; balance: number; speed: number; event: number; low: number; subtotal: number };
type StepResp = {
  bucket: "good" | "normal" | "bad";
  reaction: { text: string; expr: Expr };
  outcome: "continue" | "cleared" | "rejected" | "friend";
  animation: "fall" | "smoke" | null;
  partnerType: string | null;
  breakdown: Breakdown | null;
  partnerPoints: number | null;
  endLine: string | null;
  final: { total: number; cleared: number } | null;
  token: string | null;
  view: View | null;
};

const FACE: Record<Expr, string> = { happy: "😊", neutral: "😐", sad: "😢", angry: "😠", surprised: "😲" };

export default function Game() {
  const [stage, setStage] = useState<"age" | "role" | "play" | "end">("age");
  const [role, setRole] = useState<"W" | "M">("W");
  const [token, setToken] = useState<string | null>(null);
  const [view, setView] = useState<View | null>(null);
  const [resp, setResp] = useState<StepResp | null>(null); // 選択のあとの、相手の反応
  const [pending, setPending] = useState<{ token: string | null; view: View | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [anim, setAnim] = useState<"fall" | "smoke" | null>(null);

  const start = async (r: "W" | "M") => {
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/game/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: r }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      setRole(r); setToken(data.token); setView(data.view); setResp(null); setPending(null); setAnim(null); setStage("play");
    } catch (e) { setError("ゲームを始められませんでした。もう一度お試しください。"); }
    setBusy(false);
  };

  const choose = async (id: number) => {
    if (!token || busy) return;
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/game/choose", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, choice: id }) });
      const data: StepResp & { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      setResp(data);
      setPending({ token: data.token, view: data.view });
      if (data.outcome === "rejected") setAnim(data.animation);
    } catch (e) { setError("通信に失敗しました。もう一度、選んでください。"); }
    setBusy(false);
  };

  const next = () => {
    if (!resp || !pending) return;
    if (resp.outcome === "rejected" || resp.outcome === "friend") { setStage("end"); return; }
    setToken(pending.token); setView(pending.view); setResp(null); setPending(null);
  };

  const youFace = role === "W" ? "👩" : "👨";
  const partnerFace = role === "W" ? "👨" : "👩";
  const pct = (v: number) => Math.max(0, Math.min(100, v));

  return (
    <div className="page">
      <Head><title>恋愛ランゲーム（試作）| ADIKIO Technologies</title></Head>

      {stage === "age" && (
        <div className="card center">
          <h1>恋愛ランゲーム（試作）</h1>
          <p>このゲームは、<b>18歳以上</b>の方向けの、フィクションです。性的な内容は含みません。</p>
          <p className="small">試作版のため、ランキングやギフトは、まだありません。</p>
          <button className="btn" onClick={() => setStage("role")}>18歳以上です</button>
          <p className="small"><a href="/">← トップへ</a></p>
        </div>
      )}

      {stage === "role" && (
        <div className="card center">
          <h1>どちらの役で遊びますか？</h1>
          <button className="btn" disabled={busy} onClick={() => start("W")}>👩 女性役（口説かれる側）</button>
          <button className="btn alt" disabled={busy} onClick={() => start("M")}>👨 男性役（口説く側）</button>
          <p className="small">本人の性別は、問いません。どちらの役でも、遊べます。</p>
          {error && <p className="err">{error}</p>}
        </div>
      )}

      {stage === "play" && view && (
        <div className="card">
          <div className="hud">
            <span className="chip">{view.partnerIndex}人目</span>
            <span className="chip gold">連続 ×{view.multiplier.toFixed(2)}</span>
            <span className="chip">{view.total.toLocaleString()} 点</span>
          </div>

          <div className="bars">
            <Bar label="ときめき" v={view.stats.spark} mark={view.threshold} color="#f07aa8" />
            <Bar label="安心" v={view.stats.trust} mark={view.threshold} color="#6eaaf0" />
            <Bar label="警戒度" v={pct((view.stats.wary / view.wariLimit) * 100)} shown={view.stats.wary} color="#f09650" danger={view.stats.wary / view.wariLimit > 0.7} />
          </div>
          <p className="small hint">ときめきと安心を、線（目標）まで、伸ばしましょう。警戒度が、いっぱいになると、フラれます。</p>

          <div className={`stage ${anim ? "anim-" + anim : ""}`}>
            <div className={`avatar you ${anim === "fall" ? "fall" : ""} ${anim === "smoke" ? "smoke" : ""}`}>
              <span>{youFace}</span>
              {anim === "smoke" && <><i className="puff p1" /><i className="puff p2" /><i className="puff p3" /><i className="puff p4" /></>}
            </div>
            <div className="avatar partner"><span>{FACE[resp ? resp.reaction.expr : view.partnerExpr]}</span></div>
          </div>

          <div className="bubble">
            <div className="who">相手 ・ ターン {view.turn} / {view.maxTurns}</div>
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
              <p className={`mood ${resp.bucket}`}>{resp.bucket === "good" ? "いい感じ！" : resp.bucket === "bad" ? "うーん……" : "まずまず"}</p>
              {resp.outcome === "cleared" && resp.breakdown && (
                <div className="clear">
                  <h2>🎉 {resp.partnerType}を、落としました！</h2>
                  <table><tbody>
                    <tr><td>気持ちの高まり</td><td>{resp.breakdown.feeling}</td></tr>
                    <tr><td>バランス</td><td>{resp.breakdown.balance}</td></tr>
                    <tr><td>スピード</td><td>{resp.breakdown.speed}</td></tr>
                    <tr><td>警戒度の低さ</td><td>{resp.breakdown.low}</td></tr>
                    <tr><td><b>小計 × 倍率</b></td><td><b>{resp.partnerPoints} 点</b></td></tr>
                  </tbody></table>
                </div>
              )}
              {(resp.outcome === "rejected" || resp.outcome === "friend") && <p className="partner-type">相手のタイプは「{resp.partnerType}」でした。</p>}
              <button className="btn" onClick={next}>
                {resp.outcome === "continue" ? "次へ" : resp.outcome === "cleared" ? "次の相手へ" : "結果を見る"}
              </button>
            </div>
          )}
          {error && <p className="err">{error}</p>}
        </div>
      )}

      {stage === "end" && resp?.final && (
        <div className="card center">
          <h1>ラン終了</h1>
          <p className="big">{resp.outcome === "rejected" ? "フラれてしまいました……" : "友達止まりでした"}</p>
          <p>落とした人数　<b>{resp.final.cleared}人</b></p>
          <p className="score">{resp.final.total.toLocaleString()} 点</p>
          <button className="btn" onClick={() => setStage("role")}>もう一度</button>
          <p className="small">ランキングは、のちほど、追加します。</p>
        </div>
      )}

      <style jsx>{`
        .page { background: #14131f; color: #f2efe6; min-height: 100vh; padding: 20px 12px 60px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif; }
        .card { max-width: 480px; margin: 0 auto; }
        .center { text-align: center; padding-top: 40px; }
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
        .bars { display: grid; gap: 22px; margin-top: 18px; }
        .hint { margin: 10px 0 0; }
        .stage { position: relative; display: flex; justify-content: space-between; align-items: flex-end; height: 150px; margin: 14px 0 6px; padding: 0 20px;
          background: linear-gradient(#251c4a, #17122e); border-radius: 16px; overflow: hidden; }
        .avatar { position: relative; font-size: 74px; line-height: 1; padding-bottom: 14px; }
        .avatar.fall { transform-origin: 50% 100%; animation: fall 1.4s ease-in forwards; }
        .avatar.smoke > span { display: inline-block; animation: vanish 1.6s ease-in forwards; }
        .puff { position: absolute; border-radius: 50%; background: rgba(245,245,255,0.9); filter: blur(6px); opacity: 0; animation: puff 1.6s ease-out forwards; }
        .p1 { width: 60px; height: 60px; left: -10px; top: 10px; }
        .p2 { width: 70px; height: 70px; left: 20px; top: -4px; animation-delay: .1s; }
        .p3 { width: 54px; height: 54px; left: 40px; top: 24px; animation-delay: .2s; }
        .p4 { width: 66px; height: 66px; left: 0px; top: 30px; animation-delay: .15s; }
        @keyframes fall { 0% { transform: rotate(0); } 60% { transform: rotate(80deg) translateY(10px); } 100% { transform: rotate(90deg) translateY(20px); } }
        @keyframes vanish { 0% { transform: scale(1); opacity: 1; } 60% { transform: scale(0.6); opacity: .6; } 100% { transform: scale(0); opacity: 0; } }
        @keyframes puff { 0% { transform: scale(.2); opacity: 0; } 30% { opacity: .95; } 100% { transform: scale(2.2); opacity: 0; } }
        .bubble { margin-top: 10px; padding: 14px 16px; border-radius: 16px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); }
        .who { font-size: 12px; color: #f0abfc; margin-bottom: 4px; }
        .line { font-size: 18px; line-height: 1.6; color: #fff; }
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
          <div title="目標" style={{ position: "absolute", left: `${props.mark}%`, top: -4, width: 2, height: 22, background: "#ffe08a" }} />
        )}
      </div>
    </div>
  );
}
