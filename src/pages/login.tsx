import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError("メールアドレスまたはパスワードが違います");
    } else {
      router.push("/kiosk")
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
      Digital Signage Lab.
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