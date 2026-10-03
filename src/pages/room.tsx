"use client";

import { useState, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { VRM, VRMLoaderPlugin } from "@pixiv/three-vrm";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// ======================
// ミステリアスな動く背景（「心に灯る部屋」の演出）
// ======================
function MysticBackground() {
  const particles = useState(() =>
    Array.from({ length: 22 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 10 + Math.random() * 14,
      delay: Math.random() * 14,
      hue: 260 + Math.random() * 60, // 紫〜青みの範囲
    }))
  )[0];

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div className="mystic-gradient" />
      {particles.map((p) => (
        <div
          key={p.id}
          className="mystic-particle"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            background: `hsl(${p.hue}, 80%, 75%)`,
            boxShadow: `0 0 ${p.size * 2}px hsl(${p.hue}, 90%, 70%)`,
          }}
        />
      ))}
      <style jsx>{`
        .mystic-gradient {
          position: absolute;
          inset: -10%;
          background: radial-gradient(ellipse at 50% 20%, #3a2260 0%, #201040 35%, #0a0616 75%);
          animation: mysticShift 18s ease-in-out infinite;
        }
        @keyframes mysticShift {
          0%, 100% { filter: hue-rotate(0deg) brightness(1); }
          50% { filter: hue-rotate(18deg) brightness(1.15); }
        }
        .mystic-particle {
          position: absolute;
          bottom: -5%;
          border-radius: 50%;
          opacity: 0;
          animation-name: floatUp;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        @keyframes floatUp {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.9; }
          50% { transform: translateY(-55vh) translateX(12px); }
          90% { opacity: 0.7; }
          100% { transform: translateY(-105vh) translateX(-8px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ======================
// SNS用の縦型リザルト画像（1080x1920）を生成・保存する
// ======================
type ShareImageOptions = {
  heading: string;                              // 上部の小見出し（サービス名など）
  title: string;                                // 結果のタイトル
  bars?: { label: string; value: number }[];   // 性格診断用のバー表示
  body?: string;                                // 占術用の本文（長い場合は末尾を省略）
  footer: string;                               // 下部のURLなど
};

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  // スペースで区切る言語は単語単位、日本語・中国語は1文字ずつ折り返す
  const tokens = text.includes(' ') ? text.split(/(\s+)/) : text.split('');
  const lines: string[] = [];
  let current = '';
  for (const tok of tokens) {
    if (tok === '\n') { lines.push(current); current = ''; continue; }
    const test = current + tok;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current.trimEnd());
      current = tok.trimStart();
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function createShareImage(opts: ShareImageOptions): Promise<Blob | null> {
  const W = 1080, H = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const font = "'Hiragino Sans','Noto Sans JP','Yu Gothic','Segoe UI',sans-serif";

  // 背景：ミステリアスなグラデーション
  const bg = ctx.createRadialGradient(W / 2, 400, 100, W / 2, 900, 1400);
  bg.addColorStop(0, '#4a2b7a');
  bg.addColorStop(0.5, '#221244');
  bg.addColorStop(1, '#080512');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 光の粒
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * W, y = Math.random() * H, r = 1 + Math.random() * 3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${260 + Math.random() * 60}, 80%, 80%, ${0.3 + Math.random() * 0.6})`;
    ctx.shadowColor = 'rgba(190,160,255,0.9)';
    ctx.shadowBlur = r * 4;
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // 見出し
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = `bold 48px ${font}`;
  ctx.fillText(opts.heading, W / 2, 200);

  // 区切り線
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(240, 250);
  ctx.lineTo(W - 240, 250);
  ctx.stroke();

  // タイトル
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold 76px ${font}`;
  ctx.fillText(opts.title, W / 2, 400);

  if (opts.bars) {
    // 性格診断：5指標のバー
    ctx.textAlign = 'left';
    let y = 560;
    for (const b of opts.bars) {
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold 46px ${font}`;
      ctx.fillText(b.label, 120, y);
      ctx.textAlign = 'right';
      ctx.fillText(`${b.value}%`, W - 120, y);
      ctx.textAlign = 'left';

      const trackX = 120, trackY = y + 30, trackW = W - 240, trackH = 36;
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      roundRectPath(ctx, trackX, trackY, trackW, trackH, 18);
      ctx.fill();
      const fillW = Math.max(trackH, (trackW * b.value) / 100);
      const grad = ctx.createLinearGradient(trackX, 0, trackX + trackW, 0);
      grad.addColorStop(0, '#a78bfa');
      grad.addColorStop(1, '#f0abfc');
      ctx.fillStyle = grad;
      roundRectPath(ctx, trackX, trackY, fillW, trackH, 18);
      ctx.fill();
      y += 200;
    }
    ctx.textAlign = 'center';
  } else if (opts.body) {
    // 占術：本文（収まらない分は省略）
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = `40px ${font}`;
    const lines = wrapLines(ctx, opts.body, W - 240);
    const maxLines = 18;
    const shown = lines.slice(0, maxLines);
    if (lines.length > maxLines) shown[maxLines - 1] = shown[maxLines - 1].replace(/.{0,1}$/, '…');
    let y = 540;
    for (const line of shown) {
      ctx.fillText(line, 120, y);
      y += 62;
    }
    ctx.textAlign = 'center';
  }

  // フッター
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = `bold 44px ${font}`;
  ctx.fillText(opts.footer, W / 2, 1820);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
}

// スマホなら共有シート（Instagram/TikTokなどへ直接）、PCならダウンロードで保存する
async function saveShareImage(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: 'image/png' });
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
  try {
    if (nav.canShare && nav.canShare({ files: [file] })) {
      await nav.share({ files: [file] });
      return;
    }
  } catch (e) {
    if ((e as Error).name === 'AbortError') return; // ユーザーが共有をキャンセルした場合は何もしない
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ======================
// Avatar（kiosk.tsxからそのまま流用）
// ======================
function Avatar({ vrmUrl, emotion = 'neutral', avatarY = -1.6 }: { vrmUrl: string, emotion?: string, avatarY?: number }) {
  const mouthState = useRef({ speaking: false, value: 0, volume: 0, inhale: false, blinkAfter: false });
  const [vrm, setVrm] = useState<VRM | null>(null);
  const [loading, setLoading] = useState(true);
  const blinkState = useRef({ timer: 0, nextBlink: 3, value: 0 });

  useEffect(() => {
    if (!vrmUrl) return;
    setLoading(true);
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    loader.load(vrmUrl, (gltf) => {
      const vrmModel = gltf.userData.vrm as VRM;
      setVrm(vrmModel);
      setLoading(false);
      const box = new THREE.Box3().setFromObject(vrmModel.scene);
      const center = box.getCenter(new THREE.Vector3());
      vrmModel.scene.position.sub(center);
      setVrm(vrmModel);
    });
    (window as any).mouthState = mouthState;
  }, [vrmUrl]);

  useFrame((_, delta) => {
    if (!vrm) return;
    const blink = blinkState.current;
    blink.timer += delta;
    if (blink.timer > blink.nextBlink) {
      blink.value += delta * 6;
      if (blink.value >= 1) {
        blink.value = 1;
        blink.timer = 0;
        blink.nextBlink = 2 + Math.random() * 3;
      }
    } else {
      blink.value -= delta * 6;
      if (blink.value < 0) blink.value = 0;
    }
    const breathe = Math.sin(Date.now() * 0.002) * 0.005;
    vrm.scene.position.y = breathe;
    const mouth = mouthState.current;
    mouth.value = mouth.speaking ? mouth.value * 0.7 + mouth.volume * 0.3 : 0;

    if (vrm.expressionManager) {
      vrm.expressionManager.setValue("blink", blink.value);
      vrm.expressionManager.setValue("aa", mouth.value);
      vrm.expressionManager.setValue("happy", emotion === 'happy' ? 0.8 : 0);
      vrm.expressionManager.setValue("sad", emotion === 'sad' ? 0.8 : 0);
      vrm.expressionManager.setValue("angry", emotion === 'angry' ? 0.8 : 0);
      vrm.expressionManager.setValue("surprised", emotion === 'surprised' ? 0.8 : 0);
      vrm.expressionManager.setValue("neutral", emotion === 'neutral' ? 0.3 : 0);
      vrm.expressionManager.update();
    }
    vrm.update(delta);

    const leftUpperArm = vrm.humanoid?.getRawBoneNode("leftUpperArm");
    const rightUpperArm = vrm.humanoid?.getRawBoneNode("rightUpperArm");
    const leftLowerArm = vrm.humanoid?.getRawBoneNode("leftLowerArm");
    const rightLowerArm = vrm.humanoid?.getRawBoneNode("rightLowerArm");
    const leftHand = vrm.humanoid?.getRawBoneNode("leftHand");
    const rightHand = vrm.humanoid?.getRawBoneNode("rightHand");
    if (leftUpperArm && rightUpperArm && leftLowerArm && rightLowerArm && leftHand && rightHand) {
      leftUpperArm.rotation.x = -0.25; rightUpperArm.rotation.x = -0.25;
      leftUpperArm.rotation.y = -1.8; rightUpperArm.rotation.y = 1.4;
      leftUpperArm.rotation.z = -1.1; rightUpperArm.rotation.z = 1.1;
      leftLowerArm.rotation.x = -1.0; rightLowerArm.rotation.x = -1.0;
      leftLowerArm.rotation.z = -0.2; rightLowerArm.rotation.z = 0.2;
      leftHand.rotation.x = 0.5; rightHand.rotation.x = 0.5;
    }
  });

  if (!vrm) return null;
  if (loading) return <mesh><boxGeometry /><meshStandardMaterial color="gray" /></mesh>;
  return (
    <group position={[0, avatarY, 0]} scale={3}>
      <primitive object={vrm.scene} />
    </group>
  );
}

// ======================
// 画面サイズ（アスペクト比）に応じてカメラを自動調整する
// ======================
function ResponsiveCamera({ baseFov, baseZ, baseY, targetY }: { baseFov: number; baseZ: number; baseY: number; targetY: number }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / size.height;
    const cam = camera as THREE.PerspectiveCamera;

    // 横長（PCなど）は基準値のまま、縦長（スマホなど）は画角を広げて
    // 全身が横方向にもはみ出さないようにする
    const fov = aspect < 1 ? Math.min(50, baseFov / aspect) : baseFov;
    const z = aspect < 1 ? baseZ * (baseFov / fov) * 1.6 : baseZ;

    cam.fov = fov;
    cam.position.set(0, baseY, z);
    cam.lookAt(0, targetY, 0);
    cam.updateProjectionMatrix();
  }, [size, camera, baseFov, baseZ, baseY, targetY]);
  return null;
}

// ======================
// メニューの種類
// ======================
type Mode = 'menu' | 'fortune' | 'travel' | 'free' | 'counseling' | 'fortune_detail' | 'travel_detail' | 'personality' | 'personality_detail';

type DetailKind = 'fortune' | 'travel';

