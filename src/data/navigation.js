export const mainNav = [
  {
    label: 'Mới về',
    path: '/collections/new',
    featured: ['Áo thun mới', 'Bộ sưu tập hè', 'Phong cách công sở'],
  },
  {
    label: 'Nam',
    path: '/men',
    megaMenu: [
      { title: 'Trang phục', items: ['Áo thun', 'Áo polo', 'Áo sơ mi', 'Quần short', 'Quần dài', 'Đồ lót', 'Tất'] },
      { title: 'Phong cách', items: ['Tối giản', 'Daily wear', 'Workwear', 'Weekend set'] },
    ],
  },
  {
    label: 'Nữ',
    path: '/women',
    megaMenu: [
      { title: 'Trang phục', items: ['Áo thể thao', 'Quần legging', 'Áo croptop', 'Đồ mặc nhà'] },
      { title: 'Gợi ý', items: ['Yoga', 'Lifestyle', 'Travel', 'Office casual'] },
    ],
  },
  {
    label: 'Thể thao',
    path: '/sports',
    megaMenu: [
      { title: 'Bộ môn', items: ['Chạy bộ', 'Gym', 'Bóng đá', 'Cầu lông', 'Outdoor'] },
      { title: 'Công năng', items: ['Thoáng khí', 'Co giãn', 'Nhanh khô', 'Kháng khuẩn'] },
    ],
  },
  {
    label: 'Phụ kiện',
    path: '/accessories',
    megaMenu: [
      { title: 'Danh mục', items: ['Tất', 'Mũ', 'Túi', 'Đồ chăm sóc cá nhân'] },
      { title: 'Thiết yếu', items: ['Travel kit', 'Daily set', 'Seasonal picks'] },
    ],
  },
  { label: 'Sale', path: '/sale', featured: ['Giảm đến 40%', 'Deal cuối tuần', 'Combo tiết kiệm'] },
  { label: 'Bộ sưu tập', path: '/collections' },
  { label: 'Blog', path: '/blog' },
  { label: 'Về chúng tôi', path: '/about' },
];
