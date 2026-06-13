# Admin Ecommerce Refactor Progress

**Current Status:** Planning frontend fixes. Backend suggestions provided in completion.

**Frontend Steps:**
- [x] Step 1: Add useNavigate to AdminDashboard.jsx "Xem tất cả" button → /admin/orders
- [x] Step 2: Add getVariantsSearch to adminService.ts → /product-variants/search?product_id=&color_id=&size_id=
- [ ] Step 3: Refactor AdminVariants.jsx to search UI (filters product/color/size, no add form)
- [ ] Step 4: Test navigation, filters, ROLE_ADMIN guard (already in AppRoutes)

**Backend:** 
- Controller/Service/Repository for dynamic variant search (JPA Spec).
- Ready for implementation.

Approve plan to start Step 1?

