# TODO: Product Variant Creation

## Status: 🔄 PLANNING

**API**: POST `/shopclothes/api/v1/product-variants`
**Body**: 
```json
{
  "product_id": 5,
  "color_id": 6, 
  "size_id": 2,
  "sku": "auto-generate",
  "stock_quantity": 10
}
```

**Current state**: AdminVariants.jsx has form with product/color/size/stock. Missing SKU.

**Plan**: APPROVED

**Breakdown**:
- [x] 0. Create TODO
- [x] 1. Add SKU input + auto-generate logic to AdminVariants.jsx form  
- [x] 2. Update handleAddOrUpdate to include sku + status: 'ACTIVE'
- [ ] 3. Test & complete

✅ SKU auto-generates: `{product.slug}-{color.name}-{size.name}` (slugified)
✅ POST body: 5 fields + status: 'ACTIVE'

Test Admin > Variants → Thêm biến thể → Fill form → Submit → Check Network

