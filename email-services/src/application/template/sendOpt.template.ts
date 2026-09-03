export interface OtpTemplateProps {
  userName: string;
  otp: string;
  expiresInMinutes?: number;
}

export function otpTemplate({
  userName,
  otp,
  expiresInMinutes = 5,
}: OtpTemplateProps): string {
  const digits = otp.split("");
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Mã OTP</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background-color: #0d0d0f;
      font-family: 'DM Sans', sans-serif;
      color: #e8e8ed;
      padding: 40px 16px;
    }

    .wrapper { max-width: 520px; margin: 0 auto; }

    .header { text-align: center; margin-bottom: 32px; }
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-family: 'DM Mono', monospace;
      font-size: 13px;
      font-weight: 500;
      color: #6b6b78;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .logo-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #47e8c8;
    }

    .card {
      background: #18181c;
      border: 1px solid #2a2a32;
      border-radius: 16px;
      overflow: hidden;
    }

    .card-top {
      background: linear-gradient(135deg, #161620 0%, #12121a 100%);
      padding: 40px 40px 32px;
      border-bottom: 1px solid #2a2a32;
      position: relative;
      overflow: hidden;
    }
    .card-top::before {
      content: '';
      position: absolute;
      top: -80px; right: -80px;
      width: 200px; height: 200px;
      background: radial-gradient(circle, rgba(71,232,200,0.07) 0%, transparent 70%);
    }

    .icon-wrap {
      width: 52px; height: 52px;
      background: rgba(71,232,200,0.08);
      border: 1px solid rgba(71,232,200,0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      font-size: 22px;
    }

    .card-top h1 {
      font-size: 22px;
      font-weight: 600;
      color: #f0f0f5;
      margin-bottom: 10px;
    }
    .card-top p {
      font-size: 14px;
      color: #7a7a88;
      line-height: 1.6;
    }
    .card-top p strong { color: #b0b0c0; font-weight: 500; }

    /* OTP Digits */
    .card-body { padding: 36px 40px; }

    .otp-label {
      font-family: 'DM Mono', monospace;
      font-size: 11px;
      color: #4a4a58;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      text-align: center;
      margin-bottom: 16px;
    }

    .otp-wrap {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-bottom: 12px;
    }

    .otp-digit {
      width: 56px; height: 64px;
      background: #0d0d0f;
      border: 1px solid #2e2e3a;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'DM Mono', monospace;
      font-size: 28px;
      font-weight: 700;
      color: #47e8c8;
      letter-spacing: 0;
    }

    .otp-sep {
      display: flex;
      align-items: center;
      color: #2e2e3a;
      font-size: 20px;
      font-family: 'DM Mono', monospace;
      padding-bottom: 4px;
    }

    .otp-hint {
      text-align: center;
      font-size: 12px;
      color: #3a3a48;
      font-family: 'DM Mono', monospace;
      margin-bottom: 28px;
    }

    /* Timer notice */
    .notice {
      background: rgba(71,232,200,0.04);
      border: 1px solid rgba(71,232,200,0.1);
      border-radius: 8px;
      padding: 14px 16px;
      display: flex;
      gap: 10px;
      align-items: flex-start;
    }
    .notice-icon { font-size: 14px; line-height: 1.5; flex-shrink: 0; }
    .notice p { font-size: 13px; color: #7a8a80; line-height: 1.5; }
    .notice p strong { color: #47c8a8; font-weight: 600; }

    /* Footer */
    .footer {
      padding: 22px 40px;
      border-top: 1px solid #2a2a32;
    }
    .footer p {
      font-size: 12px;
      color: #3a3a48;
      line-height: 1.7;
      text-align: center;
    }

    .bottom { text-align: center; margin-top: 28px; }
    .bottom p {
      font-size: 11px;
      color: #2e2e3a;
      font-family: 'DM Mono', monospace;
    }
  </style>
</head>
<body>
<div class="wrapper">

  <div class="card">
    <div class="card-top">
      <div class="icon-wrap">🔐</div>
      <h1>Mã xác thực OTP</h1>
      <p>
        Xin chào <strong>${userName}</strong>, đây là mã OTP để xác thực tài khoản của bạn.
        Không chia sẻ mã này với bất kỳ ai.
      </p>
    </div>

    <div class="card-body">
      <p class="otp-label">mã xác thực của bạn</p>

      <div class="otp-wrap">
        ${digits.slice(0, 3).map(d => `<div class="otp-digit">${d}</div>`).join("")}
        <div class="otp-sep">·</div>
        ${digits.slice(3).map(d => `<div class="otp-digit">${d}</div>`).join("")}
      </div>

      <p class="otp-hint">copy &amp; paste: ${otp}</p>

      <div class="notice">
        <span class="notice-icon">⏱</span>
        <p>
          Mã OTP có hiệu lực trong <strong>${expiresInMinutes} phút</strong>.
          Nếu bạn không yêu cầu mã này, hãy bỏ qua email — tài khoản của bạn vẫn an toàn.
        </p>
      </div>
    </div>

    <div class="footer">
      <p>
        Bạn nhận email này vì đã đăng ký tại <a href="#" style="color:#5a5a70;text-decoration:none;">yourapp.com</a>.<br/>
        Không reply email này.
      </p>
    </div>
  </div>

  <div class="bottom">
    <p>© ${new Date().getFullYear()} Your App · Bảo mật tài khoản của bạn</p>
  </div>

</div>
</body>
</html>
  `.trim();
}