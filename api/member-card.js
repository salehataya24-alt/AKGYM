import crypto from "node:crypto";

const KEY = "akgym:public:members:v1";
function reply(res, status, body) {
  res.status(status);
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  return res.json(body);
}
function normPhone(v) { return String(v || "").replace(/\D/g, ""); }
function safeEqual(a, b) {
  const aa = Buffer.from(String(a || ""), "utf8");
  const bb = Buffer.from(String(b || ""), "utf8");
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}
function phoneHash(identity, phone, secret) {
  return crypto.createHmac("sha256", secret).update(`${identity}|${normPhone(phone)}`, "utf8").digest("hex");
}
function matchesPhoneHash(storedHashes, identity, phone, secret) {
  if (!Array.isArray(storedHashes)) return typeof storedHashes === "string" && safeEqual(storedHashes, phoneHash(identity, phone, secret));
  const digits = normPhone(phone);
  for (let len = Math.min(digits.length, 20); len >= 7; len--) {
    const candidate = phoneHash(identity, digits.slice(-len), secret);
    if (storedHashes.some(value => safeEqual(value, candidate))) return true;
  }
  return false;
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
async function rateLimited(req) {
  const ip = String(req.headers["x-real-ip"] || req.socket?.remoteAddress || "unknown");
  const key = "akgym:member-card:attempts:" + crypto.createHash("sha256").update(ip).digest("hex").slice(0, 32);
  const count = Number(await redis(["INCR", key]));
  if (count === 1) await redis(["EXPIRE", key, 900]);
  return count > 60;
}
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return reply(res, 405, { error: "method_not_allowed" });
  }
  const memberCode = typeof req.body?.memberCode === "string" ? req.body.memberCode.trim().slice(0, 40) : "";
  const phone = typeof req.body?.phone === "string" ? req.body.phone.trim().slice(0, 24) : "";
  if (!memberCode || !/^[+0-9\s().-]{7,24}$/.test(phone) || normPhone(phone).length < 7) {
    return reply(res, 400, { error: "invalid_credentials" });
  }
  const secret = process.env.MEMBER_SYNC_API_TOKEN;
  if (!secret) return reply(res, 503, { error: "member_card_not_configured" });
  try {
    if (await rateLimited(req)) return reply(res, 429, { error: "too_many_attempts" });
    const raw = await redis(["GET", KEY]);
    if (!raw) return reply(res, 503, { error: "member_data_not_synced" });
    const snapshot = JSON.parse(raw);
    const byCode = snapshot.members.find(m => m.no === memberCode && matchesPhoneHash(m.ph, m.no, phone, secret));
    const byNationalId = byCode || snapshot.members.find(m => m.nid && matchesPhoneHash(m.nid, memberCode, phone, secret));
    const m = byNationalId;
    if (!m || Number(m.active) !== 1) return reply(res, 401, { error: "invalid_credentials" });
    const status = String(m.st || "none");
    return reply(res, 200, {
      member: { fullName: String(m.name || "").slice(0, 120), memberCode: String(m.no).slice(0, 40), barcodeValue: String(m.bc || m.no).slice(0, 80) },
      subscription: { planName: String(m.plan || "").slice(0, 100), endDate: m.end || null, status },
      visits: {
        total: m.unl ? null : Math.max(0, Number(m.tot) || 0),
        used: Math.max(0, Number(m.used) || 0),
        remaining: m.unl ? null : Math.max(0, Number(m.rem) || 0),
        unlimited: Boolean(Number(m.unl))
      },
      updatedAt: snapshot.generated_at || null
    });
  } catch (e) {
    console.error("Member-card lookup failed:", e.message);
    return reply(res, 503, { error: "member_card_unavailable" });
  }
}
