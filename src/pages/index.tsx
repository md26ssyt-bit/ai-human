import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>AIアバター受付キオスク | Digkio Lab.</title>
        <meta name="description" content="3Dアバターが来訪者をお迎えし、自然な会話でご案内する無人受付システム" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Noto Sans JP', 'Inter', sans-serif; background: #fff; color: #1a1a1a; }

        /* ナビ */
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid #f0f0f0;
          padding: 0 40px;
          height: 64px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .nav-logo { font-size: 15px; font-weight: 600; letter-spacing: 0.05em; color: #1a1a1a; text-decoration: none; }
        .nav-links { display: flex; gap: 32px; align-items: center; }
        .nav-links a { font-size: 14px; color: #555; text-decoration: none; }
        .nav-links a:hover { color: #1a1a1a; }
        .nav-cta {
          background: #1a1a1a; color: #fff !important;
          padding: 8px 20px; border-radius: 6px;
          font-size: 13px !important; font-weight: 500;
        }
        .nav-cta:hover { background: #333 !important; }

        /* ヒーロー */
        .hero {
          padding: 140px 40px 100px;
          max-width: 1100px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
        }
        .hero-eyebrow {
          font-size: 12px; font-weight: 500; letter-spacing: 0.15em;
          color: #888; text-transform: uppercase; margin-bottom: 20px;
        }
        .hero-title {
          font-size: 48px; font-weight: 700; line-height: 1.15;
          letter-spacing: -0.02em; margin-bottom: 24px;
        }
        .hero-title span { color: #888; }
        .hero-desc {
          font-size: 16px; line-height: 1.8; color: #555;
          margin-bottom: 36px; font-weight: 300;
        }
        .hero-actions { display: flex; gap: 12px; }
        .btn-primary {
          background: #1a1a1a; color: #fff;
          padding: 14px 28px; border-radius: 8px;
          font-size: 14px; font-weight: 500; text-decoration: none;
          border: none; cursor: pointer;
        }
        .btn-primary:hover { background: #333; }
        .btn-secondary {
          background: transparent; color: #1a1a1a;
          padding: 14px 28px; border-radius: 8px;
          font-size: 14px; font-weight: 500; text-decoration: none;
          border: 1.5px solid #e0e0e0; cursor: pointer;
        }
        .btn-secondary:hover { border-color: #999; }

        /* ヒーロービジュアル */
        .hero-visual {
          background: #f7f7f7; border-radius: 20px;
          aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
        }
        .avatar-mockup {
          width: 120px; height: 200px;
          background: linear-gradient(180deg, #e8e8e8 0%, #d0d0d0 100%);
          border-radius: 60px 60px 20px 20px;
          display: flex; align-items: flex-start; justify-content: center;
          padding-top: 20px; position: relative;
        }
        .avatar-face {
          width: 70px; height: 70px; border-radius: 50%;
          background: linear-gradient(135deg, #f0f0f0, #ddd);
        }
        .chat-bubble {
          position: absolute; bottom: 30px; left: 30px; right: 30px;
          background: #fff; border-radius: 12px; padding: 14px 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          font-size: 13px; color: #333; line-height: 1.5;
        }
        .chat-bubble::after {
          content: ''; position: absolute; top: -8px; left: 20px;
          width: 0; height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-bottom: 8px solid #fff;
        }

        /* ログ数字 */
        .stats {
          background: #f7f7f7; padding: 60px 40px;
          display: flex; justify-content: center; gap: 0;
        }
        .stat-item {
          text-align: center; padding: 0 60px;
          border-right: 1px solid #e0e0e0;
        }
        .stat-item:last-child { border-right: none; }
        .stat-num { font-size: 40px; font-weight: 700; letter-spacing: -0.02em; }
        .stat-label { font-size: 13px; color: #888; margin-top: 6px; font-weight: 300; }

        /* 機能セクション */
        .section { padding: 100px 40px; max-width: 1100px; margin: 0 auto; }
        .section-eyebrow {
          font-size: 12px; font-weight: 500; letter-spacing: 0.15em;
          color: #888; text-transform: uppercase; margin-bottom: 16px;
        }
        .section-title {
          font-size: 36px; font-weight: 700; letter-spacing: -0.02em;
          margin-bottom: 60px; line-height: 1.2;
        }

        .features-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px;
        }
        .feature-card { padding: 32px; border: 1px solid #f0f0f0; border-radius: 12px; }
        .feature-card:hover { border-color: #ddd; }
        .feature-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: #f7f7f7; display: flex; align-items: center; justify-content: center;
          font-size: 18px; margin-bottom: 16px;
        }
        .feature-title { font-size: 15px; font-weight: 600; margin-bottom: 10px; }
        .feature-desc { font-size: 14px; color: #666; line-height: 1.7; font-weight: 300; }

        /* 導入フロー */
        .flow-section { background: #f7f7f7; padding: 100px 40px; }
        .flow-inner { max-width: 1100px; margin: 0 auto; }
        .flow-steps {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
          margin-top: 60px; position: relative;
        }
        .flow-step { text-align: center; padding: 0 20px; position: relative; }
        .flow-step::after {
          content: '→'; position: absolute; right: -10px; top: 20px;
          font-size: 20px; color: #ccc;
        }
        .flow-step:last-child::after { display: none; }
        .flow-num {
          width: 48px; height: 48px; border-radius: 50%;
          background: #1a1a1a; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 600; margin: 0 auto 16px;
        }
        .flow-title { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
        .flow-desc { font-size: 13px; color: #666; line-height: 1.6; font-weight: 300; }

        /* CTAセクション */
        .cta-section {
          padding: 120px 40px; text-align: center;
          max-width: 700px; margin: 0 auto;
        }
        .cta-title {
          font-size: 40px; font-weight: 700; letter-spacing: -0.02em;
          margin-bottom: 20px; line-height: 1.2;
        }
        .cta-desc { font-size: 16px; color: #666; margin-bottom: 36px; font-weight: 300; line-height: 1.7; }
        .cta-actions { display: flex; gap: 12px; justify-content: center; }

        /* フッター */
        footer {
          border-top: 1px solid #f0f0f0; padding: 40px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .footer-logo { font-size: 13px; font-weight: 600; color: #1a1a1a; }
        .footer-copy { font-size: 12px; color: #aaa; }

        @media (max-width: 768px) {
          .hero { grid-template-columns: 1fr; padding: 120px 20px 60px; gap: 40px; }
          .hero-title { font-size: 32px; }
          .features-grid { grid-template-columns: 1fr; }
          .flow-steps { grid-template-columns: 1fr 1fr; gap: 30px; }
          .flow-step::after { display: none; }
          .stats { flex-direction: column; gap: 30px; }
          .stat-item { border-right: none; border-bottom: 1px solid #e0e0e0; padding-bottom: 30px; }
          nav { padding: 0 20px; }
          .nav-links { display: none; }
        }
      `}</style>

      {/* ナビ */}
      <nav>
        <a href="/" className="nav-logo">Digkio Lab.</a>
        <div className="nav-links">
          <a href="#features">機能</a>
          <a href="#flow">導入の流れ</a>
          <a href="#contact">お問い合わせ</a>
          <a href="/login" className="nav-cta">ログイン</a>
        </div>
      </nav>

      {/* ヒーロー */}
      <section>
        <div className="hero">
          <div>
            <p className="hero-eyebrow">AI Avatar Reception</p>
            <h1 className="hero-title">
              人手不足の受付を、<br />
              <span>AIアバターが</span><br />
              笑顔でサポート
            </h1>
            <p className="hero-desc">
              3Dキャラクターが来訪者をお迎えし、自然な会話でご案内。
              24時間365日、御社の"顔"として受付業務を担います。
              初期設定からサポートするので、すぐに始められます。
            </p>
            <div className="hero-actions">
              <a href="#contact" className="btn-primary">お問い合わせ</a>
              <a href="#features" className="btn-secondary">機能を見る</a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="avatar-mockup">
              <div className="avatar-face"></div>
            </div>
            <div className="chat-bubble">
              いらっしゃいませ！本日はどのようなご用件でしょうか？
            </div>
          </div>
        </div>
      </section>

      {/* 数字 */}
      <div className="stats">
        <div className="stat-item">
          <div className="stat-num">24h</div>
          <div className="stat-label">365日稼働</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">多言語</div>
          <div className="stat-label">対応可能</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">即日</div>
          <div className="stat-label">導入スタート</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">自動</div>
          <div className="stat-label">来訪ログ記録</div>
        </div>
      </div>

      {/* 機能 */}
      <section id="features" className="section">
        <p className="section-eyebrow">Features</p>
        <h2 className="section-title">受付業務に必要な機能を<br />すべて備えています</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3 className="feature-title">自然な会話案内</h3>
            <p className="feature-desc">3Dアバターが音声とテキストで質問に答え、行き先や手続き方法を丁寧にご案内します。</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3 className="feature-title">担当者に自動通知</h3>
            <p className="feature-desc">来訪者の用件や伝言をメールで自動送信し、担当者の対応漏れを防ぎます。</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">来訪ログを自動記録</h3>
            <p className="feature-desc">来訪者数やよくある質問を自動で蓄積。Google Sheetsに保存し、業務改善に活用できます。</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎭</div>
            <h3 className="feature-title">キャラクターをカスタマイズ</h3>
            <p className="feature-desc">ブランドに合わせた3Dキャラクターで、印象に残る受付体験を実現します。</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📞</div>
            <h3 className="feature-title">担当者への電話呼び出し</h3>
            <p className="feature-desc">来訪者がタッチパネルから担当者に直接電話できます。対応漏れを防ぎます。</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3 className="feature-title">セキュアなアクセス管理</h3>
            <p className="feature-desc">会社ごとに専用アカウントを発行。1デバイス制限で情報漏洩を防ぎます。</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3 className="feature-title">多言語でのご案内</h3>
            <p className="feature-desc">日本語以外の言語にも拡張可能。インバウンドのお客様にもスムーズに対応できます。</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3 className="feature-title">請求書・オンライン決済</h3>
            <p className="feature-desc">PDFで請求書を自動作成し、Stripeによるオンライン決済リンクをメールで送付できます。</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">😊</div>
            <h3 className="feature-title">表情・感情表現</h3>
            <p className="feature-desc">会話の内容に応じてアバターの表情が変化。来訪者との距離を縮める体験を提供します。</p>
          </div>
        </div>
      </section>

      {/* 導入フロー */}
      <div className="flow-section" id="flow">
        <div className="flow-inner">
          <p className="section-eyebrow">How it works</p>
          <h2 className="section-title">導入の流れ</h2>
          <div className="flow-steps">
            <div className="flow-step">
              <div className="flow-num">1</div>
              <h3 className="flow-title">お問い合わせ</h3>
              <p className="flow-desc">フォームよりご連絡ください。ご要望をお聞きします。</p>
            </div>
            <div className="flow-step">
              <div className="flow-num">2</div>
              <h3 className="flow-title">初期設定</h3>
              <p className="flow-desc">キャラクターや会話内容をカスタマイズします。</p>
            </div>
            <div className="flow-step">
              <div className="flow-num">3</div>
              <h3 className="flow-title">デバイス接続</h3>
              <p className="flow-desc">既存のディスプレイに接続するだけで準備完了。</p>
            </div>
            <div className="flow-step">
              <div className="flow-num">4</div>
              <h3 className="flow-title">受付スタート</h3>
              <p className="flow-desc">すぐに24時間受付を開始できます。</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div id="contact">
        <div className="cta-section">
          <h2 className="cta-title">自社の受付に<br />フィットするか相談する</h2>
          <p className="cta-desc">
            導入の流れや料金について、お気軽にご相談ください。
            貴社の受付環境に合わせたご提案をいたします。
          </p>
          <div className="cta-actions">
            <a href="mailto:md26ssyt@gmail.com" className="btn-primary">メールでお問い合わせ</a>
          </div>
        </div>
      </div>

      {/* フッター */}
      <footer>
        <div className="footer-logo">Digkio Lab.</div>
        <div className="footer-copy">© 2026 Digkio Lab. All rights reserved.</div>
      </footer>
    </>
  );
}