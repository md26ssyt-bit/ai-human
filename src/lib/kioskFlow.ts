type Turn = { role?: string; text?: string };

const ASK_STAFF = 'どなたをお呼びしましょうか。';
const ASK_VISITOR = '恐れ入りますが、お名前と会社名をお伺いできますか。';
const CALL_WORDS = /(呼んで|呼び出|連絡|メール|知らせ|伝えて|伝言|会いに|お会い|取り次|つないで|繋いで)/;
const COMPANY_WORDS = /(株式会社|有限会社|会社|商事|工業|商店|商会|銀行|病院|大学|事務所|製作所|建設|運輸)/;

function parseStaff(staffInfo: string) {
  return (staffInfo || '')
    .split(',')
    .map((s) => {
      const [name, , phone] = s.split(':');
      return { name: (name || '').trim(), phone: (phone || '').trim() };
    })
    .filter((s) => s.name);
}

function parseVisitor(text: string) {
  const t = text
    .replace(/(です|と申します|といいます|と言います|でございます)/g, '')
    .replace(/[。.!！]/g, ' ')
    .trim();
  const parts = t.split(/[、,\s]+/).filter(Boolean);
  let company = parts.find((p) => COMPANY_WORDS.test(p)) || '';
  let name = parts.find((p) => p !== company) || '';
  if (!company && parts.length === 1 && parts[0].includes('の')) {
    const i = parts[0].lastIndexOf('の');
    company = parts[0].slice(0, i);
    name = parts[0].slice(i + 1);
  }
  if (company.endsWith('の')) company = company.slice(0, -1);
  return { company, name };
}

export function kioskFlowReply(message: string, history: unknown, staffInfo: string): string | null {
  const staff = parseStaff(staffInfo);
  if (staff.length === 0 || !message) return null;

  const turns: Turn[] = Array.isArray(history) ? (history as Turn[]) : [];
  const lastAi = [...turns].reverse().find((h) => h && h.role === 'ai');
  const lastText = String((lastAi && lastAi.text) || '');
  const findStaff = (text: string) => staff.find((s) => text.includes(s.name));
  const tag = '[EMOTION:neutral]';

  // 名前と会社名を答えてもらった直後
  if (lastText.includes(ASK_VISITOR)) {
    const userTexts = turns.filter((h) => h && h.role !== 'ai').map((h) => String(h.text || ''));
    const target = [...userTexts].reverse().map(findStaff).find(Boolean);
    if (!target) return null;
    const { company, name } = parseVisitor(message);
    const who = name ? (company ? `${company}の${name}` : name) : company || 'お名前未確認';
    const spoken = name ? `${who}様ですね。` : '承知いたしました。';
    const call = target.phone ? `[CALL:${target.name}:${target.phone}]` : '';
    return `${spoken}${target.name}様をお呼びしますので、少々お待ちください。[NOTIFY:${target.name}:${who}:来訪のご連絡]${call}${tag}`;
  }

  // 担当者名を答えてもらった直後
  if (lastText.includes(ASK_STAFF)) {
    return findStaff(message) ? `${ASK_VISITOR}${tag}` : null;
  }

  // 呼び出しの依頼
  if (CALL_WORDS.test(message)) {
    return findStaff(message) ? `${ASK_VISITOR}${tag}` : `${ASK_STAFF}${tag}`;
  }

  return null;
}