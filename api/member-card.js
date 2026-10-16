
const noStore = {
  "Cache-Control": "no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer"
};

function reply(res, status, body) {
  for (const [key, value] of Object.entries(noStore)) {
    res.setHeader(key, value);
  }
  return res.status(status).json(body);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return reply(res, 405, { error: "method_not_allowed" });
  }

  const memberCode =
    typeof req.body?.memberCode === "string"
      ? req.body.memberCode.trim().slice(0, 40)
      : typeof req.body?.member_no === "string"
        ? req.body.member_no.trim().slice(0, 40)
        : "";

  const phone =
    typeof req.body?.phone === "string"
      ? req.body.phone.trim().slice(0, 24)
      : "";

  const normalizedPhone = phone.replace(/[\s().-]/g, "");

  if (
    !memberCode ||
    !/^\+?[0-9]{7,20}$/.test(normalizedPhone)
  ) {
    return reply(res, 400, { error: "invalid_credentials" });
  }

  const apiUrl = process.env.MEMBER_SYNC_API_URL;
  const token = process.env.MEMBER_SYNC_API_TOKEN;

  if (!apiUrl || !token) {
    return reply(res, 503, {
      error: "member_card_not_configured"
    });
  }

  try {
    const response = await fetch(
      `${apiUrl.replace(/\/+$/, "")}/member-card/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          memberCode,
          phone: normalizedPhone
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000)
      }
    );

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      return reply(res, 401, {
        error: "invalid_credentials"
      });
    }

    if (!response.ok) {
      console.error("Member-card upstream failed:", response.status);
      return reply(res, 503, {
        error: "member_card_unavailable"
      });
    }

    return reply(res, 200, data);
  } catch (error) {
    console.error("Member-card request failed:", error.message);
    return reply(res, 503, {
      error: "member_card_unavailable"
    });
  }
}
