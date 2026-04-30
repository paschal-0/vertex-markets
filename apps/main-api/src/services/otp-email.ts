type OtpEmailPurpose = "signup" | "login" | "reset_password";

export interface OtpEmailConfig {
  apiKey?: string;
  fromEmail: string;
  brandName: string;
  isProduction: boolean;
}

interface SendOtpEmailInput {
  to: string;
  code: string;
  purpose: OtpEmailPurpose;
  expiresInSeconds: number;
}

function buildPurposeLabel(purpose: OtpEmailPurpose): string {
  switch (purpose) {
    case "signup":
      return "Sign Up Verification";
    case "login":
      return "Login Verification";
    case "reset_password":
      return "Password Reset";
    default:
      return "Verification";
  }
}

function buildEmailContent(
  brandName: string,
  purpose: OtpEmailPurpose,
  code: string,
  expiresInSeconds: number
): { subject: string; text: string; html: string } {
  const minutes = Math.max(1, Math.floor(expiresInSeconds / 60));
  const purposeLabel = buildPurposeLabel(purpose);
  const subject = `${brandName} ${purposeLabel} Code`;

  const text = [
    `${brandName} ${purposeLabel}`,
    "",
    `Your one-time code is: ${code}`,
    `This code expires in ${minutes} minute(s).`,
    "",
    "If you did not request this, you can ignore this email."
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111827;">
      <h2 style="margin:0 0 12px 0;">${brandName} ${purposeLabel}</h2>
      <p style="margin:0 0 12px 0;">Use this one-time code to continue:</p>
      <div style="font-size:32px;letter-spacing:6px;font-weight:700;margin:12px 0 16px 0;">${code}</div>
      <p style="margin:0 0 12px 0;">This code expires in <strong>${minutes} minute(s)</strong>.</p>
      <p style="margin:0;color:#6b7280;">If you did not request this, you can ignore this email.</p>
    </div>
  `;

  return { subject, text, html };
}

export async function sendOtpEmail(config: OtpEmailConfig, input: SendOtpEmailInput): Promise<void> {
  if (!config.apiKey) {
    if (config.isProduction) {
      throw new Error("RESEND_API_KEY is missing.");
    }
    console.warn("[otp-email] RESEND_API_KEY missing; skipping email send in non-production mode.");
    return;
  }

  const content = buildEmailContent(config.brandName, input.purpose, input.code, input.expiresInSeconds);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: config.fromEmail,
      to: [input.to],
      subject: content.subject,
      text: content.text,
      html: content.html
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend failed (${response.status}): ${body}`);
  }
}
