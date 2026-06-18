const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API);

async function sendCredentials(name, email, password) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Login Credentials – Softrate Hire Pro</title>
    </head>
    <body style="margin:0;padding:0;background:#F5F9FF;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F9FF;padding:40px 0;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(71,143,229,0.10);">
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#478FE5 0%,#2F6FC5 100%);padding:36px 40px;text-align:center;">
                <div style="font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Softrate Hire Pro</div>
                <div style="color:#c7deff;font-size:14px;margin-top:6px;">Online Assessment Platform</div>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:40px;">
                <p style="font-size:18px;font-weight:600;color:#1F2937;margin:0 0 8px;">Hello, ${name} 👋</p>
                <p style="font-size:14px;color:#475569;line-height:1.7;margin:0 0 28px;">
                  You have been registered for the <strong>Softrate Hire Pro</strong> assessment platform.
                  Your login credentials are below — please keep them safe.
                </p>

                <!-- Credentials Box -->
                <div style="background:#F5F9FF;border:1px solid #dbeafe;border-radius:12px;padding:24px;margin-bottom:28px;">
                  <div style="margin-bottom:16px;">
                    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#94A3B8;margin-bottom:4px;">Email</div>
                    <div style="font-size:15px;font-weight:600;color:#1F2937;">${email}</div>
                  </div>
                  <div>
                    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#94A3B8;margin-bottom:4px;">Password</div>
                    <div style="font-size:18px;font-weight:700;color:#478FE5;letter-spacing:2px;font-family:monospace;">${password}</div>
                  </div>
                </div>

                <p style="font-size:13px;color:#475569;margin:0 0 24px;">
                  Please log in and change your password as soon as possible. Do not share these credentials with anyone.
                </p>

                <!-- CTA Button -->
                <div style="text-align:center;margin-bottom:28px;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:4200'}/login"
                     style="display:inline-block;background:linear-gradient(135deg,#478FE5,#2F6FC5);color:white;font-weight:600;font-size:14px;padding:14px 36px;border-radius:10px;text-decoration:none;">
                    Log In to Portal →
                  </a>
                </div>

                <p style="font-size:12px;color:#94A3B8;text-align:center;margin:0;">
                  If you did not register for Softrate Hire Pro, please ignore this email.
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background:#f8fafc;border-top:1px solid #E2E8F0;padding:20px 40px;text-align:center;">
                <p style="font-size:12px;color:#94A3B8;margin:0;">
                  © ${new Date().getFullYear()} Softrate Technologies. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: 'Softrate Hire Pro <noreply@softrateglobal.com>',
      to: email,
      subject: '🎓 Your Softrate Hire Pro Login Credentials',
      html
    });
    console.log('Email sent:', result);
    return result;
  } catch (err) {
    console.error('Email send failed:', err);
    throw err;
  }
}

module.exports = { sendCredentials };
