"use client";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
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

function Avatar({ vrmUrl }: { vrmUrl: string }) {
const mouthState = useRef({
  speaking: false,
  value: 0,
  volume: 0,
  inhale: false,
  blinkAfter: false,
});

const [vrm, setVrm] = useState<VRM | null>(null);

// 瞬き
const blinkState = useRef({
  timer: 0,
  nextBlink: 3,
  value: 0
});

useEffect(() => {

  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));

  loader.load(vrmUrl, (gltf) => {

    const vrmModel = gltf.userData.vrm as VRM;

    // モデル中央補正
    const box = new THREE.Box3().setFromObject(vrmModel.scene);
    const center = box.getCenter(new THREE.Vector3());
    vrmModel.scene.position.sub(center);

    setVrm(vrmModel);

  });

  (window as any).mouthState = mouthState;

}, []);


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
    vrm.expressionManager.setValue("happy", 0.3);

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
useEffect(() => {
const checkSession = async () => {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    router.push("/login");
  } else {
    setSession(data.session);
    const { data: customer } = await supabase
      .from('customers')
      .select('vrm_url')
      .eq('email', data.session.user.email)
      .single();
    if (customer?.vrm_url) setVrmUrl(customer.vrm_url);
  }
};
  checkSession();
}, []);
  const [messages, setMessages] = useState<any[]>([]);
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  
  const speakQueue = useRef<string[]>([]);
  const isProcessingQueue = useRef(false);

  // --- キューを順番に処理する関数 ---
  const processQueue = async () => {
    if (isProcessingQueue.current || speakQueue.current.length === 0) return;
    isProcessingQueue.current = true;
    while (speakQueue.current.length > 0) {
      const nextText = speakQueue.current.shift();
      if (nextText) await playAudio(nextText);
    }
    isProcessingQueue.current = false;
  };

  // --- 実際の音声再生ロジック ---
  const playAudio = (text: string) => {
    return new Promise<void>(async (resolve) => {
      isSpeakingRef.current = true;
      try {
        recognitionRef.current?.stop();
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        });
        const blob = await res.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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
          try { recognitionRef.current?.start(); } catch (e) {}
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
const sendMessage = async (text: string) => {
  if (!text) return;
  setMessages(prev => [...prev, { role: "user", text }]);
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, email: session?.user?.email })
    });
    const data = await response.json();
    const reply = data.reply ?? "少しお待ちください";

    setMessages(prev => [...prev, { role: "ai", text: reply }]);

    // 句読点で分割して順番に読み上げ
    const sentences = reply.split(/(?<=[。！？])/);
    for (const sentence of sentences) {
      if (sentence.trim()) speak(sentence.trim());
    }
  } catch (error) {
    console.error("APIエラー:", error);
  }
};
  // 🔥 音声認識を復活
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "ja-JP";
    recognition.continuous = true;
    recognition.onresult = (event: any) => {
      const text = event.results[event.results.length - 1][0].transcript;
      sendMessage(text);
    };
    recognition.onend = () => {
      if (!isSpeakingRef.current) try { recognition.start(); } catch (e) {}
    };
    recognition.start();
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 1.3, 1.5], fov: 35 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[1, 2, 3]} />
        <Avatar vrmUrl={vrmUrl} />
        <OrbitControls target={[0, 1.2, 0]} />
      </Canvas>
    </div>
  );
}