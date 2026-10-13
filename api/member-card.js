const noStore = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store, max-age=0", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" };
function reply(res, status, body) { res.status(status); for (const [k,v] of Object.entries(noStore)) res.setHeader(k,v); return res.json(body); }
export default async function handler(req, res) {
  for (const [k,v] of Object.entries(noStore)) res.setHeader(k,v);
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return reply(res, 405, { error: "method_not_allowed" }); }
  const memberCode = typeof req.body?.memberCode === "string" ? req.body.memberCode.trim().slice(0,40) : "";
  const phone = typeof req.body?.phone === "string" ? req.body.phone.trim().replace(/[\s().-]/g, "").slice(0,24) : "";
  if (!memberCode || !/^\+?[0-9]{7,20}$/.test(phone)) return reply(res, 400, { error: "invalid_credentials" });
  const base = process.env.MEMBER_SYNC_API_URL;
  const token = process.env.MEMBER_SYNC_API_TOKEN;
  if (!base || !token) return reply(res, 503, { error: "member_card_not_configured" });
  let url;
  try { url = new URL(base); } catch { return reply(res, 503, { error: "member_card_not_configured" }); }
  if (url.protocol !== "https:") return reply(res, 503, { error: "member_card_not_configured" });
  try {
    const upstream = await fetch(new URL("/member-card/login", url), {
      method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ memberCode, phone }), cache: "no-store", signal: AbortSignal.timeout(8000)
    });
    if (upstream.status === 401 || upstream.status === 404) return reply(res, 401, { error: "invalid_credentials" });
    if (!upstream.ok) { console.error("Member-card provider returned status", upstream.status); return reply(res, 503, { error: "member_card_unavailable" }); }
    const raw = await upstream.json();
    const m = raw?.member, s = raw?.subscription, v = raw?.visits;
    if (!m || !s || !v || typeof m.fullName !== "string" || typeof m.memberCode !== "string") return reply(res, 503, { error: "invalid_provider_response" });
    const numeric = n => Number.isFinite(Number(n)) && Number(n) >= 0 ? Math.floor(Number(n)) : null;
    if ([numeric(v.total), numeric(v.used), numeric(v.remaining)].some(n => n === null)) return reply(res, 503, { error: "invalid_provider_response" });
    return reply(res, 200, {
      member: { fullName: m.fullName.slice(0,120), memberCode: m.memberCode.slice(0,40), barcodeValue: typeof m.barcodeValue === "string" ? m.barcodeValue.slice(0,80) : m.memberCode.slice(0,40) },
      subscription: { planName: typeof s.planName === "string" ? s.planName.slice(0,80) : "", endDate: typeof s.endDate === "string" ? s.endDate.slice(0,10) : "", status: ["active","expired","future"].includes(s.status) ? s.status : "unknown" },
      visits: { total: numeric(v.total), used: numeric(v.used), remaining: numeric(v.remaining) }
    });
  } catch (e) { console.error("Member-card service unavailable:", e.name); return reply(res, 503, { error: "member_card_unavailable" }); }
}
