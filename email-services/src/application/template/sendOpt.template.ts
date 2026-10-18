import { authEmailLayout, escapeHtml } from './authEmail.layout.js';

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
  return authEmailLayout({
    title: 'Mã xác thực OTP',
    preview: `Mã xác thực tài khoản của bạn có hiệu lực trong ${expiresInMinutes} phút.`,
    userName,
    description: 'đây là mã OTP để xác thực tài khoản của bạn. Nhập mã bên dưới để tiếp tục.',
    content: `
      <p style="margin:0 0 16px;text-align:center;color:#64748b;font-size:11px;font-weight:bold;letter-spacing:2px;">MÃ XÁC THỰC CỦA BẠN</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;">
        <tr><td align="center" bgcolor="#faf7ff" style="padding:24px 12px;border:1px solid #ddd6fe;border-radius:8px;">
          <span style="color:#7c3aed;font-family:Consolas,'Courier New',monospace;font-size:32px;font-weight:bold;line-height:1.5;letter-spacing:6px;white-space:nowrap;">${escapeHtml(otp)}</span>
        </td></tr>
      </table>
      <p style="margin:16px 0 0;text-align:center;color:#64748b;font-size:12px;line-height:1.7;">Bạn có thể sao chép mã và dán vào ô xác thực.</p>`,
    notice: `Mã OTP có hiệu lực trong <strong style="color:#7c3aed;">${expiresInMinutes} phút</strong>. Không chia sẻ mã này với bất kỳ ai.`,
  });
}
