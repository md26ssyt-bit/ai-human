"use client";

import { supabase } from "../lib/supabase";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { VRM, VRMLoaderPlugin } from "@pixiv/three-vrm";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// ======================
// Avatar
// ======================

function Avatar({ vrmUrl, emotion = 'neutral' }: { vrmUrl: string, emotion?: string }) {
const mouthState = useRef({
  speaking: false,
  value: 0,
  volume: 0,
  inhale: false,
  blinkAfter: false,
});

const [vrm, setVrm] = useState<VRM | null>(null);
const [loading, setLoading] = useState(true);  // ← 追加

// 瞬き
const blinkState = useRef({
  timer: 0,
  nextBlink: 3,
  value: 0
});

useEffect(() => {
  if (!vrmUrl) return;
  setLoading(true);  // ← 追加
  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  loader.load(vrmUrl, (gltf) => {
    const vrmModel = gltf.userData.vrm as VRM;
    // 利用可能な表情を確認
  console.log("expressions:", vrmModel.expressionManager?.expressions.map(e => e.expressionName));
    setVrm(vrmModel);
    setLoading(false);  // ← ここに追加
    // モデル中央補正
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

  // ===== 瞬き =====
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

  // ===== 呼吸 =====
  const breathe = Math.sin(Date.now() * 0.002) * 0.005;
  vrm.scene.position.y = breathe;

  // ===== リップシンク =====
  const mouth = mouthState.current;

  if (mouth.speaking) {
    mouth.value = mouth.value * 0.7 + mouth.volume * 0.3;
  } else {
    mouth.value = 0;
  }

  if (vrm.expressionManager) {

    vrm.expressionManager.setValue("blink", blink.value);
    vrm.expressionManager.setValue("aa", mouth.value);
    // 感情に応じて表情を切り替え
vrm.expressionManager.setValue("happy", emotion === 'happy' ? 0.8 : 0);
vrm.expressionManager.setValue("sad", emotion === 'sad' ? 0.8 : 0);
vrm.expressionManager.setValue("angry", emotion === 'angry' ? 0.8 : 0);
vrm.expressionManager.setValue("surprised", emotion === 'surprised' ? 0.8 : 0);
vrm.expressionManager.setValue("neutral", emotion === 'neutral' ? 0.3 : 0);

    vrm.expressionManager.update();

  }

  vrm.update(delta);
    // ===== ボーン取得 =====

    const leftUpperArm = vrm.humanoid?.getRawBoneNode("leftUpperArm");
    const rightUpperArm = vrm.humanoid?.getRawBoneNode("rightUpperArm");
    const leftLowerArm = vrm.humanoid?.getRawBoneNode("leftLowerArm");
    const rightLowerArm = vrm.humanoid?.getRawBoneNode("rightLowerArm");
    const leftHand = vrm.humanoid?.getRawBoneNode("leftHand");
   const leftThumb1 = vrm.humanoid?.getRawBoneNode("leftThumbMetacarpal");
   const leftThumb2 = vrm.humanoid?.getRawBoneNode("leftThumbProximal");
   const leftThumb3 = vrm.humanoid?.getRawBoneNode("leftThumbDistal");

    const rightHand = vrm.humanoid?.getRawBoneNode("rightHand");
   const rightThumb1 = vrm.humanoid?.getRawBoneNode("rightThumbMetacarpal");
   const rightThumb2 = vrm.humanoid?.getRawBoneNode("rightThumbProximal");
   const rightThumb3 = vrm.humanoid?.getRawBoneNode("rightThumbDistal");

    if (
      leftUpperArm &&
      rightUpperArm &&
      leftLowerArm &&
      rightLowerArm &&
      leftHand &&
      rightHand
    ) {

 // ===== 前で手を組む受付ポーズ（完成版） =====

// 肩
leftUpperArm.rotation.x = -0.25;
rightUpperArm.rotation.x = -0.25;

leftUpperArm.rotation.y = -1.8;
rightUpperArm.rotation.y = 1.4;

leftUpperArm.rotation.z = -1.1;
rightUpperArm.rotation.z = 1.1;


// ひじ
leftLowerArm.rotation.x = -1.0;
rightLowerArm.rotation.x = -1.0;


// ★前腕を内側に回す（これが重要）
leftLowerArm.rotation.z = -0.2;
rightLowerArm.rotation.z = 0.2;


// 手首（軽く重ねる）
leftHand.rotation.x = 0.5;
// 左親指
if(leftThumb1) leftThumb1.rotation.z = -0.5;
if(leftThumb2) leftThumb2.rotation.z = -0.6;
if(leftThumb3) leftThumb3.rotation.z = -0.5;
rightHand.rotation.x = 0.5;
// 右親指
if(rightThumb1) rightThumb1.rotation.z = 0.5;
if(rightThumb2) rightThumb2.rotation.z = 0.6;
if(rightThumb3) rightThumb3.rotation.z = 0.5;
leftHand.rotation.y = 0.01;
rightHand.rotation.y = -0.01;

leftHand.rotation.z = 0.01;
rightHand.rotation.z = -0.01;
    }

  });

if (!vrm) return null;
if (loading) return <mesh><boxGeometry /><meshStandardMaterial color="gray" /></mesh>;
return (
  <group position={[0, -1.6, 0]} scale={3}>
    <primitive object={vrm.scene} />
  </group>
);

}


// ======================
// Home
// ======================

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [vrmUrl, setVrmUrl] = useState('/avatar.vrm'); 
  const [companyName, setCompanyName] = useState('');
  const [greeting, setGreeting] = useState('');  // ← ここに追加
  const [isReady, setIsReady] = useState(false);
  // mouthState初期化
if (typeof window !== 'undefined' && !(window as any).mouthState) {
  (window as any).mouthState = { current: { speaking: false, volume: 0 } };
}
  const sendMessageRef = useRef<((text: string, emailOverride?: string) => void) | null>(null);
  const isPersonDetectedRef = useRef(false);
  const hasGreetedRef = useRef(false);  // ← ここに追加
  const [callButton, setCallButton] = useState<{name: string, phone: string} | null>(null);
  const [isPersonDetected, setIsPersonDetected] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const addLog = (msg: string) => {
    setDebugLog(prev => [...prev.slice(-8), `${new Date().toLocaleTimeString()} ${msg}`]);
  };
  const [emotion, setEmotion] = useState('neutral');
  const videoRef = useRef<HTMLVideoElement>(null);
  const detectorRef = useRef<any>(null);
  const detectionTimerRef = useRef<NodeJS.Timeout | null>(null);
useEffect(() => {
const checkSession = async () => {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    router.push("/login");
 } else {
  if (data.session.user.email === 'md26ssyt@gmail.com') {
    router.push("/admin");
    return;
  }
 const userEmail = data.session.user.email;
setSession(data.session);
localStorage.setItem('userEmail', userEmail ?? '');
const { data: customer } = await supabase
  .from('customers')
  .select('vrm_url, company_name, greeting')  // ← ここだけ変更
  .eq('email', userEmail)
  .single();

console.log("vrm_url:", customer?.vrm_url);
console.log("greeting:", customer?.greeting);  // 確認用
console.log("customer data:", JSON.stringify(customer));
if (customer?.vrm_url) setVrmUrl(customer.vrm_url);
if (customer?.company_name) setCompanyName(customer.company_name);
if (customer?.greeting) setGreeting(customer.greeting);  // ← 追加
setIsReady(true);
// セッションチェック開始
const mySessionId = localStorage.getItem('mySessionId');
console.log("mySessionId:", mySessionId);
setInterval(async () => {  
  const { data: check } = await supabase
    .from('customers')
    .select('session_id')
    .eq('email', userEmail)
    .single();
  if (check?.session_id && check.session_id !== mySessionId) {
    alert('他のデバイスでログインされたため、ログアウトします');
    await supabase.auth.signOut();
    router.push('/login');
  }
}, 10000); // 10秒ごとにチェック
const emailForGreeting = userEmail;
const greetingText = customer?.greeting || "こんにちは";
// 5秒ごとにsession_updated_atを更新
setInterval(async () => {
   console.log("session_updated_at更新中...");  // ← ここに追加
  await supabase
    .from('customers')
    .update({ session_updated_at: new Date().toISOString() })
    .eq('email', userEmail);
}, 5000);
  // 自動挨拶
 
}
};
  checkSession();
}, []);

  const [messages, setMessages] = useState<any[]>([]);
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const stopResolveRef = useRef<(() => void) | null>(null); 
  const speakQueue = useRef<string[]>([]);
  const isProcessingQueue = useRef(false);

  // --- キューを順番に処理する関数 ---
 const processQueue = async () => {
  if (isProcessingQueue.current || speakQueue.current.length === 0) return;
  isProcessingQueue.current = true;

  // マイクが完全に止まるのを待つ
  await new Promise<void>((resolve) => {
    if (!recognitionRef.current) return resolve();
    stopResolveRef.current = resolve;
    try { recognitionRef.current.stop(); } catch (e) { resolve(); }
  });
  addLog("✅ マイク完全停止を確認");

  while (speakQueue.current.length > 0) {
    const nextText = speakQueue.current.shift();
    if (nextText) await playAudio(nextText);
  }
  isProcessingQueue.current = false;
  try {
    recognitionRef.current?.start();
    addLog("🎤 再開試行OK");
  } catch (e) {
    addLog(`❌ 再開失敗: ${e}`);
  }
};
const speakDirectly = (text: string) => {
  setMessages(prev => [...prev, { role: "ai", text }]);
 playAudio(text);
};

const initDetector = async () => {
  // 何もしない（動き検知はcanvasで行う）
};
// カメラ起動
const startCamera = async () => {
  console.log("startCamera called");  // ← 追加
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
  } catch (e) {
    console.error('カメラエラー:', e);
  }
};