// 価格（円・ドルの両方を用意しておき、言語判定に応じて出し分ける）
const DETAIL_PRICING: Record<DetailKind, { jpy: { amount: number; display: string }; usd: { amount: number; display: string } }> = {
  fortune: { jpy: { amount: 300, display: '¥300' }, usd: { amount: 299, display: '$2.99' } },
  travel: { jpy: { amount: 400, display: '¥400' }, usd: { amount: 399, display: '$3.99' } },
};

// ======================
// 言語・通貨（今はja/enの2言語。増やす場合はUIオブジェクトにキーを追加してください）
// ======================
type Lang = 'ja' | 'en' | 'zh' | 'id' | 'es';

const UI: Record<Lang, {
  chooseCharacter: string;
  topTitle: string;
  characterLabels: Record<'woman' | 'man' | 'witch', string>;
  menuHeading: string;
  btnFortune: string;
  btnPersonality: string;
  talkStyleTitle: string;
  talkStyleLabels: Record<'companion' | 'friend' | 'senior' | 'boss' | 'junior' | 'grandpa' | 'auntie' | 'cool', string>;
  occultSelectTitle: string;
  occultSimple: string;
  occultAstrology: string;
  occultNumerology: string;
  occultFourPillars: string;
  occultTarot: string;
  occultBirthdateLabel: string;
  occultTarotLabel: string;
  occultSubmit: string;
  shareImageButton: string;
  unlockDetailButton: string;
  loadingText: string;
  alreadySubscribed: string;
  subscribeFailed: string;
  occultYearlyPdf: string;
  tarotDeepPdf: string;
  toneSelectTitle: string;
  toneNormal: string;
  toneSpicy: string;
  personalityIntroTitle: string;
  personalityIntroBody: string;
  personalityIntroStart: string;
  travelPdfButton: string;
  trisetsuPdfButton: string;
  pdfGenerating: string;
  pdfFailed: string;
  traitLabels: Record<'extraversion' | 'agreeableness' | 'conscientiousness' | 'stability' | 'openness', string>;
  personalityQuestions: string[];
  likertOptions: string[];
  btnTravel: string;
  btnCounseling: string;
  btnFree: string;
  btnPremium: string;
  premiumModalTitle: string;
  premiumModalDesc: string;
  premiumEmailPlaceholder: string;
  premiumSubmit: string;
  premiumCancel: string;
  premiumThanks: string;
  back: string;
  send: string;
  talk: string;
  listening: string;
  placeholder: string;
  disclaimerCounseling: string;
  detailLabel: Record<DetailKind, string>;
  thanksHeading: string;
  tapReveal: string;
  greetingAfterCharacter: string;
  greetings: Record<'fortune' | 'travel' | 'free' | 'counseling', string>;
  crisis: string;
  speechRecognitionLang: string;
}> = {
  ja: {
    chooseCharacter: 'お話しするキャラクターを選んでください',
    topTitle: '心に灯るあなたの部屋',
    characterLabels: { woman: '女性', man: '男性', witch: '魔女' },
    menuHeading: '今日はどうしますか？',
    btnFortune: '🔮 占い',
    btnPersonality: '🧩 性格診断',
    talkStyleTitle: 'どんな相手として話しますか？',
    talkStyleLabels: {
      companion: 'やさしい伴走型', friend: '親しい友達型', senior: '頼れる先輩型', boss: '仕事のできる上司型',
      junior: '元気な後輩型', grandpa: 'そっと見守るおじいちゃん型', auntie: '世話好きなおばちゃん型', cool: 'ツンとした他人型',
    },
    occultSelectTitle: '占術を選んでください',
    occultSimple: '🔮 シンプル占い（無料）',
    occultAstrology: '🌌 西洋占星術',
    occultNumerology: '🔢 数秘術',
    occultFourPillars: '🀄 四柱推命',
    occultTarot: '🃏 タロット',
    occultBirthdateLabel: '生年月日を入力してください',
    occultTarotLabel: '気になっていることがあれば教えてください（未入力でもOK）',
    occultSubmit: '占ってもらう',
    shareImageButton: '📸 SNS用の画像を保存',
    unlockDetailButton: '🔓 詳しい結果を見る',
    loadingText: '読み込み中...',
    alreadySubscribed: 'このメールアドレスは、すでにプレミアムプランに登録されています。',
    subscribeFailed: '登録画面を開けませんでした。時間をおいてもう一度お試しください。',
    occultYearlyPdf: '📜 年間鑑定書PDF',
    tarotDeepPdf: '🃏 タロット本格鑑定書PDF',
    toneSelectTitle: 'どんな口調で話してもらいますか？',
    toneNormal: '😊 いつも通り（優しい）',
    toneSpicy: '🔥 激辛モード（辛口）',
    personalityIntroTitle: '🧩 15の質問であなたを診断します',
    personalityIntroBody: '5段階で答えるだけの簡単な15問。\n外向性・協調性・誠実性・情緒安定性・開放性の5つのタイプが分かります。\n\nさらに、答え終わった後には——\n📖 あなただけの「取扱説明書」\n🌑 あなたの「性格の闇（ダークサイド）」診断\nも、PDFで受け取れます。',
    personalityIntroStart: 'はじめる',
    travelPdfButton: '📄 観光プランをPDFで保存',
    trisetsuPdfButton: '📖 取説・ダークサイド診断PDF',
    pdfGenerating: 'PDFを作成しています…少々お待ちください',
    pdfFailed: 'PDFの作成に失敗しました。もう一度お試しください。',
    traitLabels: {
      extraversion: '🌟 外向性', agreeableness: '🤝 協調性', conscientiousness: '📅 誠実性',
      stability: '🌊 情緒安定性', openness: '🌈 開放性',
    },
    personalityQuestions: [
      '初対面の人ともわりと自然に話せる',
      'にぎやかな場に行くと元気が出る',
      '一人で静かに過ごす時間がいちばん落ち着く',
      '相手の気持ちを先に考えることが多い',
      'できるだけ人と争わずに話を進めたい',
      '意見が合わないと強く言い返したくなる',
      'やることを先に決めてから動くほうだ',
      '約束や締切はきちんと守りたい',
      '気分しだいで予定が後回しになりやすい',
      '小さなことでも長く気になりやすい',
      '気持ちの切り替えは比較的早い',
      '不安や心配で頭がいっぱいになりやすい',
      '新しい考え方や知らない世界にひかれる',
      'いつもと違うやり方を試すのが好きだ',
      '慣れた方法のほうが安心できる',
    ],
    likertOptions: ['とても近い', 'やや近い', 'どちらでもない', 'あまり近くない', 'まったく近くない'],
    btnTravel: '🗾 観光・お店を教えてもらう',
    btnCounseling: '🌱 心の相談',
    btnFree: '💬 自由に話す',
    btnPremium: '✨ プレミアムプランに登録',
    premiumModalTitle: 'プレミアムプラン（月額$9.99）',
    premiumModalDesc: '1日200回まで、たっぷりお話しいただけます。ご登録に使うメールアドレスを入力してください。',
    premiumEmailPlaceholder: 'メールアドレス',
    premiumSubmit: '登録手続きへ進む',
    premiumCancel: 'キャンセル',
    premiumThanks: 'ご登録ありがとうございます！プレミアムプランへようこそ🎉',
    back: '← 戻る',
    send: '送信',
    talk: '話す',
    listening: '聞いています...',
    placeholder: 'メッセージを入力...',
    disclaimerCounseling: 'この会話はAIによるものであり、医療従事者による診断・治療ではありません。深刻な悩みは、専門機関・医療機関へのご相談をおすすめします。',
    detailLabel: { fortune: '詳細占い', travel: '詳細観光プラン' },
    thanksHeading: 'ご購入ありがとうございます！',
    tapReveal: '🔮 タップして詳細版を聞く',
    greetingAfterCharacter: 'こんにちは！今日はどうしますか？',
    greetings: {
      fortune: 'こんにちは！今日はあなたの性格や運勢を見せてくださいね。まず、生年月日を教えてもらえますか？',
      travel: 'こんにちは！観光やお店のことなら何でも聞いてください。どのあたりを探していますか？',
      free: 'こんにちは！何でも自由に話しかけてくださいね。',
      counseling: 'こんにちは。今日はどんなことでも、気になっていることをゆっくり話してくださいね。',
    },
    crisis:
      'つらい気持ちを話してくれてありがとうございます。' +
      'そのお気持ちについては、専門の相談窓口にお話しすることをおすすめします。\n\n' +
      '・よりそいホットライン：0120-279-338（24時間・無料）\n' +
      '・いのちの電話：0570-783-556\n\n' +
      'あなたの気持ちを大切にしたいので、まずはこうした窓口に連絡してみてくださいね。',
    speechRecognitionLang: 'ja-JP',
  },
  en: {
    chooseCharacter: 'Please choose who you would like to talk to',
    topTitle: 'A Room Where Your Heart Glows',
    characterLabels: { woman: 'Woman', man: 'Man', witch: 'Witch' },
    menuHeading: 'What would you like to do today?',
    btnFortune: '🔮 Fortune Telling',
    btnPersonality: '🧩 Personality Test',
    talkStyleTitle: 'Who would you like to talk to?',
    talkStyleLabels: {
      companion: 'Gentle Companion', friend: 'Close Friend', senior: 'Reliable Senior', boss: 'Sharp Boss',
      junior: 'Cheerful Junior', grandpa: 'Watchful Grandpa', auntie: 'Caring Auntie', cool: 'Aloof Stranger',
    },
    occultSelectTitle: 'Choose a divination method',
    occultSimple: '🔮 Simple Fortune (Free)',
    occultAstrology: '🌌 Western Astrology',
    occultNumerology: '🔢 Numerology',
    occultFourPillars: '🀄 Four Pillars',
    occultTarot: '🃏 Tarot',
    occultBirthdateLabel: 'Please enter your date of birth',
    occultTarotLabel: "Tell us what's on your mind (optional)",
    occultSubmit: 'Get My Reading',
    shareImageButton: '📸 Save image for social media',
    unlockDetailButton: '🔓 See detailed results',
    loadingText: 'Loading...',
    alreadySubscribed: 'This email address is already subscribed to the Premium Plan.',
    subscribeFailed: 'Could not open the checkout page. Please try again later.',
    occultYearlyPdf: '📜 Yearly Fortune Report (PDF)',
    tarotDeepPdf: '🃏 In-Depth Tarot Reading (PDF)',
    toneSelectTitle: 'How would you like them to speak?',
    toneNormal: '😊 Normal (Gentle)',
    toneSpicy: '🔥 Spicy Mode (Harsh)',
    personalityIntroTitle: '🧩 Discover yourself in 15 questions',
    personalityIntroBody: "Just 15 quick questions on a 5-point scale.\nYou'll learn your Extraversion, Agreeableness, Conscientiousness, Emotional Stability, and Openness.\n\nAnd once you're done——\n📖 Your very own \"Instruction Manual\"\n🌑 Your \"Dark Side\" diagnosis\nare also available as a PDF.",
    personalityIntroStart: 'Start',
    travelPdfButton: '📄 Save travel plan as PDF',
    trisetsuPdfButton: '📖 Instruction Manual & Dark Side PDF',
    pdfGenerating: 'Creating your PDF… please wait',
    pdfFailed: 'Failed to create the PDF. Please try again.',
    traitLabels: {
      extraversion: '🌟 Extraversion', agreeableness: '🤝 Agreeableness', conscientiousness: '📅 Conscientiousness',
      stability: '🌊 Emotional Stability', openness: '🌈 Openness',
    },
    personalityQuestions: [
      'I can talk fairly naturally with people I just met',
      'Lively places give me energy',
      'I feel most at ease spending quiet time alone',
      'I tend to consider the other person\'s feelings first',
      'I prefer to avoid conflict and keep discussions smooth',
      'I tend to argue back strongly when I disagree',
      'I like to decide what to do before acting',
      'I want to keep promises and deadlines properly',
      'My plans tend to get pushed back depending on my mood',
      'Even small things tend to bother me for a long time',
      'I switch my mood relatively quickly',
      'My mind tends to fill up with anxiety or worry',
      'I\'m drawn to new ideas and unfamiliar worlds',
      'I like trying different ways of doing things',
      'I feel safer sticking to familiar methods',
    ],
    likertOptions: ['Strongly agree', 'Somewhat agree', 'Neutral', 'Somewhat disagree', 'Strongly disagree'],
    btnTravel: '🗾 Travel & Local Spots',
    btnCounseling: '🌱 Talk About Your Feelings',
    btnFree: '💬 Just Chat',
    btnPremium: '✨ Join Premium Plan',
    premiumModalTitle: 'Premium Plan ($9.99/month)',
    premiumModalDesc: 'Chat up to 200 times a day, as much as your heart desires. Please enter the email address you want to use.',
    premiumEmailPlaceholder: 'Email address',
    premiumSubmit: 'Continue to checkout',
    premiumCancel: 'Cancel',
    premiumThanks: 'Thank you for subscribing! Welcome to Premium 🎉',
    back: '← Back',
    send: 'Send',
    talk: 'Talk',
    listening: 'Listening...',
    placeholder: 'Type a message...',
    disclaimerCounseling: 'This conversation is powered by AI and is not a diagnosis or treatment from a medical professional. For serious concerns, please consult a professional or medical service.',
    detailLabel: { fortune: 'Detailed Reading', travel: 'Detailed Travel Plan' },
    thanksHeading: 'Thank you for your purchase!',
    tapReveal: '🔮 Tap to hear your detailed reading',
    greetingAfterCharacter: 'Hello! What would you like to do today?',
    greetings: {
      fortune: "Hi! Let's take a look at your personality and fortune. Could you tell me your date of birth first?",
      travel: 'Hi! Ask me anything about places to visit or eat around here. Where are you looking to explore?',
      free: "Hi! Feel free to talk to me about anything.",
      counseling: "Hi. Please feel free to share anything that's on your mind, whenever you're ready.",
    },
    crisis:
      'Thank you for sharing how you feel. Please consider reaching out to a professional support line.\n\n' +
      '・988 Suicide & Crisis Lifeline (US): call or text 988\n' +
      '・International Association for Suicide Prevention (find a local helpline): https://www.iasp.info/resources/Crisis_Centres/\n\n' +
      'Your feelings matter — please reach out to one of these resources.',
    speechRecognitionLang: 'en-US',
  },
  zh: {
    chooseCharacter: '请选择您想对话的角色',
    topTitle: '点亮心灯的房间',
    characterLabels: { woman: '女性', man: '男性', witch: '女巫' },
    menuHeading: '今天想做点什么呢？',
    btnFortune: '🔮 占卜',
    btnPersonality: '🧩 性格测试',
    talkStyleTitle: '您想和什么样的对象聊天？',
    talkStyleLabels: {
      companion: '温柔伴随型', friend: '亲密朋友型', senior: '可靠前辈型', boss: '干练上司型',
      junior: '元气后辈型', grandpa: '静静守护的爷爷型', auntie: '热心大妈型', cool: '高冷型',
    },
    occultSelectTitle: '请选择占卜方式',
    occultSimple: '🔮 简单占卜（免费）',
    occultAstrology: '🌌 西方占星术',
    occultNumerology: '🔢 数字命理学',
    occultFourPillars: '🀄 四柱推命',
    occultTarot: '🃏 塔罗牌',
    occultBirthdateLabel: '请输入您的出生日期',
    occultTarotLabel: '请告诉我们您在意的事情（可不填）',
    occultSubmit: '开始占卜',
    shareImageButton: '📸 保存社交媒体分享图',
    unlockDetailButton: '🔓 查看详细结果',
    loadingText: '加载中...',
    alreadySubscribed: '该邮箱已订阅高级会员。',
    subscribeFailed: '无法打开付款页面，请稍后再试。',
    occultYearlyPdf: '📜 年度运势鉴定书PDF',
    tarotDeepPdf: '🃏 深度塔罗鉴定书PDF',
    toneSelectTitle: '希望以什么样的语气和你说话？',
    toneNormal: '😊 一如既往（温柔）',
    toneSpicy: '🔥 辣评模式（毒舌）',
    personalityIntroTitle: '🧩 15个问题，测出真实的你',
    personalityIntroBody: '只需用5个等级回答15个简单问题。\n即可了解你的外向性、亲和性、尽责性、情绪稳定性和开放性。\n\n答完之后——\n📖 专属于你的「使用说明书」\n🌑 你的「性格暗黑面」诊断\n还可以获取PDF版本哦。',
    personalityIntroStart: '开始',
    travelPdfButton: '📄 保存观光行程PDF',
    trisetsuPdfButton: '📖 使用说明书・暗黑面诊断PDF',
    pdfGenerating: '正在生成PDF，请稍候…',
    pdfFailed: 'PDF生成失败，请重试。',
    traitLabels: {
      extraversion: '🌟 外向性', agreeableness: '🤝 亲和性', conscientiousness: '📅 尽责性',
      stability: '🌊 情绪稳定性', openness: '🌈 开放性',
    },
    personalityQuestions: [
      '和初次见面的人也能比较自然地交谈',
      '去热闹的场合会让我充满活力',
      '一个人安静度过的时光最让我放松',
      '我常常会先考虑对方的感受',
      '我希望尽量不与人争执，顺利推进对话',
      '意见不合时我会想强烈反驳',
      '我倾向于先决定好要做的事再行动',
      '我很重视遵守约定和截止日期',
      '我的计划容易因心情而被推迟',
      '即使是小事也容易在意很久',
      '我的情绪切换比较快',
      '我容易因为不安或担心而满脑子都是那件事',
      '我被新的想法和未知的世界所吸引',
      '我喜欢尝试和平时不同的做法',
      '我用熟悉的方法会更安心',
    ],
    likertOptions: ['非常符合', '比较符合', '不确定', '不太符合', '完全不符合'],
    btnTravel: '🗾 旅游・美食推荐',
    btnCounseling: '🌱 心事倾诉',
    btnFree: '💬 随便聊聊',
    btnPremium: '✨ 加入高级会员',
    premiumModalTitle: '高级会员（每月 $9.99）',
    premiumModalDesc: '每天最多可畅聊200次。请输入用于注册的电子邮箱。',
    premiumEmailPlaceholder: '电子邮箱',
    premiumSubmit: '前往付款',
    premiumCancel: '取消',
    premiumThanks: '感谢您的订阅！欢迎加入高级会员🎉',
    back: '← 返回',
    send: '发送',
    talk: '说话',
    listening: '正在聆听...',
    placeholder: '请输入消息...',
    disclaimerCounseling: '本对话由AI生成，并非医疗专业人员的诊断或治疗。如遇严重困扰，请咨询专业机构或医疗服务。',
    detailLabel: { fortune: '详细占卜', travel: '详细旅游计划' },
    thanksHeading: '感谢您的购买！',
    tapReveal: '🔮 点击收听详细内容',
    greetingAfterCharacter: '你好！今天想做点什么呢？',
    greetings: {
      fortune: '你好！让我来看看你的性格和运势吧。可以先告诉我你的出生日期吗？',
      travel: '你好！关于旅游和美食，随时可以问我。你想去哪个地区看看？',
      free: '你好！有什么都可以和我聊聊哦。',
      counseling: '你好，不管是什么事情，都可以慢慢和我说说看。',
    },
    crisis:
      '谢谢你愿意说出自己的心情。关于这份心情，建议向专业的咨询机构求助。\n\n' +
      '・国际自杀预防协会（查找当地求助热线）：https://www.iasp.info/resources/Crisis_Centres/\n\n' +
      '你的感受很重要，请一定尝试联系以上资源。',
    speechRecognitionLang: 'cmn-CN',
  },
  id: {
    chooseCharacter: 'Silakan pilih karakter yang ingin diajak bicara',
    topTitle: 'Ruang Tempat Hatimu Bersinar',
    characterLabels: { woman: 'Wanita', man: 'Pria', witch: 'Penyihir' },
    menuHeading: 'Hari ini mau melakukan apa?',
    btnFortune: '🔮 Ramalan',
    btnPersonality: '🧩 Tes Kepribadian',
    talkStyleTitle: 'Ingin mengobrol dengan siapa?',
    talkStyleLabels: {
      companion: 'Pendamping Lembut', friend: 'Teman Dekat', senior: 'Senior Andalan', boss: 'Atasan Cekatan',
      junior: 'Junior Ceria', grandpa: 'Kakek Pengayom', auntie: 'Bibi Perhatian', cool: 'Orang Asing yang Dingin',
    },
    occultSelectTitle: 'Pilih metode ramalan',
    occultSimple: '🔮 Ramalan Sederhana (Gratis)',
    occultAstrology: '🌌 Astrologi Barat',
    occultNumerology: '🔢 Numerologi',
    occultFourPillars: '🀄 Four Pillars',
    occultTarot: '🃏 Tarot',
    occultBirthdateLabel: 'Silakan masukkan tanggal lahir Anda',
    occultTarotLabel: 'Ceritakan apa yang sedang Anda pikirkan (opsional)',
    occultSubmit: 'Mulai Ramalan',
    shareImageButton: '📸 Simpan gambar untuk media sosial',
    unlockDetailButton: '🔓 Lihat hasil lengkap',
    loadingText: 'Memuat...',
    alreadySubscribed: 'Alamat email ini sudah berlangganan Paket Premium.',
    subscribeFailed: 'Tidak dapat membuka halaman pembayaran. Silakan coba lagi nanti.',
    occultYearlyPdf: '📜 Laporan Ramalan Tahunan (PDF)',
    tarotDeepPdf: '🃏 Pembacaan Tarot Mendalam (PDF)',
    toneSelectTitle: 'Ingin berbicara dengan gaya seperti apa?',
    toneNormal: '😊 Biasa (Lembut)',
    toneSpicy: '🔥 Mode Pedas (Ketus)',
    personalityIntroTitle: '🧩 Kenali dirimu lewat 15 pertanyaan',
    personalityIntroBody: 'Cukup jawab 15 pertanyaan singkat dengan skala 5 tingkat.\nKamu akan mengetahui tingkat Ekstraversi, Keramahan, Kehati-hatian, Stabilitas Emosi, dan Keterbukaanmu.\n\nDan setelah selesai——\n📖 \"Buku Panduan\" dirimu sendiri\n🌑 Diagnosis \"Sisi Gelap\" dirimu\njuga bisa didapatkan dalam bentuk PDF.',
    personalityIntroStart: 'Mulai',
    travelPdfButton: '📄 Simpan rencana wisata sebagai PDF',
    trisetsuPdfButton: '📖 PDF Buku Panduan & Sisi Gelap',
    pdfGenerating: 'Membuat PDF… mohon tunggu',
    pdfFailed: 'Gagal membuat PDF. Silakan coba lagi.',
    traitLabels: {
      extraversion: '🌟 Ekstraversi', agreeableness: '🤝 Keramahan', conscientiousness: '📅 Kehati-hatian',
      stability: '🌊 Stabilitas Emosi', openness: '🌈 Keterbukaan',
    },
    personalityQuestions: [
      'Saya bisa cukup alami mengobrol dengan orang yang baru saya temui',
      'Tempat yang ramai membuat saya bersemangat',
      'Waktu tenang sendirian adalah saat saya paling nyaman',
      'Saya cenderung memikirkan perasaan orang lain terlebih dahulu',
      'Saya ingin menghindari konflik dan menjaga pembicaraan tetap lancar',
      'Saya cenderung membalas dengan kuat saat tidak sependapat',
      'Saya suka menentukan apa yang harus dilakukan sebelum bertindak',
      'Saya ingin menepati janji dan tenggat waktu dengan baik',
      'Rencana saya cenderung tertunda tergantung suasana hati',
      'Hal kecil pun cenderung mengganggu pikiran saya cukup lama',
      'Suasana hati saya cukup cepat berubah',
      'Pikiran saya cenderung dipenuhi kecemasan atau kekhawatiran',
      'Saya tertarik pada ide baru dan dunia yang belum dikenal',
      'Saya suka mencoba cara yang berbeda dari biasanya',
      'Saya merasa lebih aman dengan cara yang sudah biasa',
    ],
    likertOptions: ['Sangat sesuai', 'Agak sesuai', 'Netral', 'Kurang sesuai', 'Sama sekali tidak sesuai'],
    btnTravel: '🗾 Info Wisata & Tempat Makan',
    btnCounseling: '🌱 Curhat',
    btnFree: '💬 Ngobrol Santai',
    btnPremium: '✨ Berlangganan Paket Premium',
    premiumModalTitle: 'Paket Premium ($9.99/bulan)',
    premiumModalDesc: 'Mengobrol hingga 200 kali sehari, sepuasnya sesuai keinginan hati. Silakan masukkan alamat email yang ingin digunakan.',
    premiumEmailPlaceholder: 'Alamat email',
    premiumSubmit: 'Lanjut ke pembayaran',
    premiumCancel: 'Batal',
    premiumThanks: 'Terima kasih telah berlangganan! Selamat datang di Premium 🎉',
    back: '← Kembali',
    send: 'Kirim',
    talk: 'Bicara',
    listening: 'Sedang mendengarkan...',
    placeholder: 'Ketik pesan...',
    disclaimerCounseling: 'Percakapan ini dihasilkan oleh AI dan bukan diagnosis atau perawatan dari tenaga medis profesional. Untuk masalah serius, silakan konsultasikan dengan profesional atau layanan medis.',
    detailLabel: { fortune: 'Ramalan Detail', travel: 'Rencana Wisata Detail' },
    thanksHeading: 'Terima kasih atas pembelian Anda!',
    tapReveal: '🔮 Ketuk untuk mendengar hasil detail',
    greetingAfterCharacter: 'Halo! Hari ini mau melakukan apa?',
    greetings: {
      fortune: 'Halo! Ayo lihat kepribadian dan ramalanmu. Boleh tahu tanggal lahirmu dulu?',
      travel: 'Halo! Tanyakan apa saja soal tempat wisata atau kuliner di sekitar sini. Area mana yang ingin kamu jelajahi?',
      free: 'Halo! Jangan ragu untuk ngobrol apa saja denganku.',
      counseling: 'Halo. Silakan ceritakan apa saja yang sedang kamu pikirkan, kapan pun kamu siap.',
    },
    crisis:
      'Terima kasih sudah mau berbagi perasaanmu. Sebaiknya hubungi layanan konseling profesional.\n\n' +
      '・International Association for Suicide Prevention (cari layanan bantuan terdekat): https://www.iasp.info/resources/Crisis_Centres/\n\n' +
      'Perasaanmu penting — silakan hubungi salah satu layanan di atas.',
    speechRecognitionLang: 'id-ID',
  },
  es: {
    chooseCharacter: 'Por favor, elige con quién te gustaría hablar',
    topTitle: 'Una Habitación Donde Brilla Tu Corazón',
    characterLabels: { woman: 'Mujer', man: 'Hombre', witch: 'Bruja' },
    menuHeading: '¿Qué te gustaría hacer hoy?',
    btnFortune: '🔮 Adivinación',
    btnPersonality: '🧩 Test de Personalidad',
    talkStyleTitle: '¿Con quién te gustaría hablar?',
    talkStyleLabels: {
      companion: 'Acompañante Amable', friend: 'Amigo Cercano', senior: 'Mentor de Confianza', boss: 'Jefe Eficaz',
      junior: 'Junior Enérgico', grandpa: 'Abuelo Protector', auntie: 'Tía Atenta', cool: 'Desconocido Distante',
    },
    occultSelectTitle: 'Elige un método de adivinación',
    occultSimple: '🔮 Adivinación Simple (Gratis)',
    occultAstrology: '🌌 Astrología Occidental',
    occultNumerology: '🔢 Numerología',
    occultFourPillars: '🀄 Cuatro Pilares',
    occultTarot: '🃏 Tarot',
    occultBirthdateLabel: 'Por favor, introduce tu fecha de nacimiento',
    occultTarotLabel: 'Cuéntanos qué te preocupa (opcional)',
    occultSubmit: 'Obtener Mi Lectura',
    shareImageButton: '📸 Guardar imagen para redes sociales',
    unlockDetailButton: '🔓 Ver resultados detallados',
    loadingText: 'Cargando...',
    alreadySubscribed: 'Este correo electrónico ya está suscrito al Plan Premium.',
    subscribeFailed: 'No se pudo abrir la página de pago. Inténtalo de nuevo más tarde.',
    occultYearlyPdf: '📜 Informe de Fortuna Anual (PDF)',
    tarotDeepPdf: '🃏 Lectura Profunda de Tarot (PDF)',
    toneSelectTitle: '¿Con qué tono te gustaría que hable?',
    toneNormal: '😊 Normal (Amable)',
    toneSpicy: '🔥 Modo Picante (Duro)',
    personalityIntroTitle: '🧩 Descúbrete en 15 preguntas',
    personalityIntroBody: 'Solo 15 preguntas rápidas en una escala de 5 niveles.\nConocerás tu Extraversión, Amabilidad, Responsabilidad, Estabilidad Emocional y Apertura.\n\nY una vez termines——\n📖 Tu propio \"Manual de Instrucciones\"\n🌑 Tu diagnóstico de \"Lado Oscuro\"\ntambién estarán disponibles en PDF.',
    personalityIntroStart: 'Comenzar',
    travelPdfButton: '📄 Guardar plan de viaje en PDF',
    trisetsuPdfButton: '📖 PDF de Manual e Lado Oscuro',
    pdfGenerating: 'Creando tu PDF… espera un momento',
    pdfFailed: 'No se pudo crear el PDF. Inténtalo de nuevo.',
    traitLabels: {
      extraversion: '🌟 Extraversión', agreeableness: '🤝 Amabilidad', conscientiousness: '📅 Responsabilidad',
      stability: '🌊 Estabilidad Emocional', openness: '🌈 Apertura',
    },
    personalityQuestions: [
      'Puedo hablar con bastante naturalidad con personas que acabo de conocer',
      'Los lugares animados me dan energía',
      'Me siento más tranquilo/a pasando tiempo tranquilo a solas',
      'Suelo pensar primero en los sentimientos de la otra persona',
      'Prefiero evitar conflictos y mantener las conversaciones fluidas',
      'Tiendo a responder con firmeza cuando no estoy de acuerdo',
      'Me gusta decidir qué hacer antes de actuar',
      'Quiero cumplir promesas y plazos correctamente',
      'Mis planes tienden a posponerse según mi estado de ánimo',
      'Incluso las cosas pequeñas tienden a preocuparme durante mucho tiempo',
      'Cambio de humor con relativa rapidez',
      'Mi mente tiende a llenarse de ansiedad o preocupación',
      'Me atraen las ideas nuevas y los mundos desconocidos',
      'Me gusta probar formas diferentes de hacer las cosas',
      'Me siento más seguro/a con métodos conocidos',
    ],
    likertOptions: ['Totalmente de acuerdo', 'Algo de acuerdo', 'Neutral', 'Algo en desacuerdo', 'Totalmente en desacuerdo'],
    btnTravel: '🗾 Turismo y Lugares Locales',
    btnCounseling: '🌱 Hablar de Tus Sentimientos',
    btnFree: '💬 Charlar Libremente',
    btnPremium: '✨ Unirse al Plan Premium',
    premiumModalTitle: 'Plan Premium ($9.99/mes)',
    premiumModalDesc: 'Chatea hasta 200 veces al día, tanto como tu corazón desee. Introduce el correo electrónico que quieres usar.',
    premiumEmailPlaceholder: 'Correo electrónico',
    premiumSubmit: 'Continuar al pago',
    premiumCancel: 'Cancelar',
    premiumThanks: '¡Gracias por suscribirte! Bienvenido/a a Premium 🎉',
    back: '← Atrás',
    send: 'Enviar',
    talk: 'Hablar',
    listening: 'Escuchando...',
    placeholder: 'Escribe un mensaje...',
    disclaimerCounseling: 'Esta conversación es generada por IA y no constituye un diagnóstico ni tratamiento de un profesional médico. Para asuntos serios, consulta a un profesional o servicio médico.',
    detailLabel: { fortune: 'Lectura Detallada', travel: 'Plan de Viaje Detallado' },
    thanksHeading: '¡Gracias por tu compra!',
    tapReveal: '🔮 Toca para escuchar el resultado detallado',
    greetingAfterCharacter: '¡Hola! ¿Qué te gustaría hacer hoy?',
    greetings: {
      fortune: '¡Hola! Vamos a ver tu personalidad y tu fortuna. ¿Podrías decirme primero tu fecha de nacimiento?',
      travel: '¡Hola! Pregúntame lo que quieras sobre lugares para visitar o comer por aquí. ¿Qué zona te gustaría explorar?',
      free: '¡Hola! Siéntete libre de hablar conmigo sobre lo que quieras.',
      counseling: 'Hola. Cuéntame con calma lo que te preocupe, cuando te sientas listo/a.',
    },
    crisis:
      'Gracias por compartir cómo te sientes. Te recomendamos contactar con una línea de ayuda profesional.\n\n' +
      '・Teléfono de la Esperanza (España): 717 003 717\n' +
      '・Línea 024 (atención a la conducta suicida, España): 024\n' +
      '・International Association for Suicide Prevention (encuentra ayuda cerca de ti): https://www.iasp.info/resources/Crisis_Centres/\n\n' +
      'Tus sentimientos importan — por favor, contacta con uno de estos recursos.',
    speechRecognitionLang: 'es-ES',
  },
};

