export default function Privacy() {
  return (
    <div className="legal-page">
      <a href="/company" className="back">← ADIKIO Technologies</a>
      <article>
        <h1>プライバシーポリシー</h1>
        <p className="updated">最終更新日：［ここに日付を記載］</p>

        <p>
          ADIKIO Technologies（以下「当社」）は、本サービスの利用者（以下「利用者」）の
          個人情報を適切に取り扱うため、本プライバシーポリシーを定めます。
        </p>

        <h2>1. 取得する情報</h2>
        <ul>
          <li>会話の内容（占い・観光案内・雑談・心の相談を含む、本サービス上でのやり取り）</li>
          <li>メールアドレス（会員登録をされた場合）</li>
          <li>お支払いに関する情報（決済処理はStripe, Inc.が行い、当社はカード番号等を保持しません）</li>
          <li>利用状況に関する情報（アクセス日時、利用回数、ブラウザの言語設定等）</li>
        </ul>

        <h2>2. 利用目的</h2>
        <ul>
          <li>本サービスの提供・応答生成のため</li>
          <li>無料利用枠の管理、および有料プランの提供のため</li>
          <li>サービス改善のための分析</li>
          <li>お問い合わせへの対応</li>
        </ul>

        <h2>3. 第三者への提供</h2>
        <p>
          当社は、会話内容を応答生成のためにGoogle LLC（Gemini API、Text-to-Speech API）へ、
          決済処理のためにStripe, Inc.へ送信します。これらの提供先は、それぞれの
          プライバシーポリシーに基づき情報を取り扱います。当社は、法令に基づく場合を除き、
          取得した情報を上記以外の第三者に提供することはありません。
        </p>

        <h2>4. 心の相談機能における特記事項</h2>
        <p>
          「心の相談」機能でのやり取りは、他の機能と同様にAIによる応答生成のために外部サービスへ
          送信されます。特に機微な内容を含む可能性があることをご理解の上でご利用ください。
          当社は、この情報を上記の利用目的以外に使用しません。
        </p>

        <h2>5. データの保管期間</h2>
        <p>
          会話履歴等のデータは、サービス提供に必要な期間保管し、不要となった場合には適切に
          削除します。利用者は、自身のデータの削除を希望する場合、下記お問い合わせ先まで
          ご連絡ください。
        </p>

        <h2>6. お問い合わせ</h2>
        <p>
          本ポリシーに関するお問い合わせ、または個人情報の開示・訂正・削除のご請求は、
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
