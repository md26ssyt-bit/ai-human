import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

 const handleLogin = async () => {
  // 既存セッションをチェック
  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('session_id, session_updated_at')
    .eq('email', email)
    .single();

  if (existingCustomer?.session_updated_at) {
    const lastUpdate = new Date(existingCustomer.session_updated_at).getTime();
    const now = Date.now();
    console.log("lastUpdate:", lastUpdate);
    console.log("now:", now);
    console.log("差分(ms):", now - lastUpdate);
    if (now - lastUpdate < 8000) {
      setError("他のデバイスで使用中のため、ログインできません");
      return;
    }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    setError("メールアドレスまたはパスワードが違います");
  } else {
    const newSessionId = crypto.randomUUID();
    localStorage.setItem('mySessionId', newSessionId);
    await supabase
      .from('customers')
      .update({ session_id: newSessionId })
      .eq('email', email);
    router.push("/kiosk");
  }
};
 return (
  <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    gap: "16px",
    position: "relative"
  }}>
    {/* 右下の会社名 */}
    <div style={{
      position: "absolute",
      bottom: "16px",
      right: "16px",
      fontSize: "18px",
      color: "#333"
    }}>
      Digkio Lab.
    </div>
    <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>AIコンシェルジュ</h1>
    
    <input
      type="email"
      placeholder="メールアドレス"
      value={email}
      onChange={e => setEmail(e.target.value)}
      style={{ padding: "8px", width: "300px" }}
    />
    <input
      type="password"
      placeholder="パスワード"
      value={password}
      onChange={e => setPassword(e.target.value)}
      style={{ padding: "8px", width: "300px" }}
    />
    {error && <p style={{ color: "red" }}>{error}</p>}
    <button
      onClick={handleLogin}
      style={{ padding: "10px 40px", cursor: "pointer" }}
    >
      ログイン
    </button>
  </div>
  );
}