// ======================
// 選べるキャラクター
// ======================
type CharacterId = 'woman' | 'man' | 'witch';
const CHARACTERS: { id: CharacterId; label: string; emoji: string; vrmUrl: string }[] = [
  { id: 'woman', label: '女性', emoji: '👩', vrmUrl: '/woman.vrm' },
  { id: 'man', label: '男性', emoji: '🧑', vrmUrl: '/man.vrm' },
  { id: 'witch', label: '魔女', emoji: '🧙‍♀️', vrmUrl: '/witch.vrm' },
];

// ======================
// 性格診断（ビッグファイブ・15問）
// ======================
type Trait = 'extraversion' | 'agreeableness' | 'conscientiousness' | 'stability' | 'openness';

const PERSONALITY_QUESTIONS: { trait: Trait; reverse: boolean; text: string }[] = [
  { trait: 'extraversion', reverse: false, text: '初対面の人ともわりと自然に話せる' },
  { trait: 'extraversion', reverse: false, text: 'にぎやかな場に行くと元気が出る' },
  { trait: 'extraversion', reverse: true, text: '一人で静かに過ごす時間がいちばん落ち着く' },
  { trait: 'agreeableness', reverse: false, text: '相手の気持ちを先に考えることが多い' },
  { trait: 'agreeableness', reverse: false, text: 'できるだけ人と争わずに話を進めたい' },
  { trait: 'agreeableness', reverse: true, text: '意見が合わないと強く言い返したくなる' },
  { trait: 'conscientiousness', reverse: false, text: 'やることを先に決めてから動くほうだ' },
  { trait: 'conscientiousness', reverse: false, text: '約束や締切はきちんと守りたい' },
  { trait: 'conscientiousness', reverse: true, text: '気分しだいで予定が後回しになりやすい' },
  { trait: 'stability', reverse: true, text: '小さなことでも長く気になりやすい' },
  { trait: 'stability', reverse: false, text: '気持ちの切り替えは比較的早い' },
  { trait: 'stability', reverse: true, text: '不安や心配で頭がいっぱいになりやすい' },
  { trait: 'openness', reverse: false, text: '新しい考え方や知らない世界にひかれる' },
  { trait: 'openness', reverse: false, text: 'いつもと違うやり方を試すのが好きだ' },
  { trait: 'openness', reverse: true, text: '慣れた方法のほうが安心できる' },
];

