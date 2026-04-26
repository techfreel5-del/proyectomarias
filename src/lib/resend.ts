// Email client — uses Resend if API key is set, otherwise logs to console (dev mode)

let ResendClass: typeof import('resend').Resend | null = null;

async function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  try {
    const { Resend } = await import('resend');
    ResendClass = Resend;
    return new Resend(process.env.RESEND_API_KEY);
  } catch {
    return null;
  }
}

export const FROM_EMAIL = 'noreply@mariasclub.com';

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const client = await getResend();
  if (!client) {
    console.log('[EMAIL SIMULADO]', {
      to: payload.to,
      subject: payload.subject,
      preview: payload.html.replace(/<[^>]*>/g, '').slice(0, 200),
    });
    return;
  }
  await client.emails.send({
    from: FROM_EMAIL,
    to: Array.isArray(payload.to) ? payload.to : [payload.to],
    subject: payload.subject,
    html: payload.html,
  });
}
