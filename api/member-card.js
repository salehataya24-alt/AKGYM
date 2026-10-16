
const noStore = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store, max-age=0",
  "X-Content-Type-Options": "nosniff"
};

export default async function handler(req, res) {
  for (const [key, value] of Object.entries(noStore)) {
    res.setHeader(key, value);
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      error: "method_not_allowed"
    });
  }

  const baseUrl = process.env.MEMBER_SYNC_API_URL;
  const token = process.env.MEMBER_SYNC_API_TOKEN;

  if (!baseUrl || !token) {
    console.error("Member card: Railway environment variables missing");
    return res.status(503).json({
      error: "member_card_not_configured"
    });
  }

  try {
    const url = `${baseUrl.replace(/\/+$/, "")}/member-card/login`;

    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(req.body || {}),
      cache: "no-store",
      signal: AbortSignal.timeout(15000)
    });

    const text = await upstream.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: "invalid_server_response" };
    }

    return res.status(upstream.status).json(data);
  } catch (error) {
    console.error("Member card Railway request failed:", error.message);

    return res.status(503).json({
      error: "member_card_unavailable"
    });
  }
}
