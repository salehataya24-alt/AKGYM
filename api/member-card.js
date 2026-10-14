import { createHash } from "node:crypto";
const noStore = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store, max-age=0", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" };
function reply(res, status, body) { res.status(status); for (const [k,v] of Object.entries(noStore)) res.setHeader(k,v); return res.json(body); }
async function redis(command) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Member-card storage is not configured");
  const r = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(command), cache: "no-store", signal: AbortSignal.timeout(7000) });
  if (!r.ok) throw new Error("Storage request failed");
  const data = await r.json(); if (data.error) throw new Error("Storage command failed"); return data.result;
}
function normalizePhone(v) { return String(v || "").trim().replace(/[\s().-]/g, "").slice(0,24); }
async function incrementLimit(key, ttlSeconds) {
  const n = Number(await redis(["INCR", key]));
  if (n === 1) await redis(["EXPIRE", key, ttlSeconds]);
  return n;
}

export default async function handler(req, res) {
  for (const [k,v] of Object.entries(noStore)) res.setHeader(k,v);
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return reply(res, 405, { error: "method_not_allowed" }); }
  const memberCode = typeof req.body?.memberCode === "string" ? req.body.memberCode.trim().slice(0,40) : "";
  const phone = normalizePhone(req.body?.phone);
  if (!memberCode || !/^\+?[0-9]{7,20}$/.test(phone)) return reply(res, 400, { error: "invalid_credentials" });
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",").map(v=>v.trim()).filter(Boolean);
  const ipRaw = forwarded.length ? forwarded[forwarded.length - 1] : String(req.socket?.remoteAddress || "unknown");
  // Store only a digest of the IP in the rate-limit key.
  const ipKey = createHash("sha256").update(ipRaw).digest("hex").slice(0,24);
  try {
    if ((await incrementLimit(`akgym:card:ip:${ipKey}`, 900)) > 30) return reply(res, 429, { error: "too_many_attempts" });
    const raw = await redis(["GET", "akgym:member-cards:v1"]);
    if (!raw) return reply(res, 503, { error: "member_card_not_configured" });
    const payload = typeof raw === "string" ? JSON.parse(raw) : raw;
    const record = Array.isArray(payload?.members) ? payload.members.find(m => String(m.memberCode).toLowerCase() === memberCode.toLowerCase()) : null;
    // Same response for an unknown code and a mismatched phone.
    if (!record || record.phone !== phone) {
      if ((await incrementLimit(`akgym:card:code:${memberCode.toLowerCase()}`, 900)) > 8) return reply(res, 429, { error: "too_many_attempts" });
      return reply(res, 401, { error: "invalid_credentials" });
    }
    const numeric = n => Number.isFinite(Number(n)) && Number(n) >= 0 ? Math.floor(Number(n)) : null;
    return reply(res, 200, {
      member: { fullName: String(record.fullName || "").slice(0,120), memberCode: String(record.memberCode).slice(0,40), barcodeValue: String(record.barcodeValue || record.memberCode).slice(0,80) },
      subscription: { planName: String(record.planName || "").slice(0,80), endDate: String(record.endDate || "").slice(0,10), status: ["active","expired","future"].includes(record.status) ? record.status : "unknown" },
      // This management system uses date-based subscriptions, not visit packages.
      visits: { total: null, used: numeric(record.usedVisits), remaining: null }
    });
  } catch (e) {
    if (e?.message === "too_many_attempts") return reply(res, 429, { error: "too_many_attempts" });
    console.error("Member-card lookup failed:", e.message); return reply(res, 503, { error: "member_card_unavailable" });
  }
}
