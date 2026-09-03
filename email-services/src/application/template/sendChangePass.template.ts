export interface ResetPasswordTemplateProps {
  userName: string;
  resetLink: string;
  expiresInMinutes?: number;
}

export function resetPasswordTemplate({
  userName,
  resetLink,
  expiresInMinutes = 30,
}: ResetPasswordTemplateProps): string {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Đặt lại mật khẩu</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background-color: #0d0d0f;
      font-family: 'DM Sans', sans-serif;
      color: #e8e8ed;
      padding: 40px 16px;
    }

    .wrapper {
      max-width: 520px;
      margin: 0 auto;
    }

    /* Header */
    .header {
      text-align: center;
      margin-bottom: 32px;
    }
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
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #e8ff47;
    }

    /* Card */
    .card {
      background: #18181c;
      border: 1px solid #2a2a32;
      border-radius: 16px;
      overflow: hidden;
    }

    .card-top {
      background: linear-gradient(135deg, #1a1a22 0%, #14141a 100%);
      padding: 40px 40px 32px;
      border-bottom: 1px solid #2a2a32;
      position: relative;
    }

    .card-top::before {
      content: '';
      position: absolute;
      top: -60px;
      right: -60px;
      width: 180px;
      height: 180px;
      background: radial-gradient(circle, rgba(232,255,71,0.08) 0%, transparent 70%);
      pointer-events: none;
    }

    .icon-wrap {
      width: 52px;
      height: 52px;
      background: rgba(232,255,71,0.08);
      border: 1px solid rgba(232,255,71,0.2);
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
      line-height: 1.3;
      margin-bottom: 10px;
    }

    .card-top p {
      font-size: 14px;
      color: #7a7a88;
      line-height: 1.6;
    }

    .card-top p strong {
      color: #b0b0c0;
      font-weight: 500;
    }

    /* Body */
    .card-body {
      padding: 32px 40px;
    }

    .btn {
      display: block;
      background: #e8ff47;
      color: #0d0d0f;
      text-decoration: none;
      text-align: center;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.02em;
      padding: 14px 24px;
      border-radius: 10px;
      margin-bottom: 24px;
    }

    .divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }
    .divider-line {
      flex: 1;
      height: 1px;
      background: #2a2a32;
    }
    .divider-text {
      font-size: 11px;
      color: #4a4a58;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-family: 'DM Mono', monospace;
    }

    .link-box {
      background: #0d0d0f;
      border: 1px solid #2a2a32;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 28px;
    }
    .link-box p {
      font-size: 11px;
      color: #4a4a58;
      margin-bottom: 6px;
      font-family: 'DM Mono', monospace;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .link-box a {
      font-size: 12px;
      color: #7070e0;
      word-break: break-all;
      font-family: 'DM Mono', monospace;
      text-decoration: none;
    }

    /* Notice */
    .notice {
      background: rgba(232,255,71,0.04);
      border: 1px solid rgba(232,255,71,0.1);
      border-radius: 8px;
      padding: 14px 16px;
      display: flex;
      gap: 10px;
      align-items: flex-start;
      margin-bottom: 28px;
    }
    .notice-icon { font-size: 14px; line-height: 1.5; flex-shrink: 0; }
    .notice p {
      font-size: 13px;
      color: #8a8a70;
      line-height: 1.5;
    }
    .notice p strong {
      color: #b8c850;
      font-weight: 500;
    }

    /* Footer */
    .footer {
      padding: 24px 40px;
      border-top: 1px solid #2a2a32;
    }
    .footer p {
      font-size: 12px;
      color: #3a3a48;
      line-height: 1.7;
      text-align: center;
    }
    .footer a {
      color: #5a5a70;
      text-decoration: none;
    }

    /* Bottom */
    .bottom {
      text-align: center;
      margin-top: 28px;
    }
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
        <div class="icon-wrap">🔑</div>
        <h1>Đặt lại mật khẩu</h1>
        <p>
          Xin chào <strong>${userName}</strong>, chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
          Nhấn vào nút bên dưới để tiếp tục.
        </p>
      </div>

      <div class="card-body">
        <a href="${process.env.FRONT_END_URL}/change-password/${resetLink}" class="btn">
          Đặt lại mật khẩu →
        </a>

        <div class="divider">
          <div class="divider-line"></div>
          <span class="divider-text">hoặc dùng link</span>
          <div class="divider-line"></div>
        </div>

        <div class="link-box">
          <p>copy link</p>
          <a href="${process.env.FRONT_END_URL}/auth/reset-password/${resetLink}">${process.env.FRONT_END_URL}/auth/reset-password/${resetLink}</a>
        </div>

        <div class="notice">
          <span class="notice-icon">⚡</span>
          <p>
            Link sẽ hết hạn sau <strong>${expiresInMinutes} phút</strong>.
            Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này — tài khoản của bạn vẫn an toàn.
          </p>
        </div>
      </div>

      <div class="footer">
        <p>
          Gặp vấn đề với nút? <a href="${process.env.FRONT_END_URL}/auth/reset-password/${resetLink}">Nhấn vào đây</a>.<br/>
          Bạn nhận email này vì đã đăng ký tài khoản tại <a href="#">yourapp.com</a>.
        </p>
      </div>
    </div>

    <div class="bottom">
      <p>© ${new Date().getFullYear()} Your App · Không reply email này</p>
    </div>

  </div>
</body>
</html>
  `.trim();
}