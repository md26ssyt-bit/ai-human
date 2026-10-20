import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";
import type { VRM } from "@pixiv/three-vrm";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// 恋愛ランゲームの舞台：2体のアバター（プレイヤー役が左、相手が右）を、向かい合わせて表示する。
// このファイルは、画面の表示だけを担当する（点数や進行は、サーバーが決める）。

export type Expr = "happy" | "neutral" | "sad" | "angry" | "surprised";
export type Gesture = "idle" | "nod" | "tilt" | "look_away" | "lean_in" | "arms_crossed" | "wave";
export type Effect = "none" | "fall" | "smoke";

// 腕のポーズ（回転の値。モデルによって、見え方が少し違うので、見ながら調整する）
type Arm = { lUx: number; lUy: number; lUz: number; lLy: number; rUx: number; rUy: number; rUz: number; rLy: number };
const ARM_IDLE: Arm = { lUx: 0, lUy: 0, lUz: -1.2, lLy: 0, rUx: 0, rUy: 0, rUz: 1.2, rLy: 0 };
const ARM_CROSSED: Arm = { lUx: -0.6, lUy: -1.0, lUz: -1.2, lLy: -1.5, rUx: -0.35, rUy: 1.0, rUz: 1.2, rLy: 1.2 };
const ARM_KEYS = Object.keys(ARM_IDLE) as (keyof Arm)[];

type AvatarProps = {
  url: string;
  x: number;
  yaw: number; // 向き（相手のほうへ、少し向ける）
  side: "left" | "right";
  expr: Expr;
  gesture: Gesture;
  gestureKey: number; // 同じ身振りを、もう一度、動かすための番号
  effect: Effect;
  speaking: boolean; // しゃべっている間は true（口を動かす）
};

