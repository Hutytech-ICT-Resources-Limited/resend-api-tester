// Vercel serverless function that calls the Resend API directly (no dependencies).
// The API key is supplied by the user on each request and is NEVER stored, logged,
// or cached. It is used once for this single call and then discarded.

// Escape user text so it cannot break or inject markup into the email template.
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// A simple, clean, brand-styled HTML email with a "Powered by" footer.
function buildEmailHtml(message, subject) {
  const safeBody = escapeHtml(message).replace(/\n/g, "<br>");
  const safeSubject = escapeHtml(subject);
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f5f7;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e1e8ed;border-radius:14px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
        <tr>
          <td style="background:#0931ce;padding:22px 32px;">
            <span style="color:#ffffff;font-size:17px;font-weight:bold;letter-spacing:.2px;">&#9993;&nbsp; ${safeSubject}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:30px 32px;color:#1a1a1a;font-size:15px;line-height:1.7;">
            ${safeBody}
          </td>
        </tr>
        <tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #e1e8ed;margin:0;"></td></tr>
        <tr>
          <td style="padding:20px 32px;text-align:center;">
            <p style="margin:0;color:#9aa0a6;font-size:12px;line-height:1.6;">
              Powered by
              <a href="https://hutytechict.com/" style="color:#0931ce;text-decoration:none;font-weight:bold;">Hutech ICT Resources</a>
            </p>
          </td>
        </tr>
      </table>
      <p style="color:#b0b6bd;font-size:11px;margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;">
        This is a test message sent via the Resend API.
      </p>
    </td></tr>
  </table>
</body>
</html>`;
}

module.exports = async (req, res) => {
  // Never allow this API response to be cached anywhere.
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: { message: "Method not allowed" } });
  }

  const { apiKey, from, to, subject, message } = req.body || {};

  if (!apiKey || !apiKey.trim()) {
    return res.status(400).json({
      ok: false,
      error: { message: "Please enter your Resend API key.", name: "missing_api_key" },
    });
  }

  if (!apiKey.trim().startsWith("re_")) {
    return res.status(400).json({
      ok: false,
      error: {
        message: "That doesn't look like a Resend API key. Resend keys start with 're_'.",
        name: "invalid_api_key_format",
      },
    });
  }

  if (!from || !to || !subject || !message) {
    return res.status(400).json({
      ok: false,
      error: { message: "Please fill in From, To, Subject and Message.", name: "missing_fields" },
    });
  }

  const recipients = String(to)
    .split(",")
    .map((addr) => addr.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    return res.status(400).json({
      ok: false,
      error: { message: "Please enter at least one valid recipient.", name: "missing_recipient" },
    });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject,
        html: buildEmailHtml(message, subject),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Resend returned an error (e.g. 401 bad key, 403 domain not verified)
      return res.status(200).json({ ok: false, error: data, sent: false });
    }

    return res.status(200).json({ ok: true, id: data && data.id, sent: true });
  } catch (err) {
    return res.status(200).json({
      ok: false,
      error: { message: (err && err.message) || "Unexpected error", name: err && err.name },
      sent: false,
    });
  }
};