const LIKERT_OPTIONS: { value: number; label: string }[] = [
  { value: 5, label: 'とても近い' },
  { value: 4, label: 'やや近い' },
  { value: 3, label: 'どちらでもない' },
  { value: 2, label: 'あまり近くない' },
  { value: 1, label: 'まったく近くない' },
];

function calcTraitScores(answers: number[]): Record<Trait, number> {
  const traits: Trait[] = ['extraversion', 'agreeableness', 'conscientiousness', 'stability', 'openness'];
  const scores = {} as Record<Trait, number>;
  traits.forEach((trait) => {
    const items = PERSONALITY_QUESTIONS
      .map((q, i) => ({ ...q, answer: answers[i] }))
      .filter((q) => q.trait === trait);
    const sum = items.reduce((acc, q) => acc + (q.reverse ? 6 - q.answer : q.answer), 0);
    // 1問1〜5点×3問＝3〜15点を、0〜100%に正規化
    scores[trait] = Math.round(((sum - 3) / 12) * 100);
  });
  return scores;
}

// 「自由に話す」モード限定：話し相手タイプ（プレミアム会員向け）
const TALK_STYLES: { id: string; label: string; emoji: string }[] = [
  { id: 'companion', label: 'やさしい伴走型', emoji: '🌱' },
  { id: 'friend', label: '親しい友達型', emoji: '😊' },
  { id: 'senior', label: '頼れる先輩型', emoji: '💪' },
  { id: 'boss', label: '仕事のできる上司型', emoji: '💼' },
  { id: 'junior', label: '元気な後輩型', emoji: '✨' },
  { id: 'grandpa', label: 'そっと見守るおじいちゃん型', emoji: '👴' },
  { id: 'auntie', label: '世話好きなおばちゃん型', emoji: '👵' },
  { id: 'cool', label: 'ツンとした他人型', emoji: '😐' },
];

