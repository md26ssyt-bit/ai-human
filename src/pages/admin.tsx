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
  const [greeting, setGreeting] = useState("");
  const [staffList, setStaffList] = useState<any[]>([]);
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPhone, setStaffPhone] = useState(""); 
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [voiceName, setVoiceName] = useState('ja-JP-Neural2-B');
  const [invoiceCustomerId, setInvoiceCustomerId] = useState("");
  const [invoiceItems, setInvoiceItems] = useState([{ name: "", quantity: 1, price: 0 }]);
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [sendingInvoice, setSendingInvoice] = useState(false);
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
      greeting: greeting,
      voice_name: voiceName, 
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
        phone: staffPhone, 
      }),
    });
    fetchStaff(selectedCustomerId);
    setStaffName("");
    setStaffEmail("");
    setStaffPhone(""); 
  };

  const deleteStaff = async (id: string) => {
    await fetch('/api/staff', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (selectedCustomerId) fetchStaff(selectedCustomerId);
  };
const sendInvoice = async () => {
  if (!invoiceCustomerId) return alert("会社を選んでください");
  const customer = customers.find(c => c.id === invoiceCustomerId);
  if (!customer) return;

  const total = invoiceItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  console.log("inserting invoice...");
  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      customer_email: customer.email,
      company_name: customer.company_name,
      items: invoiceItems,
      total,
      issue_date: issueDate,
      due_date: dueDate,
    })
    .select()
    .single();
  console.log("invoice:", invoice, "error:", error);
  if (error || !invoice) return alert("請求書の作成に失敗しました");

  setSendingInvoice(true);
  const res = await fetch("/api/send-invoice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invoiceId: invoice.id }),
  });

  setSendingInvoice(false);
  if (res.ok) {
    alert("請求書を送信しました！");
    setInvoiceItems([{ name: "", quantity: 1, price: 0 }]);
    setIssueDate("");
    setDueDate("");
  } else {
    alert("送信に失敗しました");
  }
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
        <input placeholder="最初の挨拶文" value={greeting} onChange={e => setGreeting(e.target.value)} style={{ padding: "8px" }} />
        <select value={voiceName} onChange={e => setVoiceName(e.target.value)} style={{ padding: "8px" }}>
        <option value="ja-JP-Neural2-B">女性A（落ち着いた）</option>
        <option value="ja-JP-Neural2-C">男性A（低め）</option>
        <option value="ja-JP-Neural2-D">男性B（明るい）</option>
        <option value="ja-JP-Neural2-F">女性B（明るい）</option>
        <option value="ja-JP-Wavenet-A">女性C（自然）</option>
        <option value="ja-JP-Wavenet-B">男性C（自然）</option>
</select>
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
        <input placeholder="担当者の電話番号" value={staffPhone} onChange={e => setStaffPhone(e.target.value)} style={{ padding: "8px" }} />
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
      <h2>請求書を送る</h2>
<div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "40px" }}>
  <select
    value={invoiceCustomerId}
    onChange={e => setInvoiceCustomerId(e.target.value)}
    style={{ padding: "8px" }}
  >
    <option value="">会社を選んでください</option>
    {customers.map(customer => (
      <option key={customer.id} value={customer.id}>
        {customer.company_name}
      </option>
    ))}
  </select>

  <input
    type="date"
    placeholder="発行日"
    value={issueDate}
    onChange={e => setIssueDate(e.target.value)}
    style={{ padding: "8px" }}
  />
  <input
    type="date"
    placeholder="支払期限"
    value={dueDate}
    onChange={e => setDueDate(e.target.value)}
    style={{ padding: "8px" }}
  />

  <h3>品目</h3>
  {invoiceItems.map((item, index) => (
    <div key={index} style={{ display: "flex", gap: "8px" }}>
      <input
        placeholder="品目名"
        value={item.name}
        onChange={e => {
          const updated = [...invoiceItems];
          updated[index].name = e.target.value;
          setInvoiceItems(updated);
        }}
        style={{ padding: "8px", flex: 2 }}
      />
      <input
        type="number"
        placeholder="数量"
        value={item.quantity}
        onChange={e => {
          const updated = [...invoiceItems];
          updated[index].quantity = Number(e.target.value);
          setInvoiceItems(updated);
        }}
        style={{ padding: "8px", flex: 1 }}
      />
      <input
        type="number"
        placeholder="単価"
        value={item.price}
        onChange={e => {
          const updated = [...invoiceItems];
          updated[index].price = Number(e.target.value);
          setInvoiceItems(updated);
        }}
        style={{ padding: "8px", flex: 1 }}
      />
      <button
        onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== index))}
        style={{ padding: "8px", background: "red", color: "white", cursor: "pointer" }}
      >
        削除
      </button>
    </div>
  ))}

  <button
    onClick={() => setInvoiceItems([...invoiceItems, { name: "", quantity: 1, price: 0 }])}
    style={{ padding: "8px", background: "#555", color: "white", cursor: "pointer" }}
  >
    ＋ 品目を追加
  </button>

  <button
    onClick={sendInvoice}
    disabled={sendingInvoice}
    style={{ padding: "10px", background: "black", color: "white", cursor: "pointer" }}
  >
    {sendingInvoice ? "送信中..." : "請求書を送信する"}
  </button>
</div>
    </div>
  );
}
