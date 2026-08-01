const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

async function sendPasswordResetEmail(toEmail, resetUrl) {
  await transporter.sendMail({
    from: `"CineMatch" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Reset your CineMatch password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #121214;">
        <h2 style="margin-bottom: 8px;">Reset your password</h2>
        <p style="color: #4a4a4a; line-height: 1.5;">
          Someone requested a password reset for your CineMatch account. If this was you, click the button below - this link expires in 15 minutes.
        </p>
        <a href="${resetUrl}" style="display: inline-block; margin: 16px 0; padding: 12px 24px; background: #E8A33D; color: #121214; font-weight: 600; text-decoration: none; border-radius: 8px;">
          Reset Password
        </a>
        <p style="color: #8a8a8a; font-size: 13px; line-height: 1.5;">
          If you didn't request this, you can safely ignore this email - your password won't be changed.
        </p>
      </div>
    `,
  });
}

module.exports = { sendPasswordResetEmail };