// ======================
// 危機的なサインの簡易検知（AIに判断を任せず、機械的に検知する）
// ここに該当した場合は、Geminiに送らず即座に相談窓口を案内する
// ======================
const CRISIS_KEYWORDS = [
  '死にたい', '死のう', '消えたい', '自殺', '自傷', 'リストカット',
  '生きていたくない', '殺して', '飛び降り', '首を吊'
];

function containsCrisisSignal(text: string): boolean {
  return CRISIS_KEYWORDS.some(kw => text.includes(kw));
}

// ======================
// Home（占い・観光情報・雑談ページ）
// ======================
export default function FortunePage() {
  const [mode, setMode] = useState<Mode>('menu');
  const [character, setCharacter] = useState<CharacterId | null>(null);
  const characterRef = useRef<CharacterId | null>(null); // 状態更新の反映待ちを避けるための参照
  const [characterMode, setCharacterMode] = useState<'normal' | 'spicy'>('normal');
  const characterModeRef = useRef<'normal' | 'spicy'>('normal');
  const [pendingCharacter, setPendingCharacter] = useState<CharacterId | null>(null); // 口調選択待ちのキャラクター
  const talkStyleRef = useRef<string | null>(null); // 状態更新の反映待ちを避けるための参照

  // ブラウザの言語設定から、表示言語・通貨を自動判定する
  const [lang, setLang] = useState<Lang>('ja');
  const langRef = useRef<Lang>('ja'); // 状態更新の反映待ちを避けるための参照
  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    const nav = (navigator.language || 'ja').toLowerCase();
    const detected: Lang = nav.startsWith('ja') ? 'ja' : nav.startsWith('zh') ? 'zh' : nav.startsWith('id') ? 'id' : 'en';
    langRef.current = detected;
    setLang(detected);
  }, []);
  const t = UI[lang];
  const currency: 'jpy' | 'usd' = lang === 'ja' ? 'jpy' : 'usd'; // 円か米ドルかの2択。中国語・インドネシア語圏の方にも米ドル表示になります

  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const lastQuestionRef = useRef<string>(''); // 詳細版購入時、直前の質問を引き継ぐため
  const [detailUnlocked, setDetailUnlocked] = useState<Set<DetailKind>>(new Set());
  const [showDetailReveal, setShowDetailReveal] = useState(false); // Stripeから戻ってきた直後の「タップして聞く」画面
  const [pendingDetailReply, setPendingDetailReply] = useState('');
  const [pendingDetailKind, setPendingDetailKind] = useState<DetailKind | null>(null);
  const [purchaseError, setPurchaseError] = useState(''); // 決済確認に失敗した場合のエラー文言
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumEmail, setPremiumEmail] = useState('');
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [premiumError, setPremiumError] = useState('');
  const [showPremiumThanks, setShowPremiumThanks] = useState(false);
  const [showPersonalityIntro, setShowPersonalityIntro] = useState(false);
  const [personalityAnswers, setPersonalityAnswers] = useState<number[]>([]);
  const [personalityScores, setPersonalityScores] = useState<Record<Trait, number> | null>(null);
  const [personalityUnlocked, setPersonalityUnlocked] = useState(false);
  const [personalityResultText, setPersonalityResultText] = useState('');
  const [talkStyle, setTalkStyle] = useState<string | null>(null);
  const [pendingFreeStart, setPendingFreeStart] = useState(false);
  const [occultStep, setOccultStep] = useState<'closed' | 'select' | 'input' | 'result'>('closed');
  const [occultType, setOccultType] = useState<'astrology' | 'numerology' | 'four_pillars' | 'tarot' | 'yearly_pdf' | 'tarot_deep' | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfStep, setPdfStep] = useState<'closed' | 'result'>('closed');
  const [pdfError, setPdfError] = useState('');
  const [occultInput, setOccultInput] = useState('');
  const [occultResultText, setOccultResultText] = useState('');
  const [inputText, setInputText] = useState('');
  const [emotion, setEmotion] = useState('neutral');
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // カメラ・アバターの位置調整用（?camera=1 を付けた時だけパネルを表示）
  // キャラクターごとに体格・比率が違うため、キャラクターごとに個別の値を持たせる
  const DEFAULT_CAM = { fov: 28.05, camZ: 5.5, camY: 1.35, targetY: 1.1, avatarY: -2.4 };
  const [camSettingsByCharacter, setCamSettingsByCharacter] = useState<Record<string, typeof DEFAULT_CAM>>({
    default: { ...DEFAULT_CAM },
    woman: { ...DEFAULT_CAM },
    man: { ...DEFAULT_CAM, avatarY: -2.9 },
    witch: { ...DEFAULT_CAM },
  });
  const camKey = character ?? 'default';
  const camSettings = camSettingsByCharacter[camKey];
  const setCamSettings = (updater: (prev: typeof DEFAULT_CAM) => typeof DEFAULT_CAM) => {
    setCamSettingsByCharacter(prev => ({ ...prev, [camKey]: updater(prev[camKey]) }));
  };
  const [showCamPanel, setShowCamPanel] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setShowCamPanel(params.get('camera') === '1');
    }
  }, []);

  const isSpeakingRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const lastAudioUrlRef = useRef<string | null>(null);
  const speakQueue = useRef<string[]>([]);
  const isProcessingQueue = useRef(false);

  if (typeof window !== 'undefined' && !(window as any).mouthState) {
    (window as any).mouthState = { current: { speaking: false, volume: 0 } };
  }

  // --- 音声再生（kiosk.tsxの完成版ロジックを流用） ---
  const playAudio = (text: string) => {
    return new Promise<void>(async (resolve) => {
      isSpeakingRef.current = true;
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, character: characterRef.current, lang: langRef.current }),
        });
        const blob = await res.blob();
        if (lastAudioUrlRef.current) {
          URL.revokeObjectURL(lastAudioUrlRef.current);
        }
        const audioUrl = URL.createObjectURL(blob);
        lastAudioUrlRef.current = audioUrl;

        const audio = audioElRef.current || new Audio();
        audio.src = audioUrl;
        audioElRef.current = audio;

        const audioContext = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') await audioContext.resume();
        audioContextRef.current = audioContext;

        // createMediaElementSource は同じ<audio>要素に対して1回しか呼べないため、
        // 初回だけ作成して、以降は使い回す
        let analyser = analyserRef.current;
        if (!analyser) {
          const source = audioContext.createMediaElementSource(audio);
          analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          analyser.connect(audioContext.destination);
          analyserRef.current = analyser;
        }
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        (window as any).mouthState.current.speaking = true;

        const animate = () => {
          if (!isSpeakingRef.current) return;
          analyser!.getByteFrequencyData(dataArray);
          const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          (window as any).mouthState.current.volume = Math.min(volume / 80, 1);
          requestAnimationFrame(animate);
        };
        audio.onplay = () => animate();
        audio.onended = () => {
          isSpeakingRef.current = false;
          (window as any).mouthState.current.speaking = false;
          (window as any).mouthState.current.volume = 0;
          resolve();
        };
        await audio.play();
      } catch (error) {
        console.error("TTSエラー:", error);
        isSpeakingRef.current = false;
        resolve();
      }
    });
  };

  const processQueue = async () => {
    if (isProcessingQueue.current || speakQueue.current.length === 0) return;
    isProcessingQueue.current = true;
    while (speakQueue.current.length > 0) {
      const next = speakQueue.current.shift();
      if (next) await playAudio(next);
    }
    isProcessingQueue.current = false;
  };

  const speak = (text: string) => {
    speakQueue.current.push(text);
    processQueue();
  };

  // --- Geminiへ送信（モードに応じてプロンプトの前提を変える） ---
  const sendMessage = async (text: string, currentMode: Mode) => {
    if (!text.trim()) return;
    if (currentMode === 'fortune' || currentMode === 'travel') lastQuestionRef.current = text; // 詳細版で引き継ぐために記録
    setMessages(prev => [...prev, { role: "user", text }]);
    setIsSending(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          mode: currentMode,
          character: characterRef.current,
          lang: langRef.current,
          talkStyle: currentMode === 'free' ? talkStyleRef.current : null,
          characterMode: characterModeRef.current,
          email: typeof window !== 'undefined' ? localStorage.getItem('memberEmail') : null,
        }),
      });
      const data = await response.json();
      let reply = data.reply ?? "少し考えさせてください。";

      const emotionMatches = reply.match(/\[EMOTION:(.+?)\]/g);
      if (emotionMatches && emotionMatches.length > 0) {
        const lastTag = emotionMatches[emotionMatches.length - 1].match(/\[EMOTION:(.+?)\]/);
        if (lastTag) setEmotion(lastTag[1]);
        reply = reply.replace(/\[EMOTION:.+?\]/g, '').trim();
      } else {
        setEmotion('neutral');
      }

      setMessages(prev => [...prev, { role: "ai", text: reply }]);
      const sentences = reply.split(/(?<=[。！？.!?])\s*/);
      for (const s of sentences) {
        if (s.trim()) speak(s.trim());
      }

      // 「自由に話す」で無料枠の上限に達したら、そのままプレミアム登録画面へ誘導する
      if (data.limitReached && currentMode === 'free') {
        setShowPremiumModal(true);
      }
    } catch (error) {
      console.error("APIエラー:", error);
      setMessages(prev => [...prev, { role: "ai", text: "すみません、通信エラーが発生しました。" }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || isSending) return;

    // カウンセリングモードでは、送信前に危機的サインをチェックする
    if (mode === 'counseling' && containsCrisisSignal(inputText)) {
      setMessages(prev => [
        ...prev,
        { role: 'user', text: inputText },
        { role: 'ai', text: t.crisis },
      ]);
      speak(t.crisis);
      setInputText('');
      return; // Geminiには送らない
    }

    sendMessage(inputText, mode);
    setInputText('');
  };

  // --- 音声認識（ボタンを押した時だけ聞く、プッシュ・トゥ・トーク方式）---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = t.speechRecognitionLang;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const text = event.results[event.results.length - 1][0].transcript;
      if (mode === 'counseling' && containsCrisisSignal(text)) {
        setMessages(prev => [
          ...prev,
          { role: 'user', text },
          { role: 'ai', text: t.crisis },
        ]);
        speak(t.crisis);
        return;
      }
      sendMessage(text, mode);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;

    return () => {
      try { recognition.stop(); } catch (e) {}
    };
  }, [mode, lang]);

  const handleMicClick = () => {
    if (!recognitionRef.current || isListening) return;
    setIsListening(true);
    try {
      recognitionRef.current.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const unlockAudio = async () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    await ctx.resume();
    audioContextRef.current = ctx;
    audioElRef.current = new Audio();
    audioElRef.current.play().catch(() => {});
    setAudioUnlocked(true);
  };

  // 詳細版をStripeで購入する（占い・観光どちらでも使える汎用版、価格はサーバー側の定義だけを信用する）
  const handleUnlockDetail = async (kind: DetailKind) => {
    const res = await fetch('/api/create-product-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productKey: `${kind}_detail`,
        payload: { question: lastQuestionRef.current },
        character: characterRef.current,
        lang,
      }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  // Stripeの決済から戻ってきたかどうかを確認する。
  // ここが今回のセキュリティ修正の要：内容は一切ブラウザ側に持たせず、
  // 必ずStripeのsession_idをサーバーに送って「本当に支払われたか」を確認してから
  // サーバー側でコンテンツを生成してもらう。
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (params.get('subscribed') === '1') {
      setShowPremiumThanks(true);
    }

    if (params.get('paid_content') === '1' && sessionId) {
      (async () => {
        try {
          const res = await fetch('/api/fulfill-purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
          if (!res.ok) throw new Error('failed');
          const data = await res.json();
          const productKey: string = data.productKey;
          const resultLang = (data.lang || 'ja') as Lang;
          setLang(resultLang);
          langRef.current = resultLang;
          characterRef.current = data.character || 'woman';
          setCharacter(data.character || 'woman');

          if (productKey === 'fortune_detail' || productKey === 'travel_detail') {
            const kind = productKey.replace('_detail', '') as DetailKind;
            setPendingDetailKind(kind);
            setPendingDetailReply(data.reply || '');
            setShowDetailReveal(true);
          } else if (productKey === 'personality_detail') {
            setPersonalityResultText(data.reply || '');
            setPersonalityUnlocked(true);
            setMode('personality');
            const cachedScores = localStorage.getItem('personalityScoresCache');
            if (cachedScores) setPersonalityScores(JSON.parse(cachedScores));
          } else {
            // astrology / numerology / four_pillars / tarot
            setOccultType(productKey as any);
            setOccultResultText(data.reply || '');
            setOccultStep('result');
          }
        } catch {
          setPurchaseError(UI[(lang || 'ja') as Lang].pdfFailed);
        }
      })();
    }

    if (params.get('pdf_unlocked') === '1' && sessionId) {
      setPdfLoading(true);
      setPdfStep('result');
      (async () => {
        try {
          const res = await fetch('/api/generate-report-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
          if (!res.ok) throw new Error('failed');
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `adikio-report.pdf`;
          a.click();
          URL.revokeObjectURL(url);
          setPdfError('');
        } catch {
          setPdfError(UI['ja'].pdfFailed);
        } finally {
          setPdfLoading(false);
        }
      })();
    }
  }, []);

  // PDFレポートを申し込む（価格はサーバー側の定義だけを信用する。reportType=商品キー）
  const handleUnlockPdf = async (reportType: string, payload: any) => {
    const res = await fetch('/api/create-product-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productKey: reportType, payload, character: characterRef.current, lang }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  // 占術の鑑定を申し込む
  const handleUnlockOccult = async () => {
    if (!occultType) return;
    const res = await fetch('/api/create-product-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productKey: occultType,
        payload: occultType === 'tarot' ? { concern: occultInput } : { birthdate: occultInput },
        character: characterRef.current,
        lang,
      }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  // 性格診断の詳細結果を申し込む（スコアは表示の再現用にのみローカル保存。採点生成には使わない）
  const handleUnlockPersonality = async (scores: Record<Trait, number>) => {
    localStorage.setItem('personalityScoresCache', JSON.stringify(scores));
    const scoresText = (Object.keys(scores) as Trait[]).map((k) => `${t.traitLabels[k]}:${scores[k]}%`).join('、');
    const res = await fetch('/api/create-product-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productKey: 'personality_detail',
        payload: { scoresText },
        character: characterRef.current,
        lang,
      }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  // プレミアムプラン登録：メールアドレスを送ってCheckout Sessionへ遷移
  const handleSubscribe = async () => {
    const email = premiumEmail.trim().toLowerCase(); // サーバー側と同じ基準（小文字）に統一する
    if (!email || !email.includes('@')) return;
    setPremiumLoading(true);
    setPremiumError('');
    // 会員判定に使うため、決済ページへ移動する前に保存しておく（失敗した場合は元に戻す）
    const previousEmail = localStorage.getItem('memberEmail');
    localStorage.setItem('memberEmail', email);
    const restorePrevious = () => {
      if (previousEmail) localStorage.setItem('memberEmail', previousEmail);
      else localStorage.removeItem('memberEmail');
    };
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, lang }),
      });
      const data = await res.json();
      if (res.status === 409 && data.error === 'already_subscribed') {
        restorePrevious();
        setPremiumError(t.alreadySubscribed);
        setPremiumLoading(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        restorePrevious();
        setPremiumError(t.subscribeFailed);
        setPremiumLoading(false);
      }
    } catch {
      restorePrevious();
      setPremiumError(t.subscribeFailed);
      setPremiumLoading(false);
    }
  };

  // 「タップして詳細版を聞く」を押した時の処理
  // 内容はすでに決済確認後にサーバーから取得済み（pendingDetailReply）なので、ここでは表示するだけ
  const revealDetail = async () => {
    const kind: DetailKind = pendingDetailKind || 'fortune';
    const reply = pendingDetailReply || '';
    setMode(kind);
    setDetailUnlocked(prev => new Set(prev).add(kind));
    setShowDetailReveal(false);
    if (!audioUnlocked) await unlockAudio();
    setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    const sentences = reply.split(/(?<=[。！？.!?])\s*/);
    for (const s of sentences) {
      if (s.trim()) speak(s.trim());
    }
    setPendingDetailReply('');
    setPendingDetailKind(null);
  };

  const startMode = async (m: Mode) => {
    if (!audioUnlocked) await unlockAudio();
    setMode(m);
    setMessages([]);
    const greetings: Record<Mode, string> = {
      menu: '',
      fortune: t.greetings.fortune,
      travel: t.greetings.travel,
      free: t.greetings.free,
      counseling: t.greetings.counseling,
      fortune_detail: '',
      travel_detail: '',
      personality: '',
      personality_detail: '',
    };
    const g = greetings[m];
    if (g) {
      setMessages([{ role: 'ai', text: g }]);
      speak(g);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", background: "#111" }}>
      <MysticBackground />
      <div style={{ position: "absolute", inset: 0 }}>
        <Canvas style={{ width: '100%', height: '100%' }} camera={{ position: [0, camSettings.camY, camSettings.camZ], fov: camSettings.fov }}>
          <ResponsiveCamera baseFov={camSettings.fov} baseZ={camSettings.camZ} baseY={camSettings.camY} targetY={camSettings.targetY} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[1, 2, 3]} />
          <Avatar vrmUrl={CHARACTERS.find(c => c.id === character)?.vrmUrl || '/avatar.vrm'} emotion={emotion} avatarY={camSettings.avatarY} />
          <OrbitControls target={[0, camSettings.targetY, 0]} enableZoom={false} />
        </Canvas>
      </div>

      {/* 言語切り替えボタン（自動判定が違っていても、いつでも手動で切り替えられる） */}
      <div style={{
        position: "fixed", top: 12, right: 12, zIndex: 1000,
        display: "flex", gap: 4, background: "rgba(0,0,0,0.5)", borderRadius: 20, padding: 4,
      }}>
        {(['ja', 'en', 'zh', 'id', 'es'] as Lang[]).map((l) => (
          <button
            key={l}
            onClick={() => { setLang(l); langRef.current = l; }}
            style={{
              border: "none", borderRadius: 16, padding: "4px 10px", fontSize: 12, cursor: "pointer",
              background: lang === l ? "#fff" : "transparent",
              color: lang === l ? "#222" : "#fff",
              fontWeight: lang === l ? "bold" : "normal",
            }}
          >
            {{ ja: '日本語', en: 'English', zh: '中文', id: 'Indonesia', es: 'Español' }[l]}
          </button>
        ))}
      </div>

      {showCamPanel && (
        <div style={{
          position: 'fixed', top: 0, left: 0, background: 'rgba(0,0,0,0.85)',
          color: '#fff', padding: 12, zIndex: 9999, fontSize: 12, width: 260,
        }}>
          <div style={{ marginBottom: 8, fontWeight: 'bold' }}>
            カメラ調整パネル（対象：{CHARACTERS.find(c => c.id === camKey)?.label || 'デフォルト（未選択時）'}）
          </div>
          {([
            ['fov', '画角(広いほど引いて見える)', 10, 60],
            ['camZ', 'カメラの距離', 1, 10],
            ['camY', 'カメラの高さ', 0, 3],
            ['targetY', '注視点の高さ(顔の位置目安)', 0, 3],
            ['avatarY', 'アバター自体の上下位置', -3, 1],
          ] as const).map(([key, label, min, max]) => (
            <div key={key} style={{ marginBottom: 10 }}>
              <div>{label}: {camSettings[key].toFixed(2)}</div>
              <input
                type="range" min={min} max={max} step={0.05} value={camSettings[key]}
                onChange={(e) => setCamSettings(prev => ({ ...prev, [key]: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
            </div>
          ))}
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 8 }}>
            ちょうど良い数値が見つかったら、その数値をClaudeに伝えてください。
          </div>
        </div>
      )}

      {showDetailReveal && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 16, background: "rgba(0,0,0,0.6)",
        }}>
          <div style={{ color: "#fff", fontSize: 20, fontWeight: "bold", textAlign: "center" }}>
            {t.thanksHeading}
          </div>
          <button onClick={revealDetail} style={menuButtonStyle}>{t.tapReveal}</button>
        </div>
      )}

      {showPersonalityIntro && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.8)",
          padding: 24, zIndex: 60,
        }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: "90%", maxWidth: 400 }}>
            <div style={{ fontSize: 17, fontWeight: "bold", marginBottom: 12, textAlign: "center" }}>
              {t.personalityIntroTitle}
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 20, whiteSpace: "pre-wrap" }}>
              {t.personalityIntroBody}
            </div>
            <button
              onClick={() => {
                setShowPersonalityIntro(false);
                setPersonalityAnswers([]);
                setPersonalityScores(null);
                setPersonalityUnlocked(false);
                setPersonalityResultText('');
                setMode('personality');
              }}
              style={{ width: "100%", padding: 12, borderRadius: 8, border: "none", background: "#7c4dff", color: "#fff", fontWeight: "bold", marginBottom: 8 }}
            >
              {t.personalityIntroStart}
            </button>
            <button
              onClick={() => setShowPersonalityIntro(false)}
              style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #ccc", background: "#fff" }}
            >
              {t.back}
            </button>
          </div>
        </div>
      )}

      {pendingCharacter && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.8)",
          padding: 24, zIndex: 60,
        }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: "90%", maxWidth: 380 }}>
            <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16, textAlign: "center" }}>
              {t.toneSelectTitle}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={() => {
                  characterModeRef.current = 'normal';
                  setCharacterMode('normal');
                  characterRef.current = pendingCharacter;
                  setCharacter(pendingCharacter);
                  setPendingCharacter(null);
                  speak(t.greetingAfterCharacter);
                }}
                style={{ padding: "12px", borderRadius: 8, border: "1px solid #ddd", background: "#f9f9f9" }}
              >
                {t.toneNormal}
              </button>
              <button
                onClick={() => {
                  characterModeRef.current = 'spicy';
                  setCharacterMode('spicy');
                  characterRef.current = pendingCharacter;
                  setCharacter(pendingCharacter);
                  setPendingCharacter(null);
                  speak(t.greetingAfterCharacter);
                }}
                style={{ padding: "12px", borderRadius: 8, border: "1px solid #ddd", background: "#fff0f0" }}
              >
                {t.toneSpicy}
              </button>
            </div>
          </div>
        </div>
      )}

      {character === null && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "flex-end", paddingBottom: 60, gap: 16,
          pointerEvents: "none", background: "rgba(0,0,0,0.6)",
        }}>
          <div style={{
            position: "absolute", top: 32, left: 0, right: 0, textAlign: "center",
            color: "#fff", fontSize: 26, fontWeight: "bold", textShadow: "0 2px 6px rgba(0,0,0,0.8)",
          }}>
            {t.topTitle}
          </div>
          <div style={{ color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 8, pointerEvents: "none" }}>
            {t.chooseCharacter}
          </div>
          <div style={{ display: "flex", gap: 12, pointerEvents: "auto" }}>
            {CHARACTERS.map((c) => (
              <button
                key={c.id}
                onClick={async () => {
                  if (!audioUnlocked) await unlockAudio();
                  if (c.id === 'witch') {
                    characterRef.current = c.id;
                    setCharacter(c.id);
                    speak(t.greetingAfterCharacter);
                  } else {
                    setPendingCharacter(c.id); // 女性・男性は口調選択を挟む
                  }
                }}
                style={{ ...menuButtonStyle, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 20px" }}
              >
                <span style={{ fontSize: 28 }}>{c.emoji}</span>
                <span style={{ marginTop: 4 }}>{t.characterLabels[c.id]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {character !== null && mode === 'menu' && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "flex-end", paddingBottom: 60, gap: 16,
          pointerEvents: "none",
        }}>
          <div style={{ color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 8, pointerEvents: "none" }}>
            {t.menuHeading}
          </div>
          <button onClick={() => setOccultStep('select')} style={{ ...menuButtonStyle, pointerEvents: "auto" }}>{t.btnFortune}</button>
          <button onClick={() => setShowPersonalityIntro(true)} style={{ ...menuButtonStyle, pointerEvents: "auto" }}>{t.btnPersonality}</button>
          <button onClick={() => startMode('travel')} style={{ ...menuButtonStyle, pointerEvents: "auto" }}>{t.btnTravel}</button>
          <button onClick={() => startMode('counseling')} style={{ ...menuButtonStyle, pointerEvents: "auto" }}>{t.btnCounseling}</button>
          <button onClick={() => setPendingFreeStart(true)} style={{ ...menuButtonStyle, pointerEvents: "auto" }}>{t.btnFree}</button>
        </div>
      )}

      {showPremiumModal && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
        }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: "85%", maxWidth: 360 }}>
            <div style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>{t.premiumModalTitle}</div>
            <div style={{ fontSize: 14, color: "#555", marginBottom: 16 }}>{t.premiumModalDesc}</div>
            <input
              type="email"
              value={premiumEmail}
              onChange={(e) => { setPremiumEmail(e.target.value); setPremiumError(''); }}
              placeholder={t.premiumEmailPlaceholder}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", marginBottom: premiumError ? 8 : 16, fontSize: 14 }}
            />
            {premiumError && (
              <div style={{ color: "#c62828", fontSize: 13, marginBottom: 16 }}>{premiumError}</div>
            )}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => { setShowPremiumModal(false); setPremiumError(''); }}
                style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #ccc", background: "#fff" }}
              >
                {t.premiumCancel}
              </button>
              <button
                onClick={handleSubscribe}
                disabled={premiumLoading || !premiumEmail.includes('@')}
                style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#7c4dff", color: "#fff", opacity: premiumLoading ? 0.6 : 1 }}
              >
                {premiumLoading ? '...' : t.premiumSubmit}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPremiumThanks && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
        }}
          onClick={() => setShowPremiumThanks(false)}
        >
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: "85%", maxWidth: 360, textAlign: "center" }}>
            {t.premiumThanks}
          </div>
        </div>
      )}

      {pdfStep === 'result' && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)",
          padding: 24,
        }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: "90%", maxWidth: 380, textAlign: "center" }}>
            {pdfLoading && <div style={{ fontSize: 14 }}>{t.pdfGenerating}</div>}
            {!pdfLoading && !pdfError && <div style={{ fontSize: 14 }}>✅</div>}
            {!pdfLoading && pdfError && <div style={{ fontSize: 14, color: "#c62828" }}>{pdfError}</div>}
            <button
              onClick={() => { setPdfStep('closed'); setPdfError(''); setMode('menu'); }}
              style={{ marginTop: 16, width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #ccc", background: "#fff" }}
            >
              {t.back}
            </button>
          </div>
        </div>
      )}

      {mode === 'counseling' && (
        <div style={{
          position: "absolute", top: 12, left: 12, right: 12,
          background: "rgba(255,255,255,0.92)", color: "#333", fontSize: 12,
          padding: "8px 12px", borderRadius: 8, textAlign: "center",
        }}>
          {t.disclaimerCounseling}
        </div>
      )}

      {pendingFreeStart && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)",
          padding: 24,
        }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: "90%", maxWidth: 420, maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16, textAlign: "center" }}>
              {t.talkStyleTitle}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {TALK_STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    talkStyleRef.current = s.id;
                    setTalkStyle(s.id);
                    setPendingFreeStart(false);
                    startMode('free');
                  }}
                  style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#f9f9f9", textAlign: "left" }}
                >
                  {s.emoji} {t.talkStyleLabels[s.id as keyof typeof t.talkStyleLabels]}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPendingFreeStart(false)}
              style={{ marginTop: 16, width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #ccc", background: "#fff" }}
            >
              {t.back}
            </button>
          </div>
        </div>
      )}

      {occultStep === 'select' && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)",
          padding: 24,
        }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: "90%", maxWidth: 420 }}>
            <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16, textAlign: "center" }}>
              {t.occultSelectTitle}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={() => { setOccultStep('closed'); startMode('fortune'); }}
                style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#f9f9f9", textAlign: "left" }}
              >
                {t.occultSimple}
              </button>
              {(['astrology', 'numerology', 'four_pillars', 'tarot'] as const).map((k) => {
                const labelMap: Record<typeof k, string> = {
                  astrology: t.occultAstrology,
                  numerology: t.occultNumerology,
                  four_pillars: t.occultFourPillars,
                  tarot: t.occultTarot,
                };
                return (
                  <button
                    key={k}
                    onClick={() => { setOccultType(k); setOccultInput(''); setOccultResultText(''); setOccultStep('input'); }}
                    style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#f9f9f9", textAlign: "left" }}
                  >
                    {labelMap[k]}（{currency === 'jpy' ? '¥100' : '$1'}）
                  </button>
                );
              })}
              <button
                onClick={() => { setOccultType('yearly_pdf'); setOccultInput(''); setOccultResultText(''); setOccultStep('input'); }}
                style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#f3ecff", textAlign: "left" }}
              >
                {t.occultYearlyPdf}（{currency === 'jpy' ? '¥3,000' : '$20'}）
              </button>
              <button
                onClick={() => { setOccultType('tarot_deep'); setOccultInput(''); setOccultResultText(''); setOccultStep('input'); }}
                style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#f3ecff", textAlign: "left" }}
              >
                {t.tarotDeepPdf}（{currency === 'jpy' ? '¥2,000' : '$13'}）
              </button>
            </div>
            <button
              onClick={() => setOccultStep('closed')}
              style={{ marginTop: 16, width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #ccc", background: "#fff" }}
            >
              {t.back}
            </button>
          </div>
        </div>
      )}

      {occultStep === 'input' && occultType && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)",
          padding: 24,
        }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: "90%", maxWidth: 420 }}>
            <div style={{ fontSize: 15, fontWeight: "bold", marginBottom: 16 }}>
              {(occultType === 'tarot' || occultType === 'tarot_deep') ? t.occultTarotLabel : t.occultBirthdateLabel}
            </div>
            {(occultType === 'tarot' || occultType === 'tarot_deep') ? (
              <textarea
                value={occultInput}
                onChange={(e) => setOccultInput(e.target.value)}
                rows={3}
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc", marginBottom: 16, fontSize: 14 }}
              />
            ) : (
              <input
                type="date"
                value={occultInput}
                onChange={(e) => setOccultInput(e.target.value)}
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc", marginBottom: 16, fontSize: 14 }}
              />
            )}
            <button
              onClick={() => {
                if (occultType === 'yearly_pdf') {
                  setOccultStep('closed');
                  handleUnlockPdf('occult_yearly', { birthdate: occultInput });
                } else if (occultType === 'tarot_deep') {
                  setOccultStep('closed');
                  handleUnlockPdf('tarot_deep', { concern: occultInput });
                } else {
                  handleUnlockOccult();
                }
              }}
              disabled={occultType !== 'tarot' && occultType !== 'tarot_deep' && !occultInput}
              style={{ width: "100%", padding: 12, borderRadius: 8, border: "none", background: "#7c4dff", color: "#fff", fontWeight: "bold", opacity: (occultType !== 'tarot' && !occultInput) ? 0.5 : 1 }}
            >
              {occultType === 'yearly_pdf'
                ? `${t.occultSubmit}（${currency === 'jpy' ? '¥3,000' : '$20'}）`
                : occultType === 'tarot_deep'
                ? `${t.occultSubmit}（${currency === 'jpy' ? '¥2,000' : '$13'}）`
                : `${t.occultSubmit}（${currency === 'jpy' ? '¥100' : '$1'}）`}
            </button>
            <button
              onClick={() => setOccultStep('select')}
              style={{ marginTop: 8, width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #ccc", background: "#fff" }}
            >
              {t.back}
            </button>
          </div>
        </div>
      )}

      {occultStep === 'result' && occultType && (() => {
        const occultTitle = {
          astrology: t.occultAstrology,
          numerology: t.occultNumerology,
          four_pillars: t.occultFourPillars,
          tarot: t.occultTarot,
          yearly_pdf: t.occultYearlyPdf,
          tarot_deep: t.tarotDeepPdf,
        }[occultType];
        return (
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)",
          padding: 24,
        }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: "90%", maxWidth: 420, maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>{occultTitle}</div>
            <div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {occultResultText || t.loadingText}
            </div>
            {occultResultText && (
              <button
                onClick={async () => {
                  const blob = await createShareImage({
                    heading: t.topTitle,
                    title: occultTitle.replace(/^\S+\s/, ''),
                    body: occultResultText,
                    footer: 'adikio.com/room',
                  });
                  if (blob) await saveShareImage(blob, 'adikio-result.png');
                }}
                style={{ marginTop: 16, width: "100%", padding: "12px", borderRadius: 8, border: "none", background: "#7c4dff", color: "#fff", fontWeight: "bold" }}
              >
                {t.shareImageButton}
              </button>
            )}
            <button
              onClick={() => { setOccultStep('closed'); setOccultType(null); setOccultInput(''); setOccultResultText(''); setMode('menu'); }}
              style={{ marginTop: 8, width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #ccc", background: "#fff" }}
            >
              {t.back}
            </button>
          </div>
        </div>
        );
      })()}

      {mode === 'personality' && personalityAnswers.length < PERSONALITY_QUESTIONS.length && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)",
          padding: 24,
        }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: "90%", maxWidth: 420 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
              {personalityAnswers.length + 1} / {PERSONALITY_QUESTIONS.length}
            </div>
            <div style={{ fontSize: 12, color: "#a78bfa", marginBottom: 4 }}>
              {t.traitLabels[PERSONALITY_QUESTIONS[personalityAnswers.length].trait]}
            </div>
            <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 20 }}>
              {t.personalityQuestions[personalityAnswers.length]}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {LIKERT_OPTIONS.map((opt, idx) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    const next = [...personalityAnswers, opt.value];
                    setPersonalityAnswers(next);
                    if (next.length === PERSONALITY_QUESTIONS.length) {
                      setPersonalityScores(calcTraitScores(next));
                    }
                  }}
                  style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#f9f9f9", textAlign: "left" }}
                >
                  {t.likertOptions[idx]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {mode === 'personality' && personalityScores && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)",
          padding: 24, overflowY: "auto",
        }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: "90%", maxWidth: 420, maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16 }}>{t.btnPersonality}</div>
            {(Object.keys(personalityScores) as Trait[]).map((trait) => (
              <div key={trait} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, marginBottom: 4 }}>{t.traitLabels[trait]}：{personalityScores[trait]}%</div>
                <div style={{ background: "#eee", borderRadius: 6, height: 10, overflow: "hidden" }}>
                  <div style={{ width: `${personalityScores[trait]}%`, background: "#7c4dff", height: "100%" }} />
                </div>
              </div>
            ))}

            <button
              onClick={async () => {
                const blob = await createShareImage({
                  heading: t.topTitle,
                  title: t.btnPersonality.replace(/^\S+\s/, ''),
                  bars: (Object.keys(personalityScores) as Trait[]).map((k) => ({ label: t.traitLabels[k], value: personalityScores[k] })),
                  footer: 'adikio.com/room',
                });
                if (blob) await saveShareImage(blob, 'adikio-personality.png');
              }}
              style={{ marginTop: 12, width: "100%", padding: "12px", borderRadius: 8, border: "none", background: "#f0abfc", color: "#3b0764", fontWeight: "bold" }}
            >
              {t.shareImageButton}
            </button>

            {!personalityUnlocked && (
              <button
                onClick={() => handleUnlockPersonality(personalityScores)}
                style={{ marginTop: 12, width: "100%", padding: "12px", borderRadius: 8, border: "none", background: "#7c4dff", color: "#fff", fontWeight: "bold" }}
              >
                {t.unlockDetailButton}（{currency === 'jpy' ? '¥100' : '$1'}）
              </button>
            )}

            {personalityUnlocked && (
              <div style={{ marginTop: 16, fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {personalityResultText || t.loadingText}
              </div>
            )}

            <button
              onClick={() => {
                const scoresText = (Object.keys(personalityScores) as Trait[])
                  .map((k) => `${t.traitLabels[k]}:${personalityScores[k]}%`)
                  .join('、');
                const bars = (Object.keys(personalityScores) as Trait[]).map((k) => ({ label: t.traitLabels[k], value: personalityScores[k] }));
                handleUnlockPdf('trisetsu_darkside', { scoresText, bars });
              }}
              style={{ marginTop: 12, width: "100%", padding: "12px", borderRadius: 8, border: "none", background: "#f3ecff", color: "#3b0764", fontWeight: "bold" }}
            >
              {t.trisetsuPdfButton}（{currency === 'jpy' ? '¥2,000' : '$13'}）
            </button>

            <button
              onClick={() => { setMode('menu'); setPersonalityAnswers([]); setPersonalityScores(null); setPersonalityUnlocked(false); setPersonalityResultText(''); }}
              style={{ marginTop: 16, width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #ccc", background: "#fff" }}
            >
              {t.back}
            </button>
          </div>
        </div>
      )}

      {mode !== 'menu' && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "rgba(0,0,0,0.75)", padding: 16, display: "flex", flexDirection: "column", gap: 8,
        }}>
          <div style={{ maxHeight: 160, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                background: m.role === 'user' ? '#4a7cff' : '#333',
                color: '#fff', padding: '8px 12px', borderRadius: 12, maxWidth: '80%', fontSize: 14,
              }}>
                {m.text}
              </div>
            ))}
          </div>
          {(mode === 'fortune' || mode === 'travel') && !detailUnlocked.has(mode as DetailKind) && messages.some(m => m.role === 'ai') && (
            <button
              onClick={() => handleUnlockDetail(mode as DetailKind)}
              style={{ ...menuButtonStyle, padding: "10px 16px", fontSize: 14, alignSelf: "center", background: "#ffd54f" }}
            >
              🔮 {t.detailLabel[mode as DetailKind]}（{DETAIL_PRICING[mode as DetailKind][currency].display}）
            </button>
          )}
          {mode === 'travel' && messages.some(m => m.role === 'ai') && (
            <button
              onClick={() => handleUnlockPdf('travel_plan', { request: lastQuestionRef.current })}
              style={{ ...menuButtonStyle, padding: "10px 16px", fontSize: 14, alignSelf: "center", background: "#f3ecff" }}
            >
              {t.travelPdfButton}（{currency === 'jpy' ? '¥1,000' : '$7'}）
            </button>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setMode('menu')} style={{ ...menuButtonStyle, padding: "8px 12px", fontSize: 14 }}>{t.back}</button>
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              placeholder={t.placeholder}
              style={{ flex: 1, padding: "10px 14px", borderRadius: 20, border: "none", fontSize: 14 }}
            />
            {micSupported && (
              <button
                onClick={handleMicClick}
                style={{
                  ...menuButtonStyle,
                  padding: "8px 14px",
                  fontSize: 12,
                  background: isListening ? "#ff5555" : "#fff",
                  color: isListening ? "#fff" : "#222",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  lineHeight: 1.2,
                }}
              >
                <span style={{ fontSize: 18 }}>🎤</span>
                <span>{isListening ? t.listening : t.talk}</span>
              </button>
            )}
            <button onClick={handleSend} disabled={isSending} style={{ ...menuButtonStyle, padding: "8px 16px", fontSize: 14 }}>
              {t.send}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const menuButtonStyle: CSSProperties = {
  background: "#fff",
  color: "#222",
  border: "none",
  borderRadius: 24,
  padding: "14px 28px",
  fontSize: 16,
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
};