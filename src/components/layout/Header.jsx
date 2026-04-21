import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, Image, User, Menu, X, LogOut, ChevronDown, ShoppingBag } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useShop } from "../../context/ShopContext";
import { getDepartments } from "../../services/departmentService";
import { getMegaMenuByDepartmentId } from "../../services/menuService";
import { searchProductsByKeyword, searchProductsByImage } from "../../services/productService";

function Header() {
  const [departments, setDepartments] = useState([]);
  const [activeDepartment, setActiveDepartment] = useState(null);
  const [megaMenuData, setMegaMenuData] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingMegaMenu, setLoadingMegaMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [userOpen, setUserOpen] = useState(false);
  const { user, signOut, loading: authLoading } = useAuth();
  const { cartItems } = useShop();

  const megaMenuCache = useRef({});
  const closeTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await getDepartments();
        setDepartments(data);
      } catch (error) {
        console.error("Lỗi lấy departments:", error);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  const openMegaMenu = async (department) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    setActiveDepartment(department);

    if (megaMenuCache.current[department.id]) {
      setMegaMenuData(megaMenuCache.current[department.id]);
      return;
    }

    try {
      setLoadingMegaMenu(true);
      const data = await getMegaMenuByDepartmentId(department.id);
      megaMenuCache.current[department.id] = data;
      setMegaMenuData(data);
    } catch (error) {
      console.error("Lỗi mega menu:", error);
      setMegaMenuData([]);
    } finally {
      setLoadingMegaMenu(false);
    }
  };

  const scheduleCloseMegaMenu = () => {
    closeTimerRef.current = setTimeout(() => {
      setActiveDepartment(null);
      setMegaMenuData([]);
    }, 120);
  };

  const cancelCloseMegaMenu = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    try {
      const searchResults = await searchProductsByKeyword(keyword.trim());
      // Navigate to search page or show dropdown results
      window.location.href = `/search?q=${encodeURIComponent(keyword.trim())}&results=${searchResults.length}`;
      console.log("Search results:", searchResults);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  return (

    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white">\
      <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              className="rounded-md p-2 hover:bg-stone-100 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={22} />
            </button>

            <Link to="/" className="shrink-0">
              <div className="flex flex-col leading-none">
                <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-stone-900">
                  Nova
                </span>
                <span className="text-lg font-black uppercase tracking-tight text-stone-900">
                  Wear
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-10 lg:flex">
            {loadingDepartments ? (
              <span className="text-sm text-stone-400">Đang tải menu...</span>
            ) : (
              departments.map((department) => (
                <div
                  key={department.id}
                  onMouseEnter={() => openMegaMenu(department)}
                  className="relative"
                >
                  <Link
                    to={`/department/${department.id}`}
                    state={{ departmentName: department.name }}
                    className={`text-[15px] font-bold uppercase transition-colors ${activeDepartment?.id === department.id
                        ? "text-blue-600"
                        : "text-stone-900 hover:text-blue-600"
                      }`}
                  >
                    {department.name}
                  </Link>

                  {activeDepartment?.id === department.id && (
                    <span className="absolute left-0 top-[33px] h-[2px] w-full bg-stone-900" />
                  )}
                </div>
              ))
            )}

            <Link
              to="/sale"
              className="relative text-[15px] font-bold uppercase text-red-600 transition hover:text-red-700"
            >
              <span className="absolute -top-3 right-[-14px] text-[9px] font-extrabold text-red-500">
                -50%
              </span>
              SALE
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="relative lg:flex lg:h-10 lg:items-center lg:rounded-full lg:border lg:border-stone-300 lg:bg-white lg:px-4 hidden">
              <form 
                onSubmit={handleSearchSubmit} 
                className="flex items-center flex-1 relative"
              >
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-[180px] bg-transparent text-sm outline-none pr-20 xl:w-[300px] xl:pr-28"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-900 p-1"
                >
                  <Search size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute right-11 top-1/2 -translate-y-1/2 p-1 hover:bg-blue-50 rounded-full transition-colors group"
                  title="Tìm kiếm bằng hình ảnh"
                >
                  <Image size={20} className="text-stone-500 group-hover:text-blue-600" />
                </button>
              </form>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      console.log("Uploading image:", file.name, file.size);
                      const results = await searchProductsByImage(file);
                      console.log("Image search results:", results);
                      // Lưu results vào sessionStorage
                      sessionStorage.setItem('imageSearchResults', JSON.stringify(results));
                      window.location.href = `/search?type=image&count=${results.length}`;
                    } catch (error) {
                      console.error('Image search error:', error);
                      alert("Lỗi tìm kiếm hình ảnh: " + error.message);
                    }
                  }
                }}
                multiple={false}
                className="hidden"
              />
              <span className="mx-2 text-xs text-stone-400">|</span>
            </div>

            <Link to="/cart" className="relative rounded-full p-2 hover:bg-stone-100">
              <ShoppingBag size={20} />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Link>

            <div className="relative">
              {authLoading ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-stone-900" />
                </div>
              ) : user ? (
                <>
                  <button
                    onClick={() => setUserOpen(!userOpen)}
                    className="flex items-center gap-2 rounded-full p-2 hover:bg-stone-100"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-brand-600 flex items-center justify-center text-white font-semibold text-xs">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <ChevronDown size={16} className={`transition-transform ${userOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {userOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white border shadow-xl py-2 z-[60]">
                      <Link to="/account" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-stone-50" onClick={() => setUserOpen(false)}>
                        <User size={16} />
                        Tài khoản
                      </Link>
                      <Link to="/order-tracking" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-stone-50" onClick={() => setUserOpen(false)}>
                        <ShoppingBag size={16} />
                        Đơn hàng
                      </Link>
                      <button onClick={() => { signOut(); setUserOpen(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50">
                        <LogOut size={16} />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center gap-2 rounded-full py-2 px-3 text-sm font-semibold text-stone-900 border border-stone-200 hover:bg-stone-50"
                >
                  <User size={20} />
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {activeDepartment && (
        <div
          className="hidden border-t border-stone-200 bg-white shadow-lg lg:block"
          onMouseEnter={cancelCloseMegaMenu}
          onMouseLeave={scheduleCloseMegaMenu}
        >
          <div className="mx-auto max-w-[1280px] px-6 py-6">
            {loadingMegaMenu ? (
              <div className="text-sm text-stone-500">Đang tải danh mục...</div>
            ) : megaMenuData.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-8 xl:grid-cols-5">
                  {megaMenuData.map((category) => (
                    <div key={category.id}>
                      <Link
                        to={`/category/${category.id}`}
                        className="mb-3 block text-[15px] font-bold uppercase text-stone-900 hover:text-blue-600"
                      >
                        {category.name}
                        <span className="ml-2 text-blue-600">→</span>
                      </Link>

                      <div className="space-y-2">
                        {category.subCategories?.length > 0 ? (
                          category.subCategories.map((sub) => (
                            <Link
                              key={sub.id}
                              to={`/sub-category/${sub.id}`}
                              state={{ 
                                subCategoryName: sub.name, 
                                categoryId: category.id,
                                categoryName: category.name 
                              }}
                              className="block text-sm text-stone-600 hover:text-stone-900"
                            >
                              {sub.name}
                            </Link>
                          ))
                        ) : (
                          <Link
                            to={`/category/${category.id}`}
                            className="block text-sm italic text-stone-500 hover:text-stone-900"
                          >
                            Xem tất cả
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap border-t border-stone-200 bg-stone-50">
                  <button className="px-8 py-4 text-sm font-bold uppercase text-stone-700 hover:bg-stone-100">
                    Theo nhu cầu
                  </button>
                  <button className="px-8 py-4 text-sm font-bold uppercase text-stone-900 hover:bg-stone-100">
                    Đồ lót
                  </button>
                  <button className="px-8 py-4 text-sm font-bold uppercase text-stone-900 hover:bg-stone-100">
                    Đồ thể thao
                  </button>
                  <button className="px-8 py-4 text-sm font-bold uppercase text-stone-900 hover:bg-stone-100">
                    Mặc hằng ngày
                  </button>
                </div>
              </>
            ) : (
              <div className="text-sm text-stone-500">
                Chưa có dữ liệu danh mục.
              </div>
            )}
          </div>
        </div>
      )}

      {mobileOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 lg:hidden">
          <div className="h-full w-[84%] max-w-sm bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex flex-col leading-none">
                <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-stone-900">
                  Nova
                </span>
                <span className="text-lg font-black uppercase tracking-tight text-stone-900">
                  Wear
                </span>
              </div>

              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-2 hover:bg-stone-100"
                aria-label="Đóng menu"
              >
                <X size={22} />
              </button>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="mb-4 flex h-11 items-center rounded-full border border-stone-300 px-4"
            >
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full bg-transparent text-sm outline-none"
              />
              <button type="submit" className="text-stone-500">
                <Search size={18} />
              </button>
            </form>

            <div className="space-y-1">
              {departments.map((department) => (
                <Link
                  key={department.id}
                  to={`/department/${department.id}`}
                  state={{ departmentName: department.name }}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-3 text-sm font-semibold uppercase text-stone-900 hover:bg-stone-100"
                >
                  {department.name}
                </Link>
              ))}

              <Link
                to="/sale"
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-3 text-sm font-semibold uppercase text-red-600 hover:bg-red-50"
              >
                SALE
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;