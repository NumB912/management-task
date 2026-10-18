import { authEmailLayout, escapeHtml } from './authEmail.layout.js';
export interface InviteTemplateParams {
  name: string; ownerName: string; listName: string; inviteLink: string; expiresInDays?: number;
}
export const inviteTemplate = (p: InviteTemplateParams): string => {
  const url = new URL(p.inviteLink);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Invalid invitation URL');
  const link = escapeHtml(url.toString());
  return authEmailLayout({
    title: 'Lời mời tham gia danh sách',
    category: 'CỘNG TÁC CÙNG NHAU',
    preview: p.ownerName + ' mời bạn tham gia ' + p.listName,
    userName: p.name,
    description: p.ownerName + ' đã mời bạn cùng xem và chỉnh sửa danh sách ' + p.listName + '.',
    content: '<div style="padding:24px;background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;text-align:center;color:#2e1065;font-size:20px;font-weight:bold;word-break:break-word;">' + escapeHtml(p.listName) + '</div>' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;"><tr><td align="center" bgcolor="#7c3aed" style="border-radius:8px;mso-padding-alt:16px 24px;"><a href="' + link + '" style="display:block;padding:16px 24px;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;">Chấp nhận lời mời &rarr;</a></td></tr></table>' +
      '<p style="margin:24px 0 12px;color:#655879;font-size:12px;line-height:1.7;">Nếu nút không hoạt động, sao chép liên kết sau vào trình duyệt:</p><a href="' + link + '" style="color:#7c3aed;font-size:12px;word-break:break-all;">' + link + '</a>',
    notice: p.expiresInDays ? 'Lời mời có hiệu lực trong <strong style="color:#7c3aed;">' + escapeHtml(String(p.expiresInDays)) + ' ngày</strong>. Chỉ chấp nhận khi bạn biết người gửi.' : 'Chỉ chấp nhận lời mời khi bạn biết người gửi.',
  });
};
