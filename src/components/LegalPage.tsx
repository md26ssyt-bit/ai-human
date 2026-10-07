import { useEffect, useState } from "react";
import Head from "next/head";

export type LegalBlock = { h?: string; p?: string[]; ul?: string[] };
export type LegalDoc = { title: string; updated: string; blocks: LegalBlock[] };
type Lang = "ja" | "en";

const EMAIL = "contact@adikio.com";

// メールアドレスは、文字のまま表示する（クリックでメールアプリが開かないようにする）
function withLinks(text: string) {
  return text;
}

export default function LegalPage({ docs }: { docs: Record<Lang, LegalDoc> }) {
  const [lang, setLang] = useState<Lang>("ja");

  // ?lang=en / ?lang=ja が指定されていればそれを優先、なければブラウザの言語で判定
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("lang");
    if (q === "en" || q === "ja") {
      setLang(q);
      return;
    }
    const nav = (navigator.language || "ja").toLowerCase();
    setLang(nav.startsWith("ja") ? "ja" : "en");
  }, []);

  const doc = docs[lang];

  return (
    <div className="legal-page">
      <Head>
        <title>{doc.title} | ADIKIO Technologies</title>
      </Head>
      <div className="top">
        <a href="/" className="back">← ADIKIO Technologies</a>
        <div className="lang">
          <button type="button" aria-pressed={lang === "ja"} className={lang === "ja" ? "on" : ""} onClick={() => setLang("ja")}>日本語</button>
          <button type="button" aria-pressed={lang === "en"} className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>English</button>
        </div>
      </div>
      <article>
        <h1>{doc.title}</h1>
        <p className="updated">{lang === "ja" ? "最終更新日：" : "Last Updated: "}{doc.updated}</p>
        {doc.blocks.map((b, i) => (
          <section key={i}>
            {b.h && <h2>{b.h}</h2>}
            {b.p?.map((t, j) => (
              <p key={j}>{withLinks(t)}</p>
            ))}
            {b.ul && (
              <ul>
                {b.ul.map((t, j) => (
                  <li key={j}>{withLinks(t)}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>
      <style jsx>{`
        .legal-page {
          background: #14131f;
          color: #f2efe6;
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif;
          padding: 40px 6vw 96px;
        }
        .top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .back {
          color: #cfc9df;
          text-decoration: none;
          font-size: 14px;
        }
        .lang {
          display: flex;
          gap: 4px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 4px;
        }
        .lang button {
          border: none;
          background: transparent;
          color: #cfc9df;
          border-radius: 16px;
          padding: 4px 12px;
          font-size: 13px;
          cursor: pointer;
        }
        .lang button.on {
          background: #f2efe6;
          color: #14131f;
          font-weight: 600;
        }
        article {
          max-width: 680px;
          margin: 56px auto 0;
        }
        h1 {
          font-family: 'Fraunces', Georgia, 'Hiragino Mincho ProN', 'Noto Serif JP', serif;
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
          font-family: 'Fraunces', Georgia, 'Hiragino Mincho ProN', 'Noto Serif JP', serif;
          font-size: 19px;
          font-weight: 500;
          margin: 40px 0 14px;
        }
        p, li {
          color: #cfc9df;
          line-height: 1.85;
          font-size: 15px;
          white-space: pre-line;
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