// 人体検知ループ
const startDetection = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });  // 警告も解消
  let prevImageData: ImageData | null = null;
  let ready = false;

  setTimeout(() => { ready = true; }, 3000);  // 3秒後から検知開始

  const detect = () => {
    if (!videoRef.current || !ctx) return;
    canvas.width = 64;
    canvas.height = 48;
    ctx.drawImage(videoRef.current, 0, 0, 64, 48);
    const imageData = ctx.getImageData(0, 0, 64, 48);

    if (prevImageData && ready) {  // readyの時だけ検知
      let diff = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        diff += Math.abs(imageData.data[i] - prevImageData.data[i]);
      }
      const motion = diff / (64 * 48);
      console.log("motion:", motion);

      if (motion > 3) {
        setIsPersonDetected(true);
        isPersonDetectedRef.current = true;
        if (detectionTimerRef.current) clearTimeout(detectionTimerRef.current);
        detectionTimerRef.current = setTimeout(() => {
          setIsPersonDetected(false);
          isPersonDetectedRef.current = false;
        }, 30000);
      }
    }
    prevImageData = imageData;
    setTimeout(detect, 500);
  };
  detect();
};
  // --- 実際の音声再生ロジック ---
  const playAudio = (text: string) => {
    return new Promise<void>(async (resolve) => {
      addLog(`🔊 再生開始: ${text.slice(0, 15)}`);
      isSpeakingRef.current = true;
      try {
       
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        });
        if (!res.ok) addLog(`❌ TTS失敗: ${res.status}`);
        const blob = await res.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        const audioContext = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
       if (audioContext.state === 'suspended') {
        await audioContext.resume();
          }
        audioContextRef.current = audioContext;
        const source = audioContext.createMediaElementSource(audio);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        (window as any).mouthState.current.speaking = true;
        const animate = () => {
          if (!isSpeakingRef.current) return;
          analyser.getByteFrequencyData(dataArray);
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

  const speak = (text: string) => {
    speakQueue.current.push(text);
    processQueue();
  };

 // --- AIに送信 ---
const sendMessage = async (text: string, emailOverride?: string) => {
  addLog(`📤 送信: ${text}`);
  console.log("sendMessage called:", text);
  if (!text) return;
  setMessages(prev => [...prev, { role: "user", text }]);
  try {
    const email = emailOverride || session?.user?.email || localStorage.getItem('userEmail') || '';
    console.log("sending email:", email);
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, email })
    });
    if (!response.ok) addLog(`❌ chat API失敗: ${response.status}`);
    const data = await response.json();
    let reply = data.reply ?? "少しお待ちください";
    addLog(`📥 返信: ${reply}`);

    setMessages(prev => [...prev, { role: "ai", text: reply }]);
    // 電話ボタンの検知 [CALL:名前:電話番号]
    // 感情の検知
    const emotionMatch = reply.match(/\[EMOTION:(.+?)\]/);
    if (emotionMatch) {
      setEmotion(emotionMatch[1]);
      reply = reply.replace(/\[EMOTION:.+?\]/, '').trim();
    } else {
      setEmotion('neutral');
    }
    const callMatch = reply.match(/\[CALL:(.+?):(.+?)\]/);
    if (callMatch) {
      setCallButton({ name: callMatch[1], phone: callMatch[2] });
      reply = reply.replace(/\[CALL:.+?\]/, '').trim();
    } else {
      setCallButton(null);
    }
    // 句読点で分割して順番に読み上げ
    const sentences = reply.split(/(?<=[。！？])/);
    for (const sentence of sentences) {
      if (sentence.trim()) speak(sentence.trim());
    }
    // ログを記録
    const { data: customerData } = await supabase
      .from('customers')
      .select('sheet_id, company_name')
      .eq('email', email)
      .single();

    if (customerData?.sheet_id) {
      await fetch('/api/log-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetId: customerData.sheet_id,
          messages: [
            { role: 'user', text },
            { role: 'ai', text: reply }
          ],
          companyName: customerData.company_name,
          email,
        }),
      });
    }
  } catch (error) {
    addLog(`❌ sendMessageエラー: ${error}`);
    console.error("APIエラー:", error);
  }
};
  // 🔥 音声認識を復活
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addLog("❌ SpeechRecognition未対応");
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "ja-JP";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const text = event.results[event.results.length - 1][0].transcript;
      addLog(`✅ 認識結果: ${text}`);
      sendMessage(text);
    };

    recognition.onend = () => {
  addLog("🔁 recognition ended");
  if (stopResolveRef.current) {
    stopResolveRef.current();      // 「止まった」ことを知らせる
    stopResolveRef.current = null;
  } else if (!isProcessingQueue.current) {
    try { recognition.start(); } catch (e) { addLog(`再開失敗: ${e}`); }
  }
};

    recognition.onstart = () => {
      addLog("🎤 recognition started");
    };

    recognition.start();
  }, []);
  useEffect(() => {
  const init = async () => {
    await initDetector();
    await startCamera();
    startDetection();
  };
  init();
}, []);
useEffect(() => {
  sendMessageRef.current = sendMessage;
});

