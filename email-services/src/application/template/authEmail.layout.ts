export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
}

interface AuthEmailLayoutProps {
  title: string;
  preview: string;
  userName: string;
  description: string;
  content: string;
  notice: string;
}

export function authEmailLayout({ title, preview, userName, description, content, notice }: AuthEmailLayoutProps): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    @media only screen and (max-width: 560px) {
      .email-outer { padding: 24px 12px !important; }
      .email-section { padding: 24px !important; }
      .email-title { font-size: 24px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;color:#1e293b;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
  <div style="display:none;font-size:1px;color:#f8fafc;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(preview)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#f8fafc" style="border-collapse:collapse;">
    <tr><td class="email-outer" align="center" style="padding:40px 16px;">
      <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="width:100%;max-width:520px;border-collapse:collapse;">
        <tr><td align="center" style="padding:0 0 24px;color:#475569;font-size:12px;font-weight:bold;letter-spacing:2px;">
          <span style="color:#6d57fc;">&#9679;</span>&nbsp; TASK MANAGEMENT
        </td></tr>
        <tr><td style="background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr><td class="email-section" style="padding:32px 40px;border-top:3px solid #6d57fc;border-bottom:1px solid #e2e8f0;">
              <p style="margin:0 0 16px;color:#6d57fc;font-size:11px;font-weight:bold;letter-spacing:2px;">BẢO MẬT TÀI KHOẢN</p>
              <h1 class="email-title" style="margin:0 0 12px;color:#0f172a;font-size:26px;line-height:1.3;">${escapeHtml(title)}</h1>
              <p style="margin:0;color:#475569;font-size:14px;line-height:1.8;">Xin chào <strong style="color:#0f172a;">${escapeHtml(userName)}</strong>, ${escapeHtml(description)}</p>
            </td></tr>
            <tr><td class="email-section" style="padding:32px 40px;">
              ${content}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;margin-top:24px;">
                <tr><td style="padding:16px;background-color:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;color:#475569;font-size:13px;line-height:1.7;">${notice}</td></tr>
              </table>
            </td></tr>
            <tr><td class="email-section" align="center" style="padding:24px 40px;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;line-height:1.8;">
              Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email.<br />
              Đây là email tự động, vui lòng không trả lời.
            </td></tr>
          </table>
        </td></tr>
        <tr><td align="center" style="padding-top:24px;color:#64748b;font-size:11px;line-height:1.7;">© ${new Date().getFullYear()} Task Management · Bảo mật tài khoản của bạn</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
