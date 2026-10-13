const KEY = "akgym:public:offers:v1";
const corsHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};
function reply(res, status, body) { res.status(status); res.setHeader("Cache-Control", "no-store, max-age=0"); res.setHeader("X-Content-Type-Options", "nosniff"); return res.json(body); }
async function redis(command) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Offer storage is not configured");
  const r = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(command), cache: "no-store" });
  if (!r.ok) throw new Error(`Storage request failed (${r.status})`);
  const data = await r.json();
  if (data.error) throw new Error("Storage command failed");
  return data.result;
}
function validPayload(v) {
  if (!v || typeof v !== "object" || !Array.isArray(v.offers) || v.offers.length > 50) return false;
  return v.offers.every(o => o && typeof o.id === "string" && o.id.length <= 80 && typeof o.active === "boolean" && typeof o.title === "string" && o.title.length <= 160 && typeof o.arTitle === "string" && o.arTitle.length <= 160 && typeof o.num !== "undefined" && String(o.num).length <= 20 && ["uni", "wa", "details"].includes(o.type || "wa"));
}
export default async function handler(req, res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (req.method === "GET") {
    try {
      const raw = await redis(["GET", KEY]);
      if (!raw) return reply(res, 200, { schemaVersion: 1, updatedAt: null, offers: [] });
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.offers)) throw new Error("Invalid stored offers");
      return reply(res, 200, data);
    } catch (e) {
      console.error("Public offers read failed:", e.message);
      return reply(res, 503, { error: "offers_unavailable" });
    }
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return reply(res, 405, { error: "method_not_allowed" });
  }
  const expected = process.env.AKGYM_PUBLISH_TOKEN;
  const auth = req.headers.authorization || "";
  if (!expected || auth !== `Bearer ${expected}`) return reply(res, 401, { error: "unauthorized" });
  if (!validPayload(req.body)) return reply(res, 400, { error: "invalid_offers_payload" });
  const payload = { schemaVersion: 1, updatedAt: new Date().toISOString(), offers: req.body.offers.map(o => ({
    id: String(o.id).slice(0, 80), active: o.active === true,
    tag: String(o.tag || "").slice(0, 60), arTag: String(o.arTag || o.tag || "").slice(0, 60),
    num: String(o.num ?? "").slice(0, 20), unit: String(o.unit || "").slice(0, 20),
    title: String(o.title || "").slice(0, 160), arTitle: String(o.arTitle || "").slice(0, 160),
    desc: String(o.desc || "").slice(0, 300), arDesc: String(o.arDesc || "").slice(0, 300),
    btn: String(o.btn || "VIEW OFFER").slice(0, 50), arBtn: String(o.arBtn || "عرض التفاصيل").slice(0, 50),
    type: ["uni", "details"].includes(o.type) ? o.type : "wa", msg: String(o.msg || "").slice(0, 1000),
    ...(typeof o.startDate === "string" ? { startDate: o.startDate.slice(0, 10) } : {}),
    ...(typeof o.endDate === "string" ? { endDate: o.endDate.slice(0, 10) } : {})
  })) };
  try {
    await redis(["SET", KEY, JSON.stringify(payload)]);
    return reply(res, 200, { ok: true, updatedAt: payload.updatedAt, count: payload.offers.length });
  } catch (e) {
    console.error("Public offers publish failed:", e.message);
    return reply(res, 503, { error: "publish_unavailable" });
  }
}
