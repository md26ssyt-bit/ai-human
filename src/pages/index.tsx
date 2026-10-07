import { useState } from "react";
import type { FormEvent } from "react";

export default function Company() {
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", message: "" });
  const [honeypot, setHoneypot] = useState(""); // 自動送信ボット対策（人には見えない欄）
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("contact@adikio.com");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // コピーできない環境では何もしない（アドレスは文字で表示されています）
    }
  };
  const update = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    if (honeypot) {
      // ボットが入力する欄が埋まっていたら、送信せずに完了したように見せる
      setStatus("done");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("done");
      setForm({ name: "", company: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="page">
      <header className="hero">
        <nav className="nav">
          <span className="wordmark">ADIKIO<span className="wordmark-sub">Technologies</span></span>
          <div className="nav-links">
            <a href="#products">プロダクト</a>
            <a href="#pricing">料金</a>
            <a href="#contact">お問い合わせ</a>
          </div>
        </nav>
        <div className="hero-body">
          <p className="eyebrow">ADIKIO Technologies</p>
          <h1>
            話しかけると、<br />
            誰かがそこにいる。
          </h1>
          <p className="hero-lead">
            私たちは、姿を持ったAIをつくっています。ホテルや会社の受付に立つ案内係として、
            そしてスマートフォンやパソコンの向こうで話を聞く相棒として。
          </p>
        </div>
        <div className="hero-orb" aria-hidden="true" />
      </header>

      <main>
        <section id="products" className="products">
          <div className="product-row">
            <div className="product-copy">
              <p className="eyebrow">B2B</p>
              <h2>ADIKIO Reception</h2>
              <p>
                ホテルのロビーや企業の受付に置く、3Dアバターの案内係です。よくある質問には
                その場で即座に答え、複雑な要件はスタッフへ引き継ぎます。人がいない時間帯は
                静かに待機し、負荷を抑えたまま24時間その場に立ち続けます。
              </p>
              <ul className="feature-list">
                <li>受付・案内の一次対応を自動化</li>
                <li>多言語対応・声とキャラクターのカスタマイズ</li>
                <li>専用キオスク端末、またはお手持ちのAndroid端末で稼働</li>
              </ul>
            </div>
            <div className="product-visual visual-reception" aria-hidden="true" />
          </div>

          <div className="product-row reverse">
            <div className="product-copy">
              <p className="eyebrow">B2C</p>
              <h2>心に灯る部屋</h2>
              <p>
                占い・性格診断、旅先やお店のご案内、そして気持ちを話したい時の話し相手。
                女性・男性・魔女という3人のキャラクターから選んで、日本語・英語・中国語・
                インドネシア語・スペイン語で会話できます。
              </p>
              <ul className="feature-list">
                <li>占い・性格診断／観光案内／雑談／心の相談の体験</li>
                <li>無料でお試しいただけます</li>
                <li>より詳しい鑑定・プランは都度課金、毎日たくさん話したい方向けの月額プランも</li>
              </ul>
              <p className="product-link"><a href="/room">心に灯る部屋を開く →</a></p>
            </div>
            <div className="product-visual visual-companion" aria-hidden="true" />
          </div>
        </section>

        <section id="pricing" className="pricing">
          <p className="eyebrow">料金</p>
          <h2>まずは無料で。もっと使いたくなったら。</h2>
          <div className="pricing-grid">
            <div className="price-card">
              <h3>無料でお試し</h3>
              <p className="price">¥0</p>
              <p>占い・観光案内・雑談・心の相談を、1日一定回数まで無料でご利用いただけます。</p>
            </div>
            <div className="price-card">
              <h3>詳細鑑定・詳細プラン</h3>
              <p className="price">¥300 〜 <span>/ 1回</span></p>
              <p>もっと踏み込んだ占いの結果や、丸1日分の観光プランをその場で購入できます。</p>
            </div>
            <div className="price-card highlight">
              <h3>プレミアムプラン</h3>
              <p className="price">$9.99 <span>/ 月</span></p>
              <p>毎日たくさん会話したい方向けの月額プラン。いつでも解約できます。</p>
            </div>
          </div>
        </section>

        <section id="contact" className="contact">
          <p className="eyebrow">会社情報</p>
          <h2>ADIKIO Technologies</h2>
          <dl className="info-grid">
            <div>
              <dt>所在地</dt>
              <dd>新潟県新潟市東区中山7-8-12</dd>
            </div>
            <div>
              <dt>お問い合わせ</dt>
                           <dd className="email-row">
                <span>contact@adikio.com</span>
                <button type="button" className="copy-btn" onClick={copyEmail}>
                  {copied ? "コピーしました" : "コピー"}
                </button>
              </dd>
            </div>
            <div>
              <dt>事業内容</dt>
              <dd>AIアバターを用いた受付・案内システムの開発提供、および会話型AIサービスの運営</dd>
            </div>
          </dl>

          <div className="form-wrap">
            <h3>お問い合わせフォーム</h3>
            {status === "done" ? (
              <p className="form-done">送信しました。内容を確認のうえ、ご連絡いたします。</p>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <label>
                  <span className="label-text">お名前<em>必須</em></span>
                  <input type="text" value={form.name} onChange={update("name")} required maxLength={100} />
                </label>
                <label>
                  <span className="label-text">会社名・団体名<em className="opt">任意</em></span>
                  <input type="text" value={form.company} onChange={update("company")} maxLength={200} />
                </label>
                <label>
                  <span className="label-text">メールアドレス<em>必須</em></span>
                  <input type="email" value={form.email} onChange={update("email")} required maxLength={200} />
                </label>
                <label>
                  <span className="label-text">電話番号<em className="opt">任意</em></span>
                  <input type="tel" value={form.phone} onChange={update("phone")} maxLength={50} />
                </label>
                <label>
                  <span className="label-text">お問い合わせ内容<em>必須</em></span>
                  <textarea value={form.message} onChange={update("message")} required rows={6} maxLength={5000} />
                </label>
                <input
                  className="hp"
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
                {status === "error" && (
                  <p className="form-error">
                    送信できませんでした。時間をおいてもう一度お試しいただくか、contact@adikio.com まで直接ご連絡ください。
                  </p>
                )}
                <button type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "送信中..." : "送信する"}
                </button>
                <p className="form-note">
                  いただいた内容は、お問い合わせへの対応にのみ使用します。詳しくは
                  <a href="/privacy">プライバシーポリシー</a>をご覧ください。
                </p>
              </form>
            )}
          </div>

          <div className="legal-links">
            <a href="/terms">利用規約</a>
            <a href="/privacy">プライバシーポリシー</a>
            <a href="/refund">返金ポリシー</a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>© {new Date().getFullYear()} ADIKIO Technologies</span>
      </footer>

      <style jsx>{`
        .page {
          background: #14131f;
          color: #f2efe6;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif;
          min-height: 100vh;
        }
        h1, h2, h3, .wordmark {
          font-family: 'Fraunces', Georgia, 'Hiragino Mincho ProN', 'Noto Serif JP', serif;
        }
        .hero {
          position: relative;
          padding: 32px 6vw 96px;
          overflow: hidden;
        }
        .nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 2;
        }
        .wordmark {
          font-size: 20px;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .wordmark-sub {
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: 13px;
          color: #b9a9e0;
          margin-left: 8px;
        }
        .nav-links a {
          color: #cfc9df;
          text-decoration: none;
          margin-left: 28px;
          font-size: 14px;
        }
        .nav-links a:hover {
          color: #f2efe6;
        }
        .hero-body {
          position: relative;
          z-index: 2;
          max-width: 720px;
          margin-top: 100px;
        }
        .eyebrow {
          color: #c9a227;
          font-size: 13px;
          letter-spacing: 0.06em;
          margin-bottom: 14px;
        }
        h1 {
          font-size: clamp(36px, 6vw, 60px);
          line-height: 1.15;
          font-weight: 500;
          margin: 0 0 24px;
        }
        .hero-lead {
          font-size: 17px;
          line-height: 1.75;
          color: #cfc9df;
          max-width: 520px;
        }
        .hero-orb {
          position: absolute;
          top: -120px;
          right: -80px;
          width: 480px;
          height: 480px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #6b5ca5 0%, #3a3160 45%, transparent 70%);
          filter: blur(4px);
        }
        section {
          padding: 88px 6vw;
        }
        .product-row {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 56px;
          align-items: center;
          margin-bottom: 96px;
        }
        .product-row.reverse {
          grid-template-columns: 0.9fr 1.1fr;
        }
        .product-row.reverse .product-copy { order: 2; }
        .product-row.reverse .product-visual { order: 1; }
        .product-copy h2 {
          font-size: 30px;
          margin: 0 0 18px;
          font-weight: 500;
        }
        .product-copy p {
          color: #cfc9df;
          line-height: 1.8;
          font-size: 15px;
        }
        .product-link a {
          color: #f2efe6;
        }
        .feature-list {
          list-style: none;
          padding: 0;
          margin: 22px 0 0;
          border-top: 1px solid rgba(255,255,255,0.12);
        }
        .feature-list li {
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.12);
          color: #f2efe6;
          font-size: 14px;
        }
        .product-visual {
          height: 320px;
          border-radius: 4px;
        }
        .visual-reception {
          background:
            linear-gradient(160deg, #c9a227 0%, transparent 55%),
            linear-gradient(200deg, #6b5ca5 0%, #211d34 60%);
        }
        .visual-companion {
          background:
            linear-gradient(200deg, #6b5ca5 0%, transparent 55%),
            linear-gradient(20deg, #c9a227 0%, #211d34 60%);
        }
        .pricing {
          background: #1a1826;
        }
        .pricing h2 {
          font-size: 28px;
          font-weight: 500;
          margin: 0 0 40px;
          max-width: 480px;
        }
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .price-card {
          border: 1px solid rgba(255,255,255,0.14);
          padding: 32px 28px;
          border-radius: 4px;
        }
        .price-card.highlight {
          border-color: #c9a227;
          background: rgba(201,162,39,0.06);
        }
        .price-card h3 {
          font-size: 18px;
          font-weight: 500;
          margin: 0 0 12px;
        }
        .price-card .price {
          font-family: 'Fraunces', serif;
          font-size: 30px;
          margin: 0 0 14px;
        }
        .price-card .price span {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #a79fc0;
        }
        .price-card p {
          color: #cfc9df;
          font-size: 14px;
          line-height: 1.7;
        }
        .contact h2 {
          font-size: 28px;
          font-weight: 500;
          margin: 0 0 40px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
          margin: 0 0 48px;
        }
        .info-grid dt {
          color: #a79fc0;
          font-size: 13px;
          margin-bottom: 8px;
        }
        .info-grid dd {
          margin: 0;
          font-size: 15px;
        }
                .email-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .copy-btn {
          background: transparent;
          color: #cfc9df;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 4px;
          padding: 4px 10px;
          font-size: 12px;
          cursor: pointer;
        }
        .copy-btn:hover {
          color: #f2efe6;
          border-color: #f2efe6;
        }  
        .info-grid a {
          color: #f2efe6;
        }
        .form-wrap {
          max-width: 560px;
          margin: 0 0 56px;
        }
        .form-wrap h3 {
          font-size: 20px;
          font-weight: 500;
          margin: 0 0 20px;
        }
        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
        }
        .contact-form label {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .label-text {
          font-size: 13px;
          color: #cfc9df;
        }
        .label-text em {
          font-style: normal;
          font-size: 11px;
          color: #c9a227;
          margin-left: 8px;
        }
        .label-text em.opt {
          color: #7d7690;
        }
        .contact-form input,
        .contact-form textarea {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 4px;
          color: #f2efe6;
          padding: 12px 14px;
          font-size: 15px;
          font-family: inherit;
        }
        .contact-form input:focus,
        .contact-form textarea:focus {
          outline: none;
          border-color: #c9a227;
        }
        .contact-form .hp {
          position: absolute;
          left: -9999px;
          width: 1px;
          height: 1px;
          opacity: 0;
        }
        .contact-form button {
          background: #c9a227;
          color: #14131f;
          border: none;
          border-radius: 4px;
          padding: 14px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
        }
        .contact-form button:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .form-note {
          color: #a79fc0;
          font-size: 12px;
          line-height: 1.7;
          margin: 0;
        }
        .form-note a {
          color: #cfc9df;
        }
        .form-error {
          color: #ff9a9a;
          font-size: 13px;
          line-height: 1.7;
          margin: 0;
        }
        .form-done {
          color: #cfc9df;
          font-size: 15px;
          line-height: 1.8;
          border: 1px solid rgba(201,162,39,0.5);
          background: rgba(201,162,39,0.06);
          padding: 20px;
          border-radius: 4px;
        }
        .legal-links a {
          color: #cfc9df;
          text-decoration: underline;
          margin-right: 24px;
          font-size: 14px;
        }
        .site-footer {
          padding: 32px 6vw;
          border-top: 1px solid rgba(255,255,255,0.1);
          color: #7d7690;
          font-size: 13px;
        }
        @media (max-width: 860px) {
          .product-row, .product-row.reverse {
            grid-template-columns: 1fr;
          }
          .product-row.reverse .product-copy,
          .product-row.reverse .product-visual { order: initial; }
          .pricing-grid, .info-grid {
            grid-template-columns: 1fr;
          }
          .nav-links a { margin-left: 16px; font-size: 13px; }
        }
      `}</style>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600&family=Inter:wght@400;500;600&display=swap');
        body { margin: 0; }
      `}</style>
    </div>
  );
}