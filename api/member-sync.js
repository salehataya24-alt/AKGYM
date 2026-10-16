import crypto from "node:crypto";

const KEY = "akgym:public:members:v1";
function same(a, b) {
  const aa = Buffer.from(String(a || ""), "utf8");
  const bb = Buffer.from(String(b || ""), "utf8");
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}
async function redis(command) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Member storage is not configured");
  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command), cache: "no-store"
  });
  if (!r.ok) throw new Error(`Storage request failed (${r.status})`);
  const data = await r.json();
  if (data.error) throw new Error("Storage command failed");
  return data.result;
}
function validSnapshot(v) {
  if (!v || typeof v !== "object" || v.schemaVersion !== 1 ||
      !Array.isArray(v.members) || v.members.length > 10000) return false;
  return v.members.every(m =>
    m && typeof m.no === "string" && m.no.length <= 40 &&
    typeof m.name === "string" && m.name.length <= 120 &&
    (m.ph === null || (Array.isArray(m.ph) && m.ph.length <= 20 && m.ph.every(x => typeof x === "string" && /^[a-f0-9]{64}$/.test(x)))) &&
    (m.nid === null || (Array.isArray(m.nid) && m.nid.length <= 20 && m.nid.every(x => typeof x === "string" && /^[a-f0-9]{64}$/.test(x)))) &&
    [0, 1].includes(Number(m.active)) &&
    typeof m.st === "string" &&
    Number.isFinite(Number(m.tot)) && Number.isFinite(Number(m.used)) &&
    (m.rem === null || Number.isFinite(Number(m.rem)))
  );
}
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  const expected = process.env.MEMBER_SYNC_API_TOKEN;
  if (!expected || !same(req.headers.authorization, `Bearer ${expected}`)) {
    return res.status(401).json({ error: "unauthorized" });
  }
  if (!validSnapshot(req.body)) return res.status(400).json({ error: "invalid_snapshot" });
  try {
    const payload = {
      schemaVersion: 1,
      generated_at: String(req.body.generated_at || new Date().toISOString()).slice(0, 40),
      club_name: String(req.body.club_name || "AKGYM").slice(0, 100),
      currency: String(req.body.currency || "").slice(0, 20),
      count: req.body.members.length,
      members: req.body.members
    };
    await redis(["SET", KEY, JSON.stringify(payload)]);
    return res.status(200).json({ ok: true, count: payload.count, generated_at: payload.generated_at });
  } catch (e) {
    console.error("Member snapshot publish failed:", e.message);
    return res.status(503).json({ error: "member_sync_unavailable" });
  }
}
