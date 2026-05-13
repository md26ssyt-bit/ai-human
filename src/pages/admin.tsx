import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

export default function Admin() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [vrmUrl, setVrmUrl] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
  const checkAdmin = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.push("/login");
      return;
    }
    fetchCustomers();
  };
  checkAdmin();
}, []);

  const fetchCustomers = async () => {
    const { data } = await supabase.from("customers").select("*");
    if (data) setCustomers(data);
  };

  const addCustomer = async () => {
    // Supabaseにユーザーを追加
    await supabase.auth.signUp({ email, password });
    // customersテーブルに追加
    await supabase.from("customers").insert({
      email,
      company_name: companyName,
      prompt,
      vrm_url: vrmUrl,
      created_at: new Date().toISOString(),
    });
    fetchCustomers();
    setEmail("");
    setCompanyName("");
    setPrompt("");
    setVrmUrl("");
    setPassword("");
  };

  const deleteCustomer = async (id: string, email: string) => {
    await supabase.from("customers").delete().eq("id", id);
    fetchCustomers();
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>管理画面</h1>

      <h2>お客様を追加</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "40px" }}>
        <input placeholder="メールアドレス" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "8px" }} />
        <input placeholder="パスワード" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: "8px" }} />
        <input placeholder="会社名" value={companyName} onChange={e => setCompanyName(e.target.value)} style={{ padding: "8px" }} />
        <textarea placeholder="AIへの指示文（プロンプト）" value={prompt} onChange={e => setPrompt(e.target.value)} style={{ padding: "8px", height: "100px" }} />
        <input placeholder="VRMファイルのURL" value={vrmUrl} onChange={e => setVrmUrl(e.target.value)} style={{ padding: "8px" }} />
        <button onClick={addCustomer} style={{ padding: "10px", background: "black", color: "white", cursor: "pointer" }}>
          追加する
        </button>
      </div>

      <h2>お客様一覧</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>メール</th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>会社名</th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <tr key={customer.id}>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{customer.email}</td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{customer.company_name}</td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                <button onClick={() => deleteCustomer(customer.id, customer.email)} style={{ padding: "4px 8px", background: "red", color: "white", cursor: "pointer" }}>
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}