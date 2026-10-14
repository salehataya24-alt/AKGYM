const KEY = "akgym:member-cards:v1";
function reply(res, status, body) { res.status(status); res.setHeader("Content-Type", "application/json; charset=utf-8"); res.setHeader("Cache-Control", "no-store, max-age=0"); res.setHeader("X-Content-Type-Options", "nosniff"); return res.json(body); }
async function redis(command) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Member-card storage is not configured");
  const r = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(command), cache: "no-store", signal: AbortSignal.timeout(10000) });
  if (!r.ok) throw new Error("Storage request failed"); const data = await r.json(); if (data.error) throw new Error("Storage command failed"); return data.result;
}
function validMember(m) { return m && typeof m.memberCode === "string" && m.memberCode.length > 0 && m.memberCode.length <= 40 && typeof m.phone === "string" && /^\+?[0-9]{7,20}$/.test(m.phone) && typeof m.fullName === "string" && m.fullName.length <= 120; }
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0"); res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return reply(res, 405, { error: "method_not_allowed" }); }
  const expected = process.env.AKGYM_PUBLISH_TOKEN; const auth = req.headers.authorization || "";
  if (!expected || expected.length < 24 || auth !== `Bearer ${expected}`) return reply(res, 401, { error: "unauthorized" });
  const members = req.body?.members;
  if (!Array.isArray(members) || members.length > 5000 || !members.every(validMember)) return reply(res, 400, { error: "invalid_members_payload" });
  const seen = new Set();
  const clean = [];
  for (const m of members) {
    const code = m.memberCode.trim(); const key = code.toLowerCase(); if (seen.has(key)) return reply(res, 400, { error: "duplicate_member_code" }); seen.add(key);
    clean.push({ memberCode: code.slice(0,40), phone: m.phone, fullName: m.fullName.trim().slice(0,120), barcodeValue: String(m.barcodeValue || code).slice(0,80), planName: String(m.planName || "").slice(0,80), endDate: /^\d{4}-\d{2}-\d{2}$/.test(String(m.endDate || "")) ? m.endDate : "", status: ["active","expired","future"].includes(m.status) ? m.status : "unknown", usedVisits: Number.isFinite(Number(m.usedVisits)) && Number(m.usedVisits) >= 0 ? Math.floor(Number(m.usedVisits)) : 0 });
  }
  const payload = { schemaVersion: 1, updatedAt: new Date().toISOString(), members: clean };
  try { await redis(["SET", KEY, JSON.stringify(payload)]); return reply(res, 200, { ok: true, count: clean.length, updatedAt: payload.updatedAt }); }
  catch (e) { console.error("Member-card sync failed:", e.message); return reply(res, 503, { error: "member_sync_unavailable" }); }
}
