import { Resend } from "resend";

/**
 * Email service for sending magic link emails
 * Supports Gmail, SMTP, or console logging for development
 */

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev"; // Use your verified domain

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export async function sendMagicLinkEmail(email: string, token: string) {
  const magicLink = `${FRONTEND_URL}/auth/verify/${token}`;

  // Always log to console for development visibility
  console.log("\n📧 ====================================");
  console.log("MAGIC LINK EMAIL (Development/Console)");
  console.log("====================================");
  console.log(`To: ${email}`);
  console.log(`Subject: Sign in to BlueBloods NIL`);
  console.log("\nClick the link below to sign in:");
  console.log(magicLink);
  console.log("\nThis link will expire in 15 minutes.");
  console.log("====================================\n");

  // If Resend is configured, send real email
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: "Sign in to BlueBloods NIL",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .button { 
                  display: inline-block; 
                  padding: 12px 24px; 
                  background-color: #007ACC; 
                  color: white; 
                  text-decoration: none; 
                  border-radius: 6px;
                  margin: 20px 0;
                }
                .footer { margin-top: 30px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <h2>Sign in to BlueBloods NIL</h2>
                <p>Click the button below to sign in to your account:</p>
                <a href="${magicLink}" class="button">Sign In</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #007ACC;">${magicLink}</p>
                <p><strong>This link will expire in 15 minutes.</strong></p>
                <p>If you didn't request this email, you can safely ignore it.</p>
                <div class="footer">
                  <p>BlueBloods NIL Exchange</p>
                  <p>Bombers Collective</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `
          Sign in to BlueBloods NIL

          Click the link below to sign in to your account:
          ${magicLink}

          This link will expire in 15 minutes.

          If you didn't request this email, you can safely ignore it.

          BlueBloods NIL Exchange
          Bombers Collective
        `,
      });

      if (error) {
        console.error("❌ Resend error:", error);
        throw error;
      }

      console.log(
        `✅ Magic link email sent via Resend to ${email} (ID: ${data?.id})`
      );
    } catch (error) {
      console.error("❌ Failed to send email via Resend:", error);
      console.log(
        "💡 Email was logged to console above - copy the link to test."
      );
    }
  } else {
    console.log(
      "💡 To enable real email sending, set RESEND_API_KEY in your .env file"
    );
    console.log("   Get your API key at: https://resend.com/api-keys\n");
  }

  return { success: true };
}