function Avatar(props: AvatarProps) {
  const { url, x, yaw, side, expr, gesture, gestureKey, effect, speaking } = props;
  const group = useRef<THREE.Group>(null);
  const [vrm, setVrm] = useState<VRM | null>(null);
  const baseY = useRef(0);
  const clock = useRef(0);
  const gStart = useRef(0);
  const eStart = useRef(0);
  const blink = useRef({ timer: Math.random() * 2, next: 3, value: 0 });
  const mouth = useRef(0); // 口の開き具合（0〜1）
  const cur = useRef({
    headX: 0, headY: 0, headZ: 0, spineX: 0,
    arm: { ...ARM_IDLE } as Arm,
    ex: { happy: 0, sad: 0, angry: 0, surprised: 0, neutral: 0.3 } as Record<Expr, number>,
  });

  useEffect(() => {
    let disposed = false;
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    loader.load(
      url,
      (gltf) => {
        if (disposed) return;
        const m = gltf.userData.vrm as VRM;
        // 足もとが、原点（地面）にくるように、位置をそろえる
        const box = new THREE.Box3().setFromObject(m.scene);
        const center = box.getCenter(new THREE.Vector3());
        m.scene.position.x -= center.x;
        m.scene.position.z -= center.z;
        m.scene.position.y -= box.min.y;
        baseY.current = m.scene.position.y;
        setVrm(m);
      },
      undefined,
      (err) => console.error("VRM読み込みエラー:", err)
    );
    return () => { disposed = true; };
  }, [url]);

  useEffect(() => { gStart.current = clock.current; }, [gestureKey, gesture]);
  useEffect(() => { eStart.current = clock.current; }, [effect]);

  useFrame((_, delta) => {
    if (!vrm) return;
    clock.current += delta;
    const t = clock.current - gStart.current;
    const et = clock.current - eStart.current;
    const k = Math.min(1, delta * 8);
    const lerp = (a: number, b: number) => a + (b - a) * k;
    const away = side === "left" ? -1 : 1; // 相手と、反対の向き

    // ---- 身振りの目標値 ----
    let headX = 0, headY = 0, headZ = 0, spineX = 0;
    let arm: Arm = ARM_IDLE;
    switch (gesture) {
      case "nod": headX = 0.2 * Math.sin(t * 7) * Math.exp(-t * 1.4); break;
      case "tilt": headZ = 0.22 * -away; break;
      case "look_away": headY = 0.6 * away; headX = 0.1; break;
      case "lean_in": spineX = 0.14; headX = 0.04; break;
      case "arms_crossed": arm = ARM_CROSSED; headX = 0.05; break;
      case "wave":
        if (t < 1.8) {
          arm = { ...ARM_IDLE, rUz: -0.5 + 0.2 * Math.sin(t * 9), rLy: 0.4 };
        }
        break;
      default: break;
    }

    const c = cur.current;
    c.headX = lerp(c.headX, headX);
    c.headY = lerp(c.headY, headY);
    c.headZ = lerp(c.headZ, headZ);
    c.spineX = lerp(c.spineX, spineX);
    for (const key of ARM_KEYS) c.arm[key] = lerp(c.arm[key], arm[key]);

    // ---- 表情・まばたき ----
    const b = blink.current;
    b.timer += delta;
    if (b.timer > b.next) {
      b.value += delta * 6;
      if (b.value >= 1) { b.value = 1; b.timer = 0; b.next = 2 + Math.random() * 3; }
    } else {
      b.value = Math.max(0, b.value - delta * 6);
    }
    const targets: Record<Expr, number> = {
      happy: expr === "happy" ? 0.8 : 0, sad: expr === "sad" ? 0.8 : 0,
      angry: expr === "angry" ? 0.8 : 0, surprised: expr === "surprised" ? 0.8 : 0,
      neutral: expr === "neutral" ? 0.3 : 0,
    };
    (Object.keys(targets) as Expr[]).forEach((e) => { c.ex[e] = lerp(c.ex[e], targets[e]); });

    // ---- 口の動き（しゃべっている間だけ、時間で揺らす）----
    const T = clock.current;
    const mouthTarget = speaking
      ? Math.max(0, 0.18 + 0.32 * Math.sin(T * 13) + 0.2 * Math.sin(T * 5.3 + 1.2) + 0.1 * Math.sin(T * 21))
      : 0;
    mouth.current += (mouthTarget - mouth.current) * Math.min(1, delta * 18);

    // ---- 頭・背骨（更新の前に設定）----
    const h: any = vrm.humanoid;
    const norm = (name: string) => h?.getNormalizedBoneNode?.(name) ?? h?.getRawBoneNode?.(name);
    const head = norm("head");
    if (head) head.rotation.set(c.headX, c.headY, c.headZ);
    const spine = norm("spine");
    if (spine) spine.rotation.x = c.spineX;

    if (vrm.expressionManager) {
      const em = vrm.expressionManager;
      em.setValue("blink", b.value);
      (Object.keys(c.ex) as Expr[]).forEach((e) => em.setValue(e, c.ex[e]));
      em.setValue("aa", Math.min(1, mouth.current));
      em.update();
    }
    vrm.update(delta);
    vrm.scene.position.y = baseY.current + Math.sin(clock.current * 2) * 0.004; // 呼吸

    // ---- 腕（更新のあとに設定）----
    const raw = (name: string) => h?.getRawBoneNode?.(name);
    const lU = raw("leftUpperArm"), rU = raw("rightUpperArm"), lL = raw("leftLowerArm"), rL = raw("rightLowerArm");
    if (lU && rU && lL && rL) {
      lU.rotation.x = c.arm.lUx; lU.rotation.y = c.arm.lUy; lU.rotation.z = c.arm.lUz;
      rU.rotation.x = c.arm.rUx; rU.rotation.y = c.arm.rUy; rU.rotation.z = c.arm.rUz;
      lL.rotation.x = 0; lL.rotation.y = c.arm.lLy; lL.rotation.z = 0;
      rL.rotation.x = 0; rL.rotation.y = c.arm.rLy; rL.rotation.z = 0;
    }

    // ---- 演出（倒れる／煙で消える）----
    const g = group.current;
    if (g) {
      g.rotation.y = yaw;
      if (effect === "fall") {
        const p = Math.min(1, et / 1.2);
        const e = p * p;
        g.rotation.z = (side === "left" ? 1 : -1) * 1.45 * e; // 相手と反対側へ、倒れる
        g.position.y = -0.08 * e;
        g.scale.setScalar(1);
      } else if (effect === "smoke") {
        const s = et < 0.35 ? 1 : Math.max(0, 1 - (et - 0.35) / 0.75);
        g.rotation.z = 0;
        g.position.y = 0;
        g.scale.setScalar(Math.max(0.0001, s));
      } else {
        g.rotation.z = 0;
        g.position.y = 0;
        g.scale.setScalar(1);
      }
    }
  });

  return (
    <group ref={group} position={[x, 0, 0]}>
      {vrm && <primitive object={vrm.scene} />}
    </group>
  );
}

