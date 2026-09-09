"use client";

import { useState, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { VRM, VRMLoaderPlugin } from "@pixiv/three-vrm";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

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
type Mode = 'menu' | 'fortune' | 'travel' | 'free' | 'counseling' | 'fortune_detail' | 'travel_detail';

type DetailKind = 'fortune' | 'travel';

// 価格（円・ドルの両方を用意しておき、言語判定に応じて出し分ける）
const DETAIL_PRICING: Record<DetailKind, { jpy: { amount: number; display: string }; usd: { amount: number; display: string } }> = {
  fortune: { jpy: { amount: 300, display: '¥300' }, usd: { amount: 299, display: '$2.99' } },
  travel: { jpy: { amount: 400, display: '¥400' }, usd: { amount: 399, display: '$3.99' } },
};

// ======================
// 言語・通貨（今はja/enの2言語。増やす場合はUIオブジェクトにキーを追加してください）
// ======================
type Lang = 'ja' | 'en' | 'zh' | 'id';

const UI: Record<Lang, {
  chooseCharacter: string;
  menuHeading: string;
  btnFortune: string;
  btnTravel: string;
  btnCounseling: string;
  btnFree: string;
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
    menuHeading: '今日はどうしますか？',
    btnFortune: '🔮 占い・性格診断',
    btnTravel: '🗾 観光・お店を教えてもらう',
    btnCounseling: '🌱 心の相談',
    btnFree: '💬 自由に話す',
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
    menuHeading: 'What would you like to do today?',
    btnFortune: '🔮 Fortune & Personality',
    btnTravel: '🗾 Travel & Local Spots',
    btnCounseling: '🌱 Talk About Your Feelings',
    btnFree: '💬 Just Chat',
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
    menuHeading: '今天想做点什么呢？',
    btnFortune: '🔮 占卜・性格测试',
    btnTravel: '🗾 旅游・美食推荐',
    btnCounseling: '🌱 心事倾诉',
    btnFree: '💬 随便聊聊',
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
    menuHeading: 'Hari ini mau melakukan apa?',
    btnFortune: '🔮 Ramalan & Kepribadian',
    btnTravel: '🗾 Info Wisata & Tempat Makan',
    btnCounseling: '🌱 Curhat',
    btnFree: '💬 Ngobrol Santai',
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
        body: JSON.stringify({ message: text, mode: currentMode, character: characterRef.current, lang: langRef.current }),
      });
      const data = await response.json();
      let reply = data.reply ?? "少し考えさせてください。";

      const emotionMatch = reply.match(/\[EMOTION:(.+?)\]/);
      if (emotionMatch) {
        setEmotion(emotionMatch[1]);
        reply = reply.replace(/\[EMOTION:.+?\]/, '').trim();
      } else {
        setEmotion('neutral');
      }

      setMessages(prev => [...prev, { role: "ai", text: reply }]);
      const sentences = reply.split(/(?<=[。！？])/);
      for (const s of sentences) {
        if (s.trim()) speak(s.trim());
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

  // 詳細版をStripeで購入する（占い・観光どちらでも使える汎用版、言語に応じて円/ドルを切り替え）
  const handleUnlockDetail = async (kind: DetailKind) => {
    const price = DETAIL_PRICING[kind][currency];
    // 決済から戻ってきた後も内容を引き継げるよう保存しておく
    localStorage.setItem('pendingDetail', JSON.stringify({
      kind,
      character: characterRef.current,
      question: lastQuestionRef.current,
      lang,
    }));
    const res = await fetch('/api/create-payment-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: price.amount,
        currency,
        description: `${CHARACTERS.find(c => c.id === character)?.label || ''} - ${t.detailLabel[kind]}`,
        successUrl: `${window.location.origin}/fortune?unlocked=1`,
      }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  // Stripeの決済から戻ってきたかどうかを確認する
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('unlocked') === '1') {
      setShowDetailReveal(true);
    }
  }, []);

  // 「タップして詳細版を聞く」を押した時の処理
  const revealDetail = async () => {
    const saved = localStorage.getItem('pendingDetail');
    const pending = saved ? JSON.parse(saved) : { kind: 'fortune' as DetailKind, character: 'woman', question: '', lang: 'ja' as Lang };
    const kind: DetailKind = pending.kind || 'fortune';
    if (pending.lang) { setLang(pending.lang); langRef.current = pending.lang; }
    characterRef.current = pending.character || 'woman';
    setCharacter(pending.character || 'woman');
    setMode(kind);
    setDetailUnlocked(prev => new Set(prev).add(kind));
    setShowDetailReveal(false);
    if (!audioUnlocked) await unlockAudio();
    sendMessage(pending.question || UI[(pending.lang || 'ja') as Lang].greetings[kind], `${kind}_detail` as Mode);
    localStorage.removeItem('pendingDetail');
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
    };
    const g = greetings[m];
    if (g) {
      setMessages([{ role: 'ai', text: g }]);
      speak(g);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", background: "#111" }}>
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
        {(['ja', 'en', 'zh', 'id'] as Lang[]).map((l) => (
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
            {{ ja: '日本語', en: 'English', zh: '中文', id: 'Indonesia' }[l]}
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

      {character === null && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "flex-end", paddingBottom: 60, gap: 16,
          pointerEvents: "none",
        }}>
          <div style={{ color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 8, pointerEvents: "none" }}>
            {t.chooseCharacter}
          </div>
          <div style={{ display: "flex", gap: 12, pointerEvents: "auto" }}>
            {CHARACTERS.map((c) => (
              <button
                key={c.id}
                onClick={async () => {
                  if (!audioUnlocked) await unlockAudio();
                  characterRef.current = c.id;
                  setCharacter(c.id);
                  speak(t.greetingAfterCharacter);
                }}
                style={{ ...menuButtonStyle, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 20px" }}
              >
                <span style={{ fontSize: 28 }}>{c.emoji}</span>
                <span style={{ marginTop: 4 }}>{c.label}</span>
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
          <button onClick={() => startMode('fortune')} style={{ ...menuButtonStyle, pointerEvents: "auto" }}>{t.btnFortune}</button>
          <button onClick={() => startMode('travel')} style={{ ...menuButtonStyle, pointerEvents: "auto" }}>{t.btnTravel}</button>
          <button onClick={() => startMode('counseling')} style={{ ...menuButtonStyle, pointerEvents: "auto" }}>{t.btnCounseling}</button>
          <button onClick={() => startMode('free')} style={{ ...menuButtonStyle, pointerEvents: "auto" }}>{t.btnFree}</button>
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
