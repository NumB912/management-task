import { authEmailLayout, escapeHtml } from './authEmail.layout.js';

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
  const baseUrl = (process.env.APP_URL || process.env.FRONT_END_URL || '').replace(/\/+$/, '');
  const url = escapeHtml(`${baseUrl}/auth/reset-password/${encodeURIComponent(resetLink)}`);

  return authEmailLayout({
    title: 'Đặt lại mật khẩu',
    preview: `Yêu cầu đặt lại mật khẩu của bạn có hiệu lực trong ${expiresInMinutes} phút.`,
    userName,
    description: 'chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn vào nút bên dưới để tiếp tục.',
    content: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;">
        <tr><td align="center" bgcolor="#7c3aed" style="border-radius:8px;mso-padding-alt:16px 24px;">
          <a href="${url}" style="display:block;padding:16px 24px;border:1px solid #7c3aed;border-radius:8px;color:#ffffff;font-size:14px;font-weight:bold;line-height:20px;text-align:center;text-decoration:none;">Đặt lại mật khẩu &rarr;</a>
        </td></tr>
      </table>
      <p style="margin:24px 0 12px;color:#64748b;font-size:12px;line-height:1.7;">Nếu nút không hoạt động, sao chép và dán đường dẫn sau vào trình duyệt:</p>
      <div style="padding:16px;background-color:#faf7ff;border:1px solid #ede5ff;border-radius:8px;">
        <a href="${url}" style="color:#7c3aed;font-family:Consolas,'Courier New',monospace;font-size:12px;line-height:1.8;text-decoration:underline;word-break:break-all;overflow-wrap:anywhere;">${url}</a>
      </div>`,
    notice: `Liên kết có hiệu lực trong <strong style="color:#7c3aed;">${expiresInMinutes} phút</strong>. Không chia sẻ liên kết này với bất kỳ ai.`,
  });
}
