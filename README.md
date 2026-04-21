# NovaWear Store

Website thương mại điện tử thời trang demo được xây dựng bằng ReactJS + Vite + Tailwind CSS. Dự án mô phỏng bố cục và trải nghiệm D2C hiện đại nhưng không sao chép thương hiệu, hình ảnh nhận diện, nội dung hay dữ liệu sản phẩm gốc từ bất kỳ website nào.

## Công nghệ

- ReactJS + Vite
- Tailwind CSS
- React Router DOM
- Context API
- Mock JSON data

## Cấu trúc thư mục

```bash
novawear-store/
├─ public/
├─ src/
│  ├─ components/
│  │  ├─ blog/
│  │  ├─ common/
│  │  ├─ home/
│  │  ├─ layout/
│  │  └─ product/
│  ├─ context/
│  ├─ data/
│  ├─ hooks/
│  ├─ layouts/
│  ├─ pages/
│  │  ├─ account/
│  │  ├─ auth/
│  │  ├─ blog/
│  │  ├─ cart/
│  │  └─ static/
│  ├─ routes/
│  ├─ utils/
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ index.css
├─ index.html
├─ package.json
├─ postcss.config.js
├─ tailwind.config.js
└─ vite.config.js
```

## Chức năng đã có

- Trang chủ với hero, danh mục, nhiều block sản phẩm, lợi ích thương hiệu, feedback, blog
- Header sticky, mega menu desktop, mobile drawer
- Trang danh sách sản phẩm với breadcrumb, banner, bộ lọc mẫu, sort, load more, skeleton
- Trang chi tiết sản phẩm với gallery, chọn màu, size, số lượng, thêm vào giỏ
- Trang blog, chi tiết blog, about, auth, cart, checkout, wishlist, account, order tracking, 404
- Context API cho cart, wishlist, recently viewed, search
- Mock data riêng cho products, categories, banners, navigation, blogs

## Cách chạy

```bash
npm install
npm run dev
```

Sau đó mở trình duyệt tại địa chỉ Vite hiển thị, thường là:

```bash
http://localhost:5173
```

## Gợi ý mở rộng

- Thay mock data bằng API Spring Boot
- Kết nối đăng nhập JWT
- Thêm filter hoạt động thật
- Thêm payment flow và order history thật
- Tách reusable modal, drawer, toast, pagination
- Tối ưu SEO, lazy loading, code splitting
