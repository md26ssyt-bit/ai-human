import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, company, message }),
    });
    setSent(true);
  };
  return (
    <div style={{ fontFamily: "sans-serif", color: "#333" }}>

      {/* ナビゲーション */}
      <nav style={{
        position: "fixed",
        top: 0,
        width: "100%",
        background: "rgba(255,255,255,0.95)",
        borderBottom: "1px solid #eee",
        padding: "16px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 100,
        boxSizing: "border-box"
      }}>
        <div style={{ fontWeight: "bold", fontSize: "20px" }}>Digkio Lab.</div>
        <a href="/login" style={{
          background: "#1a1a2e",
          color: "white",
          padding: "8px 24px",
          borderRadius: "24px",
          textDecoration: "none",
          fontSize: "14px"
        }}>ログイン</a>
      </nav>

      {/* ヒーローセクション */}
      <section style={{
        background: "linear-gradient(135deg, #1a1a2e, #16213e)",
        color: "white",
        padding: "160px 40px 100px",
        textAlign: "center"
      }}>
        <h1 style={{ fontSize: "48px", marginBottom: "24px", lineHeight: "1.3" }}>
          AIがあなたの受付を<br />24時間サポート
        </h1>
        <p style={{ fontSize: "20px", marginBottom: "40px", opacity: 0.8 }}>
          最新のAI技術と3Dアバターで、<br />お客様をおもてなし
        </p>
        <a href="/login" style={{
          background: "white",
          color: "#1a1a2e",
          padding: "16px 48px",
          borderRadius: "32px",
          textDecoration: "none",
          fontSize: "18px",
          fontWeight: "bold"
        }}>
          無料デモを見る
        </a>
      </section>

      {/* サービスの説明 */}
      <section style={{ padding: "100px 40px", background: "#f9f9f9", textAlign: "center" }}>
        <h2 style={{ fontSize: "36px", marginBottom: "60px" }}>サービスの特徴</h2>
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "40px",
          flexWrap: "wrap",
          maxWidth: "1000px",
          margin: "0 auto"
        }}>
          {[
            { icon: "💁‍♀️", title: "AIアバター受付", desc: "3Dキャラクターが自然な会話でお客様をご案内します" },
            { icon: "🕐", title: "24時間対応", desc: "休日・夜間も対応可能。受付コストを大幅に削減" },
            { icon: "🏢", title: "カスタマイズ可能", desc: "会社ごとに異なるキャラクターとプロンプトを設定" },
            { icon: "📧", title: "担当者通知", desc: "お客様の伝言を担当者にメールで自動通知" },
          ].map((item, i) => (
            <div key={i} style={{
              background: "white",
              padding: "40px 30px",
              borderRadius: "16px",
              width: "200px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>{item.icon}</div>
              <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>{item.title}</h3>
              <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.6" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 料金プラン */}
      <section style={{ padding: "100px 40px", textAlign: "center" }}>
        <h2 style={{ fontSize: "36px", marginBottom: "16px" }}>料金プラン</h2>
        <p style={{ color: "#666", marginBottom: "60px" }}>ハードウェアは買い切り、ソフトウェアは月額制</p>

        {/* ハードウェア */}
        <h3 style={{ fontSize: "24px", marginBottom: "40px" }}>ハードウェア（買い切り）</h3>
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "30px",
          flexWrap: "wrap",
          marginBottom: "80px",
          maxWidth: "900px",
          margin: "0 auto 80px"
        }}>
          {[
            { name: "ベーシック", price: "178,000", desc: "小規模オフィス向け" },
            { name: "スタンダード", price: "248,000", desc: "中規模オフィス向け", popular: true },
            { name: "プレミアム", price: "298,000", desc: "大規模オフィス向け" },
          ].map((plan, i) => (
            <div key={i} style={{
              background: plan.popular ? "#1a1a2e" : "white",
              color: plan.popular ? "white" : "#333",
              padding: "40px 30px",
              borderRadius: "16px",
              width: "220px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              border: plan.popular ? "none" : "1px solid #eee",
              position: "relative"
            }}>
              {plan.popular && (
                <div style={{
                  position: "absolute",
                  top: "-12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#e74c3c",
                  color: "white",
                  padding: "4px 16px",
                  borderRadius: "12px",
                  fontSize: "12px"
                }}>人気</div>
              )}
              <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>{plan.name}</h3>
              <p style={{ fontSize: "14px", opacity: 0.7, marginBottom: "16px" }}>{plan.desc}</p>
              <div style={{ fontSize: "32px", fontWeight: "bold" }}>¥{plan.price}</div>
              <div style={{ fontSize: "14px", opacity: 0.7 }}>税別</div>
            </div>
          ))}
        </div>

        {/* ソフトウェア */}
        <h3 style={{ fontSize: "24px", marginBottom: "40px" }}>ソフトウェア（月額）</h3>
        <div style={{
          background: "#f9f9f9",
          padding: "40px",
          borderRadius: "16px",
          maxWidth: "500px",
          margin: "0 auto",
          textAlign: "left"
        }}>
          <div style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "16px" }}>
            ¥29,800<span style={{ fontSize: "16px", fontWeight: "normal" }}>/月（税別）</span>
          </div>
          <ul style={{ listStyle: "none", padding: 0, lineHeight: "2" }}>
            <li>✅ AIアバター受付システム</li>
            <li>✅ 月1回のコンテンツ変更無料</li>
            <li>✅ 担当者メール通知</li>
            <li>✅ 24時間サポート</li>
            <li>⚙️ 2回目以降の変更：¥8,900/回</li>
          </ul>
        </div>
      </section>

      {/* デモ動画 */}
      <section style={{ padding: "100px 40px", background: "#f9f9f9", textAlign: "center" }}>
        <h2 style={{ fontSize: "36px", marginBottom: "16px" }}>デモ動画</h2>
        <p style={{ color: "#666", marginBottom: "40px" }}>近日公開予定</p>
        <div style={{
          background: "#ddd",
          width: "640px",
          height: "360px",
          borderRadius: "16px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "48px"
        }}>
          🎬
        </div>
      </section>

      {/* お問い合わせ */}
      <section style={{ padding: "100px 40px", textAlign: "center" }}>
        <h2 style={{ fontSize: "36px", marginBottom: "16px" }}>お問い合わせ</h2>
        <p style={{ color: "#666", marginBottom: "40px" }}>お気軽にご連絡ください</p>
        <div style={{
          maxWidth: "500px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        }}>
          {sent ? (
  <div style={{ padding: "40px", background: "#f0f9f0", borderRadius: "8px", color: "#2ecc71", fontSize: "18px" }}>
    ✅ お問い合わせを受け付けました！
  </div>
) : (
  <>
    <input placeholder="お名前" value={name} onChange={e => setName(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "16px" }} />
    <input placeholder="メールアドレス" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "16px" }} />
    <input placeholder="会社名" value={company} onChange={e => setCompany(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "16px" }} />
    <textarea placeholder="お問い合わせ内容" value={message} onChange={e => setMessage(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "16px", height: "150px" }} />
    <button onClick={handleSubmit} style={{
      background: "#1a1a2e",
      color: "white",
      padding: "16px",
      borderRadius: "8px",
      border: "none",
      fontSize: "16px",
      cursor: "pointer"
    }}>
      送信する
    </button>
  </>
)}
        </div>
      </section>

      {/* フッター */}
      <footer style={{
        background: "#1a1a2e",
        color: "white",
        padding: "40px",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>Digital Kiosk Lab.</div>
        <p style={{ opacity: 0.6, fontSize: "14px" }}>© 2026 Digkio Lab. All rights reserved.</p>
      </footer>

    </div>
  );
}