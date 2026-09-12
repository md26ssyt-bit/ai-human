export default function Refund() {
  return (
    <div className="legal-page">
      <a href="/company" className="back">← ADIKIO Technologies</a>
      <article>
        <h1>返金ポリシー</h1>
        <p className="updated">最終更新日：［ここに日付を記載］</p>

        <h2>1. 都度課金（詳細鑑定・詳細観光プラン）</h2>
        <p>
          詳細鑑定・詳細観光プラン等の都度課金の商品は、決済完了後、直ちにコンテンツが
          生成・提供されるデジタルコンテンツです。その性質上、コンテンツの提供が完了した後の
          返金には原則として応じられません。決済前に、内容・金額を必ずご確認ください。
        </p>
        <p>
          ただし、システムの不具合により決済が完了したにもかかわらずコンテンツが提供されな
          かった場合には、下記お問い合わせ先までご連絡ください。確認の上、返金対応いたします。
        </p>

        <h2>2. 月額プレミアムプラン</h2>
        <p>
          月額プレミアムプランは、いつでも解約手続きを行うことができます。解約手続きを行った
          場合、当該請求期間の終了まではサービスをご利用いただけますが、既にお支払いいただいた
          料金の日割り等による返金は行っておりません。
        </p>

        <h2>3. 返金のご請求方法</h2>
        <p>
          上記1の不具合に該当する場合、決済日時・決済に使用したメールアドレスを添えて、
          <a href="mailto:contact@adikio-technologies.example">contact@adikio-technologies.example</a>
          までご連絡ください。内容を確認の上、対応いたします。
        </p>

        <h2>4. 消費者保護法令の適用</h2>
        <p>
          本ポリシーは、利用者が居住する国・地域の消費者保護法令上、利用者に認められる権利を
          制限するものではありません。
        </p>
      </article>
      <style jsx>{`
        .legal-page {
          background: #14131f;
          color: #f2efe6;
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          padding: 40px 6vw 96px;
        }
        .back {
          color: #cfc9df;
          text-decoration: none;
          font-size: 14px;
        }
        article {
          max-width: 680px;
          margin: 56px auto 0;
        }
        h1 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 36px;
          font-weight: 500;
          margin: 0 0 8px;
        }
        .updated {
          color: #a79fc0;
          font-size: 13px;
          margin: 0 0 40px;
        }
        h2 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 19px;
          font-weight: 500;
          margin: 40px 0 14px;
        }
        p {
          color: #cfc9df;
          line-height: 1.85;
          font-size: 15px;
        }
        a { color: #f2efe6; }
      `}</style>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600&family=Inter:wght@400;500;600&display=swap');
        body { margin: 0; }
      `}</style>
    </div>
  );
}