useEffect(() => {
  if (isPersonDetected && greeting && !hasGreetedRef.current) {
    hasGreetedRef.current = true;
    console.log("挨拶発動:", greeting);
    isSpeakingRef.current = false;
    setTimeout(() => {
      speakDirectly(greeting);
    }, 1000);
  }
  if (!isPersonDetected) {
    hasGreetedRef.current = false;  // 離れたらリセット
  }
}, [isPersonDetected, greeting]);
 if (!isReady) return (
  <div style={{
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1a1a2e, #16213e)",
    fontSize: "24px",
    color: "white",
    gap: "20px"
  }}>
    <div style={{ fontSize: "120px", lineHeight: "1" }}>💁‍♀️</div>
<div style={{ fontSize: "20px", marginTop: "10px" }}>AIコンシェルジュを起動中...</div>
    <div style={{
      width: "200px",
      height: "4px",
      background: "#333",
      borderRadius: "2px",
      overflow: "hidden"
    }}>
      <div style={{
        width: "50%",
        height: "100%",
        background: "white",
        borderRadius: "2px",
        animation: "loading 1s infinite"
      }} />
    </div>
    <style>{`
      @keyframes loading {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(400%); }
      }
    `}</style>
  </div>
); 
return (
  <>
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(0,0,0,0.8)', color: '#0f0',
      fontSize: '12px', padding: '8px', zIndex: 9999,
      maxHeight: '150px', overflow: 'auto', fontFamily: 'monospace'
    }}>
      {debugLog.map((log, i) => <div key={i}>{log}</div>)}
    </div>

    {!audioUnlocked && (
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)',
        }}
        onClick={async () => {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          await ctx.resume();
           audioContextRef.current = ctx; 
          setAudioUnlocked(true);
          speakDirectly(greeting || 'こんにちは');
        }}
      >
        <div style={{
          background: '#fff', padding: '40px 60px', borderRadius: '16px',
          fontSize: '18px', fontWeight: 'bold', textAlign: 'center'
        }}>
          タップして開始
        </div>
      </div>
    )}

    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <video ref={videoRef} style={{ display: 'none' }} playsInline muted />

      {/* ログアウトボタン */}
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          router.push("/login");
        }}
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          zIndex: 10,
          padding: "8px 16px",
          background: "rgba(0,0,0,0.5)",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        ログアウト
      </button>

      {/* 電話ボタン */}
      {callButton && (
        <div style={{
          position: "absolute",
          bottom: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          textAlign: "center"
        }}>
          <a href={`tel:${callButton.phone}`} style={{
            display: "block",
            background: "#2ecc71",
            color: "white",
            padding: "16px 40px",
            borderRadius: "32px",
            fontSize: "20px",
            textDecoration: "none",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }}>
            📞 {callButton.name}さんに電話する
          </a>
        </div>
      )}

      {isPersonDetected ? (
        <Canvas
          style={{ width: '100%', height: '100%', display: 'block' }}
          camera={{ position: [0, 1.2, 4.0], fov: 25 }}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[1, 2, 3]} />
          <Avatar vrmUrl={vrmUrl} emotion={emotion} />
          <OrbitControls target={[0, 1.2, 0]} />
        </Canvas>
      ) : (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#000', color: '#fff', fontSize: '24px'
        }}>
          しばらくお待ちください...
        </div>
      )}
    </div>
  </>
);
}
