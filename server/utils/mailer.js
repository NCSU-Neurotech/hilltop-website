const nodemailer = require('nodemailer')

// SMTP is optional. Without it configured, password-reset links are logged
// to the server console instead of emailed — keeps local dev and any
// not-yet-configured deployment functional without a real mail provider.
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env

let transporter = null
if (SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  })
}

async function sendMail({ to, subject, text, html }) {
  if (!transporter) {
    console.warn(`[mailer] SMTP not configured — would have sent "${subject}" to ${to}:\n${text}`)
    return
  }

  await transporter.sendMail({
    from: EMAIL_FROM || SMTP_USER,
    to,
    subject,
    text,
    html,
  })
}

module.exports = { sendMail }
