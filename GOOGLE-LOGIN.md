# Đăng nhập bằng Google

## Cấu hình

1. Trong Google Cloud Console, cấu hình OAuth consent screen (Google Auth Platform), rồi tạo OAuth Client ID loại **Web application**. Khi ứng dụng còn Testing, thêm email thử nghiệm vào Test users.
2. Thêm Authorized redirect URI chính xác: `http://localhost:3010/api/v1/auth/google/callback`.
3. Đặt các biến sau ở **backend**, không đưa client secret vào frontend hoặc Git:

```dotenv
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3010/api/v1/auth/google/callback
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

4. Frontend dùng `NEXT_PUBLIC_API_URL=http://localhost:3010/api/v1` như đăng nhập email. Khởi động lại backend/frontend và bấm **Tiếp tục với Google** tại `/auth/login`.

Production: thay callback bằng URL HTTPS của backend và đăng ký URL đó ở Google; APP_URL là một URL frontend duy nhất. FRONTEND_URL là danh sách origin CORS được phép. Credentials lưu tại hosting/secret manager, không nằm trong Docker image.

Cookie đăng nhập hiện dùng HttpOnly, SameSite=Lax, Secure khi production. Nên triển khai frontend/backend cùng site (ví dụ app.example.com và api.example.com) hoặc qua reverse proxy cùng origin. Hai tên miền khác site như vercel.app và onrender.com cần cấu hình cookie/cross-site auth riêng; luồng này không tự thay đổi chính sách cookie của ứng dụng.

## Hành vi

- Backend thực hiện authorization-code flow, kiểm tra state có chữ ký và hạn 10 phút, dùng PKCE, lấy thông tin trực tiếp từ Google qua HTTPS, yêu cầu email_verified=true.
- Google `sub` được lưu dưới `googleId` có unique sparse index; cần bảo đảm index được tạo khi production tắt autoIndex. Người dùng cũ không cần backfill.
- Người dùng Google mới được tạo cùng Inbox trong transaction đăng ký hiện tại. Mật khẩu ngẫu nhiên được hash và không cung cấp cho người dùng.
- Nếu email đã có tài khoản khác (không phân biệt hoa thường), từ chối tự liên kết và hướng dẫn đăng nhập mật khẩu. Người dùng có thể mở Profile và chủ động bấm **Liên kết với Google**.
- Profile trả về `googleLinked` và hiển thị trạng thái liên kết. `POST /api/v1/auth/google/link` yêu cầu cookie đăng nhập và JSON, trả URL Google. Callback dùng chung URL đã cấu hình, ràng buộc với phiên đã bắt đầu liên kết và yêu cầu email Google trùng email hồ sơ. Liên kết chỉ cập nhật googleId, không tạo user/Inbox hay thay token; không ghi đè liên kết cũ. Sau đó có thể đăng nhập cùng tài khoản bằng Google hoặc mật khẩu đã có.
- Thành công: cấp access/refresh cookie và cache refresh token theo cơ chế hiện tại, chuyển đến dashboard. Không đưa token ứng dụng vào URL.
- Hủy/thất bại: về trang login và hiển thị thông báo; không trả lỗi chi tiết hoặc token của Google về trình duyệt.

## Kiểm tra thủ công sau khi có credentials

- Đăng nhập lần đầu: một user, một Inbox; lần sau dùng lại user đó.
- Hủy màn hình Google hoặc thay đổi state: không tạo phiên đăng nhập.
- Dùng email đã đăng ký mật khẩu: không tạo tài khoản trùng, hiển thị thông báo.
- Kiểm tra tải profile/dashboard, refresh và logout bằng cookie.

Tài liệu Google: https://developers.google.com/identity/openid-connect/openid-connect
