# NovaWear Store

NovaWear Store là website thương mại điện tử thời trang được xây dựng bằng React và Vite. Hệ thống cung cấp đầy đủ luồng mua sắm cho khách hàng, quản lý tài khoản, đơn hàng, thanh toán VNPay, hóa đơn điện tử và khu vực quản trị.

Frontend kết nối với REST API Spring Boot thông qua đường dẫn `/shopclothes/api/v1`.

## Tính năng chính

### Khách hàng

- Đăng ký, đăng nhập và xác thực bằng JWT.
- Xem sản phẩm theo phòng ban, danh mục và danh mục con.
- Tìm kiếm, lọc và xem chi tiết sản phẩm.
- Chọn màu sắc, kích thước và số lượng sản phẩm.
- Thêm sản phẩm vào giỏ hàng hoặc danh sách yêu thích.
- Cập nhật số lượng và xóa sản phẩm khỏi giỏ hàng.
- Đặt hàng với hai hình thức:
  - Thanh toán khi nhận hàng (COD).
  - Thanh toán trực tuyến qua VNPay.
- Tự động xóa giỏ hàng sau khi thanh toán thành công.
- Tra cứu trạng thái đơn hàng bằng mã đơn và số điện thoại.
- Xem lịch sử và chi tiết đơn hàng.
- Hủy đơn hàng khi đang ở trạng thái chờ xử lý.
- Xem và in hóa đơn theo điều kiện:
  - COD: đơn hàng đã hoàn thành.
  - Ví điện tử/VNPay: đơn hàng đã xác nhận hoặc hoàn thành.
- Đánh giá, xem, chỉnh sửa và xóa đánh giá sản phẩm đã mua.
- Quản lý thông tin tài khoản cá nhân.
- Xem blog, giới thiệu thương hiệu và sử dụng chatbot hỗ trợ.

### Quản trị viên

- Trang tổng quan quản trị.
- Quản lý sản phẩm và hình ảnh sản phẩm.
- Quản lý biến thể theo màu sắc và kích thước.
- Quản lý phòng ban, danh mục và danh mục con.
- Quản lý thuộc tính sản phẩm.
- Theo dõi, lọc và cập nhật trạng thái đơn hàng.
- Xem chi tiết đơn hàng.
- Xem và in hóa đơn bán hàng.
- Phân quyền truy cập khu vực quản trị.

## Công nghệ sử dụng

| Nhóm | Công nghệ |
| --- | --- |
| Giao diện | React 18, JSX, Tailwind CSS |
| Công cụ build | Vite 5 |
| Điều hướng | React Router DOM 6 |
| Quản lý trạng thái | React Context API |
| Gọi API | Fetch API, Axios |
| Thông báo | Sonner, React Hot Toast |
| Biểu tượng | Lucide React |
| Xác thực | JWT lưu trong Local Storage |
| Thanh toán | VNPay |
| Backend | Spring Boot REST API |

## Yêu cầu hệ thống

Trước khi chạy dự án, cần cài đặt:

- Node.js 18 trở lên.
- npm 9 trở lên.
- Backend NovaWear chạy tại `http://localhost:8080`.

## Cài đặt và chạy

### 1. Cài đặt thư viện

```bash
npm install
```

### 2. Khởi động backend

Backend cần hoạt động tại:

```text
http://localhost:8080
```

API gốc:

```text
http://localhost:8080/shopclothes/api/v1
```

### 3. Khởi động frontend

```bash
npm run dev
```

Mở trình duyệt tại:

```text
http://localhost:5177
```

Vite tự động proxy các request bắt đầu bằng `/shopclothes` sang backend tại cổng `8080`.

## Các câu lệnh

```bash
# Chạy môi trường phát triển
npm run dev

# Build phiên bản production
npm run build

# Xem thử bản production đã build
npm run preview
```

Thư mục kết quả sau khi build:

```text
dist/
```

## Cấu trúc dự án

