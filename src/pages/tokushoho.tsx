import LegalPage from "../components/LegalPage";
import type { LegalDoc } from "../components/LegalPage";

const ja: LegalDoc = {
  title: "特定商取引法に基づく表記",
  updated: "2026年10月22日",
  blocks: [
    {
      p: [
        "ウェブサービス「心に灯る部屋」（以下「本サービス」）に関する、特定商取引法に基づく表記です。",
      ],
    },
    {
      h: "販売業者",
      p: ["ADIKIO Technologies"],
    },
    {
      h: "運営責任者",
      p: ["Hiroyuki Bannai"],
    },
    {
      h: "所在地",
      p: ["7-8-12, Nakayama Higashi-ku, Niigata City, Japan"],
    },
    {
      h: "電話番号",
      p: [
        "請求があった場合は、遅滞なく、電子メールで開示します。お問い合わせは、下記のメールアドレスまでお願いします。",
      ],
    },
    {
      h: "メールアドレス",
      p: ["contact@adikio.com"],
    },
    {
      h: "販売するもの",
      p: [
        "ウェブサービス「心に灯る部屋」の、有料のご利用（月額のプレミアムプラン、および都度課金のコンテンツ）",
      ],
      ul: [
        "プレミアムプラン（月額の定期課金）",
        "都度課金のコンテンツ（詳細な占術の鑑定、性格診断の詳細結果、占い・観光の詳細版、PDF鑑定書など）",
      ],
    },
    {
      h: "販売価格",
      p: [
        "プレミアムプランは、月額9.99米ドルです。購入前の画面に別の金額が表示されている場合は、その金額が適用されます。",
        "都度課金のコンテンツの金額は、コンテンツごとに、購入前の画面に表示します。",
      ],
    },
    {
      h: "商品代金以外の必要料金",
      p: [
        "本サービスの利用に必要な、インターネットの接続料金や通信料金は、お客様のご負担です。",
      ],
    },
    {
      h: "お支払い方法",
      p: [
        "クレジットカードなど、決済画面に表示される方法でのお支払いです。決済は、決済代行サービスの Stripe を通じて行います。",
      ],
    },
    {
      h: "お支払い時期",
      p: [
        "都度課金のコンテンツは、購入の手続きの際に、お支払いが確定します。プレミアムプランは、お申し込みの時に初回の請求が行われ、以降は、解約するまで、毎月の更新日に、自動で請求されます。",
      ],
    },
    {
      h: "サービスの提供時期",
      p: [
        "決済の完了後、直ちに、ご利用いただけます。",
      ],
    },
    {
      h: "返品・キャンセル",
      p: [
        "デジタルコンテンツの性質上、提供が完了した後の返品・返金には、法令で定められた場合を除き、原則として応じられません。システムの不具合などにより、決済が完了したにもかかわらず、コンテンツが提供されなかった場合は、下記のお問い合わせ先までご連絡ください。",
        "プレミアムプランは、いつでも解約できます。解約は、現在の請求期間の終了時に効力を生じ、次回以降の更新料金は請求されません。",
        "返金、解約、およびEU域内の消費者の撤回権については、「返金ポリシー」（/refund）をご確認ください。",
      ],
    },
    {
      h: "お問い合わせ",
      p: [
        "ADIKIO Technologies\n7-8-12, Nakayama Higashi-ku, Niigata City, Japan\ncontact@adikio.com",
      ],
    },
  ],
};

const en: LegalDoc = {
  title: "Notation Based on the Act on Specified Commercial Transactions",
  updated: "October 22, 2026",
  blocks: [
    {
      p: [
        "This page provides the information required under the Japanese Act on Specified Commercial Transactions for the web service “Kokoro ni Tomoru Heya” (“A Room Where Your Heart Glows”) (the “Service”).",
      ],
    },
    {
      h: "Seller",
      p: ["ADIKIO Technologies"],
    },
    {
      h: "Person Responsible for Operations",
      p: ["Hiroyuki Bannai"],
    },
    {
      h: "Address",
      p: ["7-8-12, Nakayama, Higashi-ku, Niigata City, Japan"],
    },
    {
      h: "Telephone Number",
      p: [
        "We will disclose it by email without delay upon request. Please contact us at the email address below.",
      ],
    },
    {
      h: "Email Address",
      p: ["contact@adikio.com"],
    },
    {
      h: "What We Sell",
      p: [
        "Paid use of the web service “Kokoro ni Tomoru Heya” (a monthly Premium plan and one-time paid content).",
      ],
      ul: [
        "Premium plan (monthly subscription)",
        "One-time paid content (such as in-depth readings, detailed personality results, detailed fortune and travel versions, and PDF reports)",
      ],
    },
    {
      h: "Prices",
      p: [
        "The Premium plan is USD 9.99 per month. If a different price is displayed before purchase, that price applies.",
        "The price of each one-time paid content item is displayed before purchase.",
      ],
    },
    {
      h: "Additional Charges",
      p: [
        "Internet connection and communication fees required to use the Service are borne by you.",
      ],
    },
    {
      h: "Payment Methods",
      p: [
        "Payment is made by credit card or other methods shown on the checkout screen. Payments are processed through the payment service Stripe.",
      ],
    },
    {
      h: "Payment Timing",
      p: [
        "For one-time paid content, payment is confirmed when you complete the purchase. For the Premium plan, the first charge is made when you subscribe, and you are then charged automatically on each monthly renewal date until you cancel.",
      ],
    },
    {
      h: "Delivery Timing",
      p: [
        "You can use the Service immediately after payment is completed.",
      ],
    },
    {
      h: "Returns and Cancellation",
      p: [
        "Because of the nature of digital content, and except where required by law, we generally cannot accept returns or provide refunds after delivery. If payment was completed but the content was not delivered because of a system error, please contact us using the details below.",
        "You may cancel the Premium plan at any time. Cancellation takes effect at the end of the current billing period, and you will not be charged again.",
        "For refunds, cancellation, and the right of withdrawal for consumers in the EU, please see our Refund Policy (/refund).",
      ],
    },
    {
      h: "Contact",
      p: [
        "ADIKIO Technologies\n7-8-12, Nakayama, Higashi-ku, Niigata City, Japan\ncontact@adikio.com",
      ],
    },
  ],
};

export default function Tokushoho() {
  return <LegalPage docs={{ ja, en }} />;
}