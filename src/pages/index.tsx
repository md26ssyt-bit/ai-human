import { useState } from "react";
import Head from "next/head";

export default function Home() {
  const [formData, setFormData] = useState({ company: "", name: "", phone: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setSending(false);
    if (res.ok) {
      setSent(true);
      setFormData({ company: "", name: "", phone: "", email: "", message: "" });
    } else {
      alert("送信に失敗しました。もう一度お試しください。");
    }
  };

  return (
    <>
      <Head>
        <title>AIアバター受付キオスク | Digital Kiosk Lab.</title>
        <meta name="description" content="人手不足の受付を、AIアバターが笑顔でサポート。中小企業向け無人受付システム。" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700;900&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Noto Sans JP', sans-serif; background: #fff; color: #1a1a1a; line-height: 1.6; }

        /* ナビ */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(255,255,255,0.96); backdrop-filter: blur(10px);
          border-bottom: 1px solid #efefef;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 5%;  height: 60px;
        }
        .nav-logo { font-size: 14px; font-weight: 700; letter-spacing: 0.08em; color: #1a1a1a; text-decoration: none; }
        .nav-right { display: flex; gap: 24px; align-items: center; }
        .nav-link { font-size: 13px; color: #666; text-decoration: none; }
        .nav-link:hover { color: #1a1a1a; }
        .nav-btn { background: #1a1a1a; color: #fff; padding: 8px 18px; border-radius: 6px; font-size: 13px; font-weight: 500; text-decoration: none; }

        /* ヒーロー */
        .hero {
          padding: 120px 5% 80px;
          min-height: 100vh;
          display: flex; align-items: center;
          background: linear-gradient(160deg, #fff 55%, #f3f3f3 100%);
          gap: 60px;
        }
        .hero-left { flex: 1; max-width: 580px; }
        .hero-badge {
          display: inline-block; background: #1a1a1a; color: #fff;
          font-size: 11px; font-weight: 700; letter-spacing: 0.15em;
          padding: 6px 14px; border-radius: 4px; margin-bottom: 24px;
          text-transform: uppercase;
        }
        .hero-h1 { font-size: clamp(36px, 5vw, 58px); font-weight: 900; line-height: 1.1; letter-spacing: -0.03em; margin-bottom: 24px; }
        .hero-h1 em { font-style: normal; color: #555; }
        .hero-lead { font-size: 16px; color: #555; line-height: 1.85; margin-bottom: 16px; font-weight: 300; }
        .hero-pain { background: #f7f7f7; border-left: 3px solid #1a1a1a; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 36px; font-size: 14px; color: #444; line-height: 1.8; }
        .hero-pain strong { display: block; font-size: 13px; font-weight: 700; margin-bottom: 8px; color: #1a1a1a; }
        .hero-btns { display: flex; gap: 12px; flex-wrap: wrap; }
        .btn-black { background: #1a1a1a; color: #fff; padding: 16px 32px; border-radius: 8px; font-size: 15px; font-weight: 700; text-decoration: none; border: none; cursor: pointer; display: inline-block; }
        .btn-black:hover { background: #333; }
        .btn-outline { background: transparent; color: #1a1a1a; padding: 16px 32px; border-radius: 8px; font-size: 15px; font-weight: 500; text-decoration: none; border: 2px solid #ddd; display: inline-block; }
        .btn-outline:hover { border-color: #999; }

        .hero-right { flex: 1; max-width: 480px; }
        .hero-card {
          background: #1a1a1a; border-radius: 20px; padding: 40px;
          color: #fff; position: relative; overflow: hidden;
        }
        .hero-card::before {
          content: ''; position: absolute; top: -60px; right: -60px;
          width: 200px; height: 200px; background: rgba(255,255,255,0.04);
          border-radius: 50%;
        }
        .avatar-area { text-align: center; margin-bottom: 24px; }
        .avatar-circle {
          width: 80px; height: 80px; border-radius: 50%;
          background: linear-gradient(135deg, #555, #333);
          margin: 0 auto 12px; display: flex; align-items: center; justify-content: center;
          font-size: 32px;
        }
        .avatar-name { font-size: 13px; color: #aaa; }
        .chat-list { display: flex; flex-direction: column; gap: 12px; }
        .chat-ai {
          background: #2a2a2a; border-radius: 0 12px 12px 12px;
          padding: 12px 16px; font-size: 13px; color: #eee; line-height: 1.6;
          max-width: 85%;
        }
        .chat-user {
          background: #fff; border-radius: 12px 0 12px 12px;
          padding: 12px 16px; font-size: 13px; color: #1a1a1a; line-height: 1.6;
          max-width: 85%; align-self: flex-end;
        }
        .typing { display: flex; gap: 4px; align-items: center; padding: 8px 16px; }
        .typing span {
          width: 6px; height: 6px; background: #666; border-radius: 50%;
          animation: bounce 1.2s infinite;
        }
        .typing span:nth-child(2) { animation-delay: 0.2s; }
        .typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }

        /* 問題提起 */
        .problem { padding: 100px 5%; background: #fff; }
        .problem-inner { max-width: 1000px; margin: 0 auto; }
        .sec-label { font-size: 11px; font-weight: 700; letter-spacing: 0.2em; color: #999; text-transform: uppercase; margin-bottom: 16px; }
        .sec-h2 { font-size: clamp(28px, 4vw, 44px); font-weight: 900; letter-spacing: -0.02em; margin-bottom: 16px; line-height: 1.15; }
        .sec-lead { font-size: 16px; color: #666; font-weight: 300; margin-bottom: 60px; }
        .pain-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .pain-card { border: 1px solid #efefef; border-radius: 12px; padding: 28px; }
        .pain-emoji { font-size: 28px; margin-bottom: 14px; display: block; }
        .pain-title { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
        .pain-desc { font-size: 13px; color: #777; line-height: 1.75; font-weight: 300; }

        /* 解決策 */
        .solution { padding: 100px 5%; background: #f7f7f7; }
        .solution-inner { max-width: 1000px; margin: 0 auto; }
        .solution-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; margin-top: 60px; }
        .solution-visual {
          background: #1a1a1a; border-radius: 16px; padding: 40px;
          color: #fff; text-align: center;
        }
        .solution-icon { font-size: 60px; margin-bottom: 20px; }
        .solution-caption { font-size: 14px; color: #aaa; line-height: 1.7; }
        .solution-list { display: flex; flex-direction: column; gap: 20px; }
        .solution-item { display: flex; gap: 16px; align-items: flex-start; }
        .solution-check {
          width: 28px; height: 28px; background: #1a1a1a; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 13px; flex-shrink: 0; margin-top: 2px;
        }
        .solution-text h4 { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
        .solution-text p { font-size: 13px; color: #666; line-height: 1.7; font-weight: 300; }

        /* 機能 */
        .features { padding: 100px 5%; background: #fff; }
        .features-inner { max-width: 1000px; margin: 0 auto; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 60px; }
        .feature-card { padding: 28px; border: 1px solid #efefef; border-radius: 12px; transition: box-shadow 0.2s; }
        .feature-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .feature-icon { font-size: 24px; margin-bottom: 14px; display: block; }
        .feature-title { font-size: 14px; font-weight: 700; margin-bottom: 8px; }
        .feature-desc { font-size: 13px; color: #777; line-height: 1.75; font-weight: 300; }

        /* 料金 */
        .pricing { padding: 100px 5%; background: #1a1a1a; color: #fff; }
        .pricing-inner { max-width: 700px; margin: 0 auto; text-align: center; }
        .pricing-label { font-size: 11px; font-weight: 700; letter-spacing: 0.2em; color: #666; text-transform: uppercase; margin-bottom: 16px; }
        .pricing-h2 { font-size: clamp(28px, 4vw, 44px); font-weight: 900; letter-spacing: -0.02em; margin-bottom: 16px; }
        .pricing-lead { font-size: 15px; color: #aaa; font-weight: 300; margin-bottom: 48px; line-height: 1.8; }
        .pricing-card {
          background: #2a2a2a; border-radius: 16px; padding: 48px;
          border: 1px solid #333;
        }
        .pricing-price { font-size: 48px; font-weight: 900; letter-spacing: -0.03em; margin-bottom: 8px; }
        .pricing-note { font-size: 13px; color: #888; margin-bottom: 32px; }
        .pricing-features { text-align: left; display: flex; flex-direction: column; gap: 14px; margin-bottom: 36px; }
        .pricing-feature { display: flex; gap: 12px; font-size: 14px; color: #ccc; align-items: center; }
        .pricing-feature::before { content: '✓'; color: #fff; font-weight: 700; flex-shrink: 0; }
        .btn-white { background: #fff; color: #1a1a1a; padding: 16px 40px; border-radius: 8px; font-size: 15px; font-weight: 700; text-decoration: none; display: inline-block; border: none; cursor: pointer; width: 100%; }
        .btn-white:hover { background: #f0f0f0; }

        /* FAQ */
        .faq { padding: 100px 5%; background: #fff; }
        .faq-inner { max-width: 700px; margin: 0 auto; }
        .faq-list { margin-top: 60px; display: flex; flex-direction: column; gap: 0; }
        .faq-item { border-bottom: 1px solid #efefef; padding: 24px 0; }
        .faq-q { font-size: 15px; font-weight: 700; margin-bottom: 12px; display: flex; gap: 12px; }
        .faq-q::before { content: 'Q'; background: #1a1a1a; color: #fff; width: 24px; height: 24px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0; margin-top: 2px; }
        .faq-a { font-size: 14px; color: #666; line-height: 1.8; font-weight: 300; padding-left: 36px; }

        /* CTA最終 */
        .final-cta { padding: 100px 5%; background: #f7f7f7; }
        .final-cta-inner { max-width: 700px; margin: 0 auto; }
        .cta-h2 { font-size: clamp(28px, 4vw, 44px); font-weight: 900; letter-spacing: -0.02em; margin-bottom: 16px; line-height: 1.2; }
        .cta-lead { font-size: 15px; color: #666; font-weight: 300; margin-bottom: 48px; line-height: 1.8; }

        /* フォーム */
        .form { display: flex; flex-direction: column; gap: 14px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form input, .form textarea {
          width: 100%; padding: 14px 16px;
          border: 1.5px solid #e0e0e0; border-radius: 8px;
          font-size: 14px; font-family: inherit;
          background: #fff; color: #1a1a1a;
          outline: none; transition: border-color 0.2s;
        }
        .form input:focus, .form textarea:focus { border-color: #1a1a1a; }
        .form textarea { resize: vertical; min-height: 120px; }
        .form-submit { background: #1a1a1a; color: #fff; padding: 16px; border-radius: 8px; font-size: 15px; font-weight: 700; border: none; cursor: pointer; font-family: inherit; }
        .form-submit:hover { background: #333; }
        .form-submit:disabled { background: #999; cursor: not-allowed; }
        .sent-msg { background: #f0faf0; border: 1px solid #c0e0c0; border-radius: 8px; padding: 20px; text-align: center; font-size: 14px; color: #2a7a2a; font-weight: 500; }

        /* フッター */
        footer { padding: 40px 5%; border-top: 1px solid #efefef; display: flex; justify-content: space-between; align-items: center; }
        .footer-logo { font-size: 13px; font-weight: 700; }
        .footer-copy { font-size: 12px; color: #aaa; }

        @media (max-width: 768px) {
          .hero { flex-direction: column; padding: 100px 5% 60px; }
          .hero-right { width: 100%; max-width: 100%; }
          .pain-grid, .features-grid { grid-template-columns: 1fr; }
          .solution-grid { grid-template-columns: 1fr; }
          .form-row { grid-template-columns: 1fr; }
          .nav-right .nav-link { display: none; }
          footer { flex-direction: column; gap: 8px; text-align: center; }
        }
      `}</style>

      {/* ナビ */}
      <nav className="nav">
        <a href="/" className="nav-logo">Digital Kiosk Lab.</a>
        <div className="nav-right">
          <a href="#features" className="nav-link">機能</a>
          <a href="#pricing" className="nav-link">料金</a>
          <a href="#contact" className="nav-link">お問い合わせ</a>
          <a href="/login" className="nav-btn">ログイン</a>
        </div>
      </nav>

      {/* ヒーロー */}
      <section className="hero">
        <div className="hero-left">
          <span className="hero-badge">AI Avatar Reception</span>
          <h1 className="hero-h1">
            受付に<em>人を置く</em><br />
            時代は、終わった。
          </h1>
          <p className="hero-lead">
            AIアバターが来訪者をお迎えし、用件を聞き、担当者へ自動連絡。
            中小企業の受付業務を、まるごとデジタルが担います。
          </p>
          <div className="hero-pain">
            <strong>こんなお悩みはありませんか？</strong>
            「受付のためだけにスタッフを配置するのはコストがかかる」<br />
            「来客対応で本来の業務が止まる」「夜間・休日の来訪に対応できない」
          </div>
          <div className="hero-btns">
            <a href="#contact" className="btn-black">今すぐ相談する（無料）</a>
            <a href="#features" className="btn-outline">機能を見る</a>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-card">
            <div className="avatar-area">
              <div className="avatar-circle">🤖</div>
              <p className="avatar-name">AIコンシェルジュ</p>
            </div>
            <div className="chat-list">
              <div className="chat-ai">いらっしゃいませ！本日はどのようなご用件でしょうか？</div>
              <div className="chat-user">営業の田中さんにお会いしたいのですが。</div>
              <div className="chat-ai">承知しました。田中へご連絡いたします。少々お待ちください。</div>
              <div className="chat-ai" style={{background: '#222'}}>
                <div className="typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 問題提起 */}
      <section className="problem" id="problem">
        <div className="problem-inner">
          <p className="sec-label">Problem</p>
          <h2 className="sec-h2">受付業務の<br />3つの課題</h2>
          <p className="sec-lead">多くの中小企業が、受付に関して同じ問題を抱えています。</p>
          <div className="pain-grid">
            <div className="pain-card">
              <span className="pain-emoji">💸</span>
              <h3 className="pain-title">人件費がかかりすぎる</h3>
              <p className="pain-desc">受付専任スタッフの採用・教育コストは年間数百万円。少ない来客数に対して割に合わない投資になりがちです。</p>
            </div>
            <div className="pain-card">
              <span className="pain-emoji">⏰</span>
              <h3 className="pain-title">本来の業務が止まる</h3>
              <p className="pain-desc">受付対応のたびに手を止める必要があり、集中力が途切れ、生産性が低下。担当者への取り次ぎも手間がかかります。</p>
            </div>
            <div className="pain-card">
              <span className="pain-emoji">🌙</span>
              <h3 className="pain-title">時間外の来訪に対応できない</h3>
              <p className="pain-desc">営業時間外・休日の来訪者への対応が難しく、機会損失や印象悪化につながることがあります。</p>
            </div>
          </div>
        </div>
      </section>

      {/* 解決策 */}
      <section className="solution">
        <div className="solution-inner">
          <p className="sec-label">Solution</p>
          <h2 className="sec-h2">AIアバターが<br />すべて解決します</h2>
          <div className="solution-grid">
            <div className="solution-visual">
              <div className="solution-icon">🤖</div>
              <p className="solution-caption">
                24時間365日稼働。<br />
                御社のブランドに合わせた<br />
                3Dアバターが来訪者をお迎えします。
              </p>
            </div>
            <div className="solution-list">
              <div className="solution-item">
                <div className="solution-check">✓</div>
                <div className="solution-text">
                  <h4>自然な会話で用件を把握</h4>
                  <p>AIが来訪者の用件を聞き取り、適切な担当者へ自動で取り次ぎます。</p>
                </div>
              </div>
              <div className="solution-item">
                <div className="solution-check">✓</div>
                <div className="solution-text">
                  <h4>担当者にリアルタイム通知</h4>
                  <p>来訪情報をメールで即座に送信。取りこぼしゼロの対応が実現します。</p>
                </div>
              </div>
              <div className="solution-item">
                <div className="solution-check">✓</div>
                <div className="solution-text">
                  <h4>来訪ログを自動で蓄積</h4>
                  <p>会話内容・来訪日時をGoogle Sheetsに自動記録。業務改善に活用できます。</p>
                </div>
              </div>
              <div className="solution-item">
                <div className="solution-check">✓</div>
                <div className="solution-text">
                  <h4>既存環境にすぐ導入</h4>
                  <p>タブレットやディスプレイに接続するだけ。大掛かりな工事は不要です。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 機能 */}
      <section className="features" id="features">
        <div className="features-inner">
          <p className="sec-label">Features</p>
          <h2 className="sec-h2">すべての機能が<br />標準搭載</h2>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">💬</span>
              <h3 className="feature-title">AI会話案内</h3>
              <p className="feature-desc">Gemini AIが来訪者の質問に自然に回答。行き先案内から手続き説明まで対応します。</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📧</span>
              <h3 className="feature-title">担当者自動通知</h3>
              <p className="feature-desc">来訪目的・伝言をメールで即送信。担当者が別フロアにいても対応漏れがありません。</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📞</span>
              <h3 className="feature-title">電話呼び出し</h3>
              <p className="feature-desc">タッチパネルから担当者へ直接電話。緊急時も安心の対応が可能です。</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">😊</span>
              <h3 className="feature-title">表情・感情表現</h3>
              <p className="feature-desc">会話内容に応じてアバターの表情が変化。来訪者に温かみのある体験を提供します。</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📊</span>
              <h3 className="feature-title">来訪ログ自動記録</h3>
              <p className="feature-desc">会話内容をGoogle Sheetsに自動保存。来訪傾向の分析・業務改善に役立てられます。</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🔒</span>
              <h3 className="feature-title">1デバイス制限</h3>
              <p className="feature-desc">会社ごとに専用アカウントを発行。1台のみでしか使えないセキュアな設計です。</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🎭</span>
              <h3 className="feature-title">キャラクターカスタマイズ</h3>
              <p className="feature-desc">御社ブランドに合わせた3Dキャラクターを設定。会話内容・挨拶文も自由に変更可能です。</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💳</span>
              <h3 className="feature-title">請求書・オンライン決済</h3>
              <p className="feature-desc">PDF請求書を自動作成し、Stripeによる決済リンクをメールで送付できます。</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🌐</span>
              <h3 className="feature-title">多言語対応</h3>
              <p className="feature-desc">日本語以外の言語にも拡張可能。インバウンド対応にも活用できます。</p>
            </div>
          </div>
        </div>
      </section>

      {/* 料金 */}
      <section className="pricing" id="pricing">
        <div className="pricing-inner">
          <p className="pricing-label">Pricing</p>
          <h2 className="pricing-h2">シンプルな<br />月額プラン</h2>
          <p className="pricing-lead">
            初期費用・設定費用も含めてご相談ください。<br />
            貴社の規模・用途に合わせたプランをご提案します。
          </p>
          <div className="pricing-card">
            <div className="pricing-price">お問い合わせください</div>
            <p className="pricing-note">月額サブスクリプション｜初期設定込み</p>
            <div className="pricing-features">
              <div className="pricing-feature">AIアバター受付（24時間365日）</div>
              <div className="pricing-feature">担当者へのメール・電話通知</div>
              <div className="pricing-feature">来訪ログ自動記録（Google Sheets）</div>
              <div className="pricing-feature">キャラクター・会話カスタマイズ</div>
              <div className="pricing-feature">請求書発行・Stripe決済連携</div>
              <div className="pricing-feature">初期設定サポート込み</div>
            </div>
            <a href="#contact" className="btn-white">無料で相談する</a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq" id="faq">
        <div className="faq-inner">
          <p className="sec-label">FAQ</p>
          <h2 className="sec-h2">よくある質問</h2>
          <div className="faq-list">
            <div className="faq-item">
              <p className="faq-q">どんな機器が必要ですか？</p>
              <p className="faq-a">Androidタブレット・スマートフォン・PCなど、Chromeブラウザが使える機器であれば動作します。大掛かりな工事や専用端末の購入は不要です。</p>
            </div>
            <div className="faq-item">
              <p className="faq-q">設定は難しいですか？</p>
              <p className="faq-a">初期設定は弊社がサポートします。管理画面から会社名・挨拶文・担当者情報などを入力するだけで、すぐにご利用いただけます。</p>
            </div>
            <div className="faq-item">
              <p className="faq-q">複数の拠点で使えますか？</p>
              <p className="faq-a">はい、拠点ごとに個別のアカウントを発行できます。それぞれのキャラクターや会話内容を別々に設定することも可能です。</p>
            </div>
            <div className="faq-item">
              <p className="faq-q">会話の内容は外部に漏れませんか？</p>
              <p className="faq-a">会話ログはお客様専用のGoogle Sheetsに保存されます。弊社が内容を閲覧することはありません。</p>
            </div>
            <div className="faq-item">
              <p className="faq-q">解約はいつでもできますか？</p>
              <p className="faq-a">月単位でのご契約です。いつでも解約可能で、違約金は発生しません。</p>
            </div>
          </div>
        </div>
      </section>

      {/* 最終CTA・フォーム */}
      <section className="final-cta" id="contact">
        <div className="final-cta-inner">
          <p className="sec-label">Contact</p>
          <h2 className="cta-h2">まずは、<br />お気軽にご相談ください</h2>
          <p className="cta-lead">
            貴社の受付環境・規模・ご予算に合わせたプランをご提案します。<br />
            お問い合わせから48時間以内にご連絡いたします。
          </p>
          {sent ? (
            <div className="sent-msg">
              ✅ お問い合わせを受け付けました。<br />
              48時間以内にご連絡いたします。ありがとうございました。
            </div>
          ) : (
            <form className="form" onSubmit={handleSubmit}>
              <div className="form-row">
                <input
                  type="text" placeholder="会社名 *" required
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                />
                <input
                  type="text" placeholder="担当者名 *" required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="form-row">
                <input
                  type="tel" placeholder="電話番号 *" required
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
                <input
                  type="email" placeholder="メールアドレス *" required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <textarea
                placeholder="お問い合わせ内容（導入の背景・現在の課題など） *" required
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
              />
              <button type="submit" className="form-submit" disabled={sending}>
                {sending ? '送信中...' : '相談する（無料）'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* フッター */}
      <footer>
        <div className="footer-logo">Digital Kiosk Lab.</div>
        <div className="footer-copy">© 2026 Digital Kiosk Lab. All rights reserved.</div>
      </footer>
    </>
  );
}