// 煙（白いふわふわの丸）
function Smoke({ x, active }: { x: number; active: boolean }) {
  const group = useRef<THREE.Group>(null);
  const clock = useRef(0);
  const start = useRef(0);
  const tex = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 128;
    const ctx = cv.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.6, "rgba(245,245,255,0.6)");
    g.addColorStop(1, "rgba(245,245,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(cv);
  }, []);
  const puffs = useMemo(
    () => Array.from({ length: 14 }, () => ({ dx: (Math.random() - 0.5) * 0.5, y: 0.5 + Math.random() * 0.9, delay: Math.random() * 0.35, s: 0.45 + Math.random() * 0.4 })),
    []
  );
  useEffect(() => { start.current = clock.current; }, [active]);

  useFrame((_, delta) => {
    clock.current += delta;
    const et = clock.current - start.current;
    group.current?.children.forEach((child, i) => {
      const p = puffs[i];
      const sp = child as THREE.Sprite;
      const t = active ? et - p.delay : -1;
      if (t < 0) { sp.visible = false; return; }
      const grow = Math.min(1, t / 1.2);
      sp.visible = true;
      sp.scale.setScalar(p.s * (0.3 + 1.6 * grow));
      (sp.material as THREE.SpriteMaterial).opacity = grow < 0.3 ? (grow / 0.3) * 0.9 : 0.9 * (1 - (grow - 0.3) / 0.7);
      sp.position.set(x + p.dx, p.y + grow * 0.2, 0.25);
    });
  });

  return (
    <group ref={group}>
      {puffs.map((_, i) => (
        <sprite key={i} visible={false}>
          <spriteMaterial map={tex} transparent depthWrite={false} opacity={0} />
        </sprite>
      ))}
    </group>
  );
}

// 画面の縦横比に合わせて、カメラの距離を決める（2人が、横に収まるように）
function Rig() {
  const { camera, size } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    const d = Math.max(2.5, 3.2 / aspect);
    cam.position.set(0, 1.2, d);
    cam.lookAt(0, 1.1, 0);
    cam.updateProjectionMatrix();
  }, [size, camera]);
  return null;
}

export type StageProps = {
  role: "W" | "M"; // W：女性役（左が女性、右が男性）／ M：男性役（左が男性、右が女性）
  playerExpr: Expr;
  partnerExpr: Expr;
  playerGesture: Gesture;
  partnerGesture: Gesture;
  playerKey: number;
  partnerKey: number;
  effect: Effect; // フラれたときの、プレイヤー役の演出
  partnerSpeaking?: boolean; // 相手がしゃべっている間は true（口を動かす）
};

const PLAYER_X = -0.45;
const PARTNER_X = 0.45;

export default function GameStage(p: StageProps) {
  const woman = "/woman.vrm";
  const man = "/man.vrm";
  const playerUrl = p.role === "W" ? woman : man;
  const partnerUrl = p.role === "W" ? man : woman;
  return (
    <div style={{ width: "100%", height: 340, position: "relative" }}>
      <Canvas camera={{ position: [0, 1.2, 2.6], fov: 30 }} gl={{ alpha: true }} style={{ background: "transparent" }}>
        <Rig />
        <ambientLight intensity={0.8} />
        <directionalLight position={[1, 2, 3]} intensity={1.1} />
        <Avatar key={"p-" + playerUrl} url={playerUrl} x={PLAYER_X} yaw={0.35} side="left"
          expr={p.playerExpr} gesture={p.playerGesture} gestureKey={p.playerKey} effect={p.effect} speaking={false} />
        <Avatar key={"o-" + partnerUrl} url={partnerUrl} x={PARTNER_X} yaw={-0.35} side="right"
          expr={p.partnerExpr} gesture={p.partnerGesture} gestureKey={p.partnerKey} effect="none" speaking={!!p.partnerSpeaking} />
        <Smoke x={PLAYER_X} active={p.effect === "smoke"} />
      </Canvas>
    </div>
  );
}