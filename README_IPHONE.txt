ZTECH ADMIN KEY APP — TÁCH RIÊNG

Đây chỉ là APP ADMIN TẠO KEY.
Không chứa index.html, landing.js, app.html, app.js hoặc mã của APP NGƯỜI DÙNG.

Đăng nhập mặc định:
Tài khoản: TIEN
Mật khẩu: TIENZTECH

Deploy riêng ZIP này thành một Netlify site riêng.
Mở /admin.html

Chức năng:
- Đăng nhập admin
- Danh sách key từ Firebase
- Ban đầu không có key thì hiển thị danh sách trống
- Tạo key mới
- Chọn tên key, số ngày và giới hạn thiết bị

Firebase:
https://aimlock-key-default-rtdb.firebaseio.com

Nếu Firebase yêu cầu xác thực khi ghi dữ liệu, đặt biến môi trường Netlify:
FIREBASE_DB_TOKEN

Bảo mật:
- Mật khẩu kiểm tra bằng scrypt
- Admin session ký HMAC
- Cookie HttpOnly + Secure + SameSite=Strict
- CSRF token cho thao tác tạo key
- Giới hạn đăng nhập sai
- Không có mã app người dùng trong gói này
