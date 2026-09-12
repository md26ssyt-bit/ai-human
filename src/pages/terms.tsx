export default function Terms() {
  return (
    <div className="legal-page">
      <a href="/company" className="back">← ADIKIO Technologies</a>
      <article>
        <h1>利用規約</h1>
        <p className="updated">最終更新日：［ここに日付を記載］</p>

        <p>
          本利用規約（以下「本規約」）は、ADIKIO Technologies（以下「当社」）が提供する
          AIアバターを用いた受付・案内サービス「ADIKIO Reception」および、占い・観光案内・
          雑談等の会話型サービス「ADIKIO Companion」（以下「本サービス」）の利用条件を定めるものです。
        </p>

        <h2>1. サービスの内容</h2>
        <p>
          本サービスは、人工知能（AI）を用いて生成された応答を、音声および3Dアバターの
          形で提供するものです。占い・性格診断・観光案内・雑談・心の相談等のコンテンツは、
          エンターテインメントおよび一般的な情報提供を目的としたものであり、医学的、法的、
          金融的な助言、診断、または治療に代わるものではありません。
        </p>

        <h2>2. 料金・お支払い</h2>
        <p>
          本サービスの一部機能は無料でご利用いただけますが、詳細な鑑定結果や観光プランの
          都度課金、および月額プレミアムプランについては、表示された金額をお支払いいただきます。
          決済はStripe, Inc.を通じて処理されます。月額プランは、解約の手続きを行わない限り、
          自動的に更新されます。
        </p>

        <h2>3. 禁止事項</h2>
        <ul>
          <li>本サービスを違法な目的で利用すること</li>
          <li>本サービスの運営を妨害する行為</li>
          <li>不正な手段により無料利用枠を回避する行為</li>
          <li>他者になりすます行為、または他者の権利を侵害する行為</li>
        </ul>

        <h2>4. 免責事項</h2>
        <p>
          当社は、本サービスが提供する応答内容の正確性、完全性、有用性について保証するものでは
          ありません。特に「心の相談」機能は、専門の医療従事者による診断・治療に代わるものでは
          なく、深刻な悩みをお持ちの場合は、専門機関へのご相談をお願いいたします。
        </p>

        <h2>5. サービスの変更・停止</h2>
        <p>
          当社は、事前の通知なく本サービスの内容を変更し、または提供を停止することがあります。
          これにより利用者に生じた損害について、当社は責任を負わないものとします。
        </p>

        <h2>6. 準拠法・管轄</h2>
        <p>
          本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた
          場合には、［管轄裁判所をここに記載してください］を第一審の専属的合意管轄裁判所とします。
        </p>

        <h2>7. お問い合わせ</h2>
        <p>
          本規約に関するお問い合わせは、
          <a href="mailto:contact@adikio-technologies.example">contact@adikio-technologies.example</a>
          までご連絡ください。
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
        p, li {
          color: #cfc9df;
          line-height: 1.85;
          font-size: 15px;
        }
        a { color: #f2efe6; }
        ul { padding-left: 20px; }
      `}</style>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600&family=Inter:wght@400;500;600&display=swap');
        body { margin: 0; }
      `}</style>
    </div>
  );
}
