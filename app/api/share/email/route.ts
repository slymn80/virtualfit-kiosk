import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, email, shareUrl } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (!shareUrl) {
      return NextResponse.json({ error: "Missing share URL" }, { status: 400 });
    }

    // Log the share attempt
    await db.shareLog.create({
      data: {
        sessionId: sessionId ?? "temp",
        shareMethod: "EMAIL",
        recipient: email,
        shareUrl,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    }).catch(() => {});

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[Share] RESEND_API_KEY not set — email not sent");
      return NextResponse.json({ sent: false, reason: "Email service not configured" }, { status: 503 });
    }

    const resend = new Resend(apiKey);
    const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

    const { error } = await resend.emails.send({
      from,
      to: email,
      subject: "Your virtual try-on looks are ready!",
      html: buildEmailHtml(shareUrl),
    });

    if (error) {
      console.error("[Share] Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    console.log(`[Share] Email sent to: ${email}`);
    return NextResponse.json({ sent: true });

  } catch (err) {
    console.error("[Share] Email error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

function buildEmailHtml(shareUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your virtual try-on looks</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 24px;">
        <table width="100%" style="max-width:480px;">

          <!-- Logo / Brand -->
          <tr>
            <td align="center" style="padding-bottom:40px;">
              <div style="display:inline-block;width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);text-align:center;line-height:48px;">
                <span style="color:white;font-size:20px;font-weight:300;">✦</span>
              </div>
              <p style="margin:12px 0 0;color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:0.25em;text-transform:uppercase;">VirtualFit</p>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td align="center" style="padding-bottom:12px;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:200;letter-spacing:0.08em;">Your looks are ready</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:40px;">
              <p style="margin:0;color:rgba(255,255,255,0.4);font-size:15px;font-weight:300;line-height:1.6;">
                Click the button below to view and save your virtual try-on photos.
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding-bottom:40px;">
              <a href="${shareUrl}"
                 style="display:inline-block;background:#ffffff;color:#000000;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:0.05em;padding:16px 48px;border-radius:12px;">
                View My Looks
              </a>
            </td>
          </tr>

          <!-- Link fallback -->
          <tr>
            <td align="center" style="padding-bottom:48px;">
              <p style="margin:0 0 8px;color:rgba(255,255,255,0.2);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">Or copy this link</p>
              <p style="margin:0;color:rgba(255,255,255,0.3);font-size:12px;word-break:break-all;">${shareUrl}</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center">
              <p style="margin:0;color:rgba(255,255,255,0.15);font-size:11px;line-height:1.8;">
                This link expires in 24 hours.<br/>
                You received this because you used a VirtualFit kiosk.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
