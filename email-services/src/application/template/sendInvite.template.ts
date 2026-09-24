export interface InviteTemplateParams {
  name: string; 
  ownerName: string;  
  listName: string;
  inviteLink: string;
  expiresInDays?: number;
}

const escapeHtml = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const safeUrl = (url: string) => {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:"
      ? escapeHtml(u.toString())
      : "#";
  } catch {
    return "#";
  }
};

export const inviteTemplate = (p: InviteTemplateParams): string => {
  const name = escapeHtml(p.name);
  const ownerName = escapeHtml(p.ownerName);
  const listName = escapeHtml(p.listName);
  const link = safeUrl(p.inviteLink);
  const initial = escapeHtml(p.ownerName.trim()[0]?.toUpperCase() ?? "?");

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Lời mời tham gia danh sách</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;">
  <!-- Preheader: dòng xem trước trong hộp thư -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    ${ownerName} mời bạn tham gia danh sách "${listName}"
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0"
               style="max-width:480px;width:100%;background:#ffffff;border-radius:12px;
                      font-family:Arial,Helvetica,sans-serif;color:#18181b;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding:32px 32px 8px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" width="56" height="56"
                      style="width:56px;height:56px;border-radius:28px;background:#18181b;
                             color:#ffffff;font-size:24px;font-weight:bold;">
                    ${initial}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Nội dung -->
          <tr>
            <td style="padding:16px 32px 0;text-align:center;">
              <h1 style="margin:0 0 12px;font-size:20px;line-height:28px;">
                Lời mời tham gia danh sách
              </h1>
              <p style="margin:0 0 8px;font-size:14px;line-height:22px;color:#52525b;">
                Xin chào <b style="color:#18181b;">${name}</b>,
              </p>
              <p style="margin:0;font-size:14px;line-height:22px;color:#52525b;">
                <b style="color:#18181b;">${ownerName}</b> đã mời bạn cùng xem và chỉnh sửa
                danh sách <b style="color:#18181b;">${listName}</b>.
              </p>
            </td>
          </tr>

          <!-- Nút -->
          <tr>
            <td align="center" style="padding:28px 32px 8px;">
              <a href="${link}" target="_blank"
                 style="display:inline-block;padding:12px 28px;background:#18181b;color:#ffffff;
                        font-size:14px;font-weight:bold;text-decoration:none;border-radius:8px;">
                Chấp nhận lời mời
              </a>
            </td>
          </tr>

          ${
            p.expiresInDays
              ? `<tr>
            <td align="center" style="padding:8px 32px 0;font-size:12px;color:#71717a;">
              Lời mời có hiệu lực trong ${p.expiresInDays} ngày.
            </td>
          </tr>`
              : ""
          }

          <!-- Link dự phòng -->
          <tr>
            <td style="padding:24px 32px 0;">
              <p style="margin:0;font-size:12px;line-height:18px;color:#71717a;">
                Nếu nút không hoạt động, hãy sao chép liên kết sau vào trình duyệt:
              </p>
              <p style="margin:4px 0 0;font-size:12px;line-height:18px;word-break:break-all;">
                <a href="${link}" style="color:#2563eb;">${link}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px 32px;">
              <hr style="border:none;border-top:1px solid #e4e4e7;margin:0 0 16px;" />
              <p style="margin:0;font-size:12px;line-height:18px;color:#a1a1aa;text-align:center;">
                Nếu bạn không biết người này hoặc không muốn tham gia, hãy bỏ qua email này.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};