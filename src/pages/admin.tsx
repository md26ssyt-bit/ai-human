import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Admin() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [vrmUrl, setVrmUrl] = useState("");
  const [password, setPassword] = useState("");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [staffList, setStaffList] = useState<any[]>([]);
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

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

  const fetchStaff = async (customerId: string) => {
    const res = await fetch(`/api/staff?customer_id=${customerId}`);
    const { data } = await res.json();
    if (data) setStaffList(data);
  };

  const addCustomer = async () => {
    await supabase.auth.signUp({ email, password });
    await supabase.from("customers").insert({
      email,
      company_name: companyName,
      prompt,
      vrm_url: vrmUrl,
      notify_email: notifyEmail,
      created_at: new Date().toISOString(),
    });
    fetchCustomers();
    setEmail("");
    setCompanyName("");
    setPrompt("");
    setVrmUrl("");
    setPassword("");
    setNotifyEmail("");
  };

  const deleteCustomer = async (id: string, email: string) => {
    await supabase.from("customers").delete().eq("id", id);
    fetchCustomers();
  };

  const addStaff = async () => {
    if (!selectedCustomerId || !staffName || !staffEmail) return;
    await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: selectedCustomerId,
        name: staffName,
        email: staffEmail,
      }),
    });
    fetchStaff(selectedCustomerId);
    setStaffName("");
    setStaffEmail("");
  };

  const deleteStaff = async (id: string) => {
    await fetch('/api/staff', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (selectedCustomerId) fetchStaff(selectedCustomerId);
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", position: "relative" }}>
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
          padding: "8px 16px",
          background: "black",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        ログアウト
      </button>

      <h1>管理画面</h1>

      <h2>お客様を追加</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "40px" }}>
        <input placeholder="メールアドレス" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "8px" }} />
        <input placeholder="パスワード" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: "8px" }} />
        <input placeholder="会社名" value={companyName} onChange={e => setCompanyName(e.target.value)} style={{ padding: "8px" }} />
        <textarea placeholder="AIへの指示文（プロンプト）" value={prompt} onChange={e => setPrompt(e.target.value)} style={{ padding: "8px", height: "100px" }} />
        <input placeholder="VRMファイルのURL" value={vrmUrl} onChange={e => setVrmUrl(e.target.value)} style={{ padding: "8px" }} />
        <input placeholder="通知先メールアドレス" value={notifyEmail} onChange={e => setNotifyEmail(e.target.value)} style={{ padding: "8px" }} />
        <button onClick={addCustomer} style={{ padding: "10px", background: "black", color: "white", cursor: "pointer" }}>
          追加する
        </button>
      </div>

      <h2>お客様一覧</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "40px" }}>
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

      <h2>担当者を追加</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "40px" }}>
        <select
          value={selectedCustomerId}
          onChange={e => {
            setSelectedCustomerId(e.target.value);
            fetchStaff(e.target.value);
          }}
          style={{ padding: "8px" }}
        >
          <option value="">会社を選んでください</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>
              {customer.company_name}
            </option>
          ))}
        </select>
        <input placeholder="担当者の名前" value={staffName} onChange={e => setStaffName(e.target.value)} style={{ padding: "8px" }} />
        <input placeholder="担当者のメールアドレス" value={staffEmail} onChange={e => setStaffEmail(e.target.value)} style={{ padding: "8px" }} />
        <button onClick={addStaff} style={{ padding: "10px", background: "black", color: "white", cursor: "pointer" }}>
          担当者を追加する
        </button>
      </div>

      <h2>担当者一覧</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>名前</th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>メール</th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {staffList.map(staff => (
            <tr key={staff.id}>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{staff.name}</td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{staff.email}</td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                <button onClick={() => deleteStaff(staff.id)} style={{ padding: "4px 8px", background: "red", color: "white", cursor: "pointer" }}>
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