```text
novawear-store/
├── public/
├── src/
│   ├── assets/                 # Hình ảnh tĩnh
│   ├── components/
│   │   ├── blog/               # Thành phần blog
│   │   ├── chat/               # Giao diện chatbot
│   │   ├── common/             # Thành phần dùng chung
│   │   ├── home/               # Thành phần trang chủ
│   │   ├── layout/             # Header, footer, menu
│   │   ├── order/              # Hóa đơn và đơn hàng
│   │   └── product/            # Thẻ và lưới sản phẩm
│   ├── context/
│   │   ├── AuthContext.jsx     # Trạng thái xác thực
│   │   └── ShopContext.jsx     # Giỏ hàng và yêu thích
│   ├── data/                   # Dữ liệu nội dung tĩnh
│   ├── hooks/                  # Custom React hooks
│   ├── layouts/                # Layout chính
│   ├── pages/
│   │   ├── account/            # Tài khoản và đơn hàng
│   │   ├── admin/              # Khu vực quản trị
│   │   ├── auth/               # Đăng nhập, đăng ký
│   │   ├── blog/               # Blog
│   │   ├── cart/               # Giỏ hàng, thanh toán
│   │   ├── payments/           # Callback thanh toán
│   │   └── static/             # Trang giới thiệu
│   ├── routes/                 # Khai báo route
│   ├── services/               # Giao tiếp REST API
│   ├── types/                  # Kiểu dữ liệu TypeScript
│   ├── utils/                  # Tiện ích, token và adapter
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## Các trang chính

| Đường dẫn | Chức năng |
| --- | --- |
| `/` | Trang chủ |
| `/products` | Danh sách sản phẩm |
| `/products/:id` | Chi tiết sản phẩm |
| `/search` | Tìm kiếm sản phẩm |
| `/wishlist` | Sản phẩm yêu thích |
| `/cart` | Giỏ hàng |
| `/checkout` | Thanh toán |
| `/payments/payment-callback` | Xử lý kết quả VNPay |
| `/account` | Hồ sơ và lịch sử mua hàng |
| `/order-tracking` | Tra cứu đơn hàng |
| `/blog` | Danh sách bài viết |
| `/about` | Giới thiệu NovaWear |
| `/admin` | Khu vực quản trị |

## Xác thực và phân quyền

Token đăng nhập được lưu với khóa:

```text
auth_token
```

Khu vực `/admin` chỉ cho phép tài khoản có quyền:

```text
ADMIN hoặc ROLE_ADMIN
```

Các request cần xác thực gửi token theo chuẩn:

```http
Authorization: Bearer <token>
```

## Trạng thái đơn hàng

Frontend hỗ trợ các trạng thái:

| Trạng thái | Ý nghĩa |
| --- | --- |
| `PENDING` | Chờ xác nhận |
| `CONFIRMED` | Đã xác nhận |
| `PROCESSING` | Đang xử lý |
| `SHIPPING` / `SHIPPED` | Đang giao hàng |
| `COMPLETED` / `DELIVERED` | Hoàn thành |
| `CANCELLED` | Đã hủy |

Khách hàng chỉ có thể hủy đơn khi đơn hàng đang ở trạng thái `PENDING`.

## API tiêu biểu

```text
GET    /shopclothes/api/v1/orders/user/{userId}
GET    /shopclothes/api/v1/orders/code-phone
DELETE /shopclothes/api/v1/orders/{id}
GET    /shopclothes/api/v1/order-details/orders/{orderId}
GET    /shopclothes/api/v1/invoices/order-code/{orderCode}
POST   /shopclothes/api/v1/reviews
PUT    /shopclothes/api/v1/reviews/{id}
DELETE /shopclothes/api/v1/reviews/{id}
```

Các service giao tiếp API được đặt tại `src/services`.

## Quy trình thanh toán VNPay

1. Khách hàng chọn thanh toán qua VNPay tại trang checkout.
2. Frontend tạo đơn hàng và chuyển đến cổng thanh toán.
3. VNPay chuyển người dùng về `/payments/payment-callback`.
4. Frontend kiểm tra kết quả thanh toán.
5. Khi giao dịch thành công, giỏ hàng được xóa và trạng thái đơn được cập nhật.

## Lưu ý phát triển

- Backend phải chạy trước khi sử dụng các chức năng cần API.
- Không đưa tài khoản, mật khẩu, token hoặc khóa bí mật VNPay vào mã nguồn frontend.
- Khi thay đổi địa chỉ backend, cập nhật `target` trong `vite.config.js`.
- Dữ liệu giỏ hàng, yêu thích và đăng nhập có sử dụng Local Storage.
- Sau khi chỉnh sửa nên chạy `npm run build` để kiểm tra lỗi production.

## Tác giả

Đồ án website bán quần áo NovaWear Store.
