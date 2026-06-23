# Resend API Key Tester

A simple, secure web tool to check whether a **[Resend](https://resend.com)** API key can send
email, and to show you exactly why it can't. Paste a key, send a real test email, and get an instant
pop-up telling you whether the key works or what went wrong.

🔗 **Live:** https://resend-api-tester.vercel.app

> Nothing to install. Open the link, paste your key, and test.

---

## What it does

1. You paste **your own** Resend API key.
2. You fill in From, To, Subject, and Message.
3. You click **Send test email**.
4. A pop-up shows the result:
   - ✅ **Email sent!** The key is valid and the message was delivered (with the email ID).
   - ❌ **Could not send.** The exact reason, straight from Resend.

The email arrives as a clean, branded HTML template.

## Why it's useful

When a Resend integration fails, it's often unclear whether the problem is the API key, the sending
domain, or the code. This tool isolates that in seconds: if it sends here with your key, the key is
fine and the issue is in your app. The most common failure is a **403** because the **From** address
uses a domain that isn't verified in Resend.

## Error reference

| Result | Meaning |
|--------|---------|
| ✅ Sent | Key is valid and the From domain is verified. |
| ❌ Invalid key (401) | Wrong, revoked, or mistyped key. |
| ❌ Domain not verified (403) | The From domain isn't verified in Resend. Use an address on a verified domain. |
| ❌ Invalid From (422) | From isn't a valid `email@domain.com` or `Name <email@domain.com>`. |

## Privacy

Your API key is **never stored**. It is used once to talk to Resend for that single request, then
discarded. Nothing is saved, logged, or cached.

---

Developed with love by **[Hutech ICT Resources](https://hutytechict.com/)**.
