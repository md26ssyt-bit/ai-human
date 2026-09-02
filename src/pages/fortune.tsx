"use client";

import { useState, useEffect, useRef } from "react";
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
type Mode = 'menu' | 'fortune' | 'travel' | 'free' | 'counseling';

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

const CRISIS_RESPONSE =
  'つらい気持ちを話してくれてありがとうございます。' +
  'そのお気持ちについては、専門の相談窓口にお話しすることをおすすめします。\n\n' +
  '・よりそいホットライン：0120-279-338（24時間・無料）\n' +
  '・いのちの電話：0570-783-556\n\n' +
  'あなたの気持ちを大切にしたいので、まずはこうした窓口に連絡してみてくださいね。';

// ======================
// Home（占い・観光情報・雑談ページ）
// ======================
export default function FortunePage() {
  const [mode, setMode] = useState<Mode>('menu');
  const [character, setCharacter] = useState<CharacterId | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [emotion, setEmotion] = useState('neutral');
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // カメラ・アバターの位置調整用（?camera=1 を付けた時だけパネルを表示）
  const [camSettings, setCamSettings] = useState({
    fov: 28.05,
    camZ: 5.5,
    camY: 1.35,
    targetY: 1.1,
    avatarY: -2.4,
  });
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
          body: JSON.stringify({ text, character }),
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
    setMessages(prev => [...prev, { role: "user", text }]);
    setIsSending(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, mode: currentMode, character }),
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
        { role: 'ai', text: CRISIS_RESPONSE },
      ]);
      speak(CRISIS_RESPONSE);
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
    recognition.lang = "ja-JP";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const text = event.results[event.results.length - 1][0].transcript;
      if (mode === 'counseling' && containsCrisisSignal(text)) {
        setMessages(prev => [
          ...prev,
          { role: 'user', text },
          { role: 'ai', text: CRISIS_RESPONSE },
        ]);
        speak(CRISIS_RESPONSE);
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
  }, [mode]);

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

  const startMode = async (m: Mode) => {
    if (!audioUnlocked) await unlockAudio();
    setMode(m);
    setMessages([]);
    const greetings: Record<Mode, string> = {
      menu: '',
      fortune: 'こんにちは！今日はあなたの性格や運勢を見せてくださいね。まず、生年月日を教えてもらえますか？',
      travel: 'こんにちは！観光やお店のことなら何でも聞いてください。どのあたりを探していますか？',
      free: 'こんにちは！何でも自由に話しかけてくださいね。',
      counseling: 'こんにちは。今日はどんなことでも、気になっていることをゆっくり話してくださいね。',
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

      {showCamPanel && (
        <div style={{
          position: 'fixed', top: 0, left: 0, background: 'rgba(0,0,0,0.85)',
          color: '#fff', padding: 12, zIndex: 9999, fontSize: 12, width: 260,
        }}>
          <div style={{ marginBottom: 8, fontWeight: 'bold' }}>カメラ調整パネル</div>
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

      {character === null && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "flex-end", paddingBottom: 60, gap: 16,
          pointerEvents: "none",
        }}>
          <div style={{ color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 8, pointerEvents: "none" }}>
            お話しするキャラクターを選んでください
          </div>
          <div style={{ display: "flex", gap: 12, pointerEvents: "auto" }}>
            {CHARACTERS.map((c) => (
              <button
                key={c.id}
                onClick={() => setCharacter(c.id)}
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
            今日はどうしますか？
          </div>
          <button onClick={() => startMode('fortune')} style={{ ...menuButtonStyle, pointerEvents: "auto" }}>🔮 占い・性格診断</button>
          <button onClick={() => startMode('travel')} style={{ ...menuButtonStyle, pointerEvents: "auto" }}>🗾 観光・お店を教えてもらう</button>
          <button onClick={() => startMode('counseling')} style={{ ...menuButtonStyle, pointerEvents: "auto" }}>🌱 心の相談</button>
          <button onClick={() => startMode('free')} style={{ ...menuButtonStyle, pointerEvents: "auto" }}>💬 自由に話す</button>
        </div>
      )}

      {mode === 'counseling' && (
        <div style={{
          position: "absolute", top: 12, left: 12, right: 12,
          background: "rgba(255,255,255,0.92)", color: "#333", fontSize: 12,
          padding: "8px 12px", borderRadius: 8, textAlign: "center",
        }}>
          この会話はAIによるものであり、医療従事者による診断・治療ではありません。
          深刻な悩みは、専門機関・医療機関へのご相談をおすすめします。
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
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setMode('menu')} style={{ ...menuButtonStyle, padding: "8px 12px", fontSize: 14 }}>← 戻る</button>
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              placeholder="メッセージを入力..."
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
                <span>{isListening ? "聞いています..." : "話す"}</span>
              </button>
            )}
            <button onClick={handleSend} disabled={isSending} style={{ ...menuButtonStyle, padding: "8px 16px", fontSize: 14 }}>
              送信
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const menuButtonStyle: React.CSSProperties = {
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
