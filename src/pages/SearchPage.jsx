import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Image, Upload, Loader2 } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import ProductCard from '../components/product/ProductCard';
import SkeletonCard from '../components/common/SkeletonCard';
import { searchProductsByKeyword, searchProductsByImage } from '../services/productService';
import { adaptBackendProduct } from '../utils/backendAdapter';


export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const keyword = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageSearchLoading, setImageSearchLoading] = useState(false);
  const [searchType, setSearchType] = useState('keyword'); // 'keyword' or 'image'
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const performKeywordSearch = useCallback(async (kw) => {
    if (!kw) return;
    try {
      setLoading(true);
      const searchResults = await searchProductsByKeyword(kw, 24);
      const adaptedResults = searchResults.map(adaptBackendProduct);
      setResults(adaptedResults);
      setSearchType('keyword');
    } catch (error) {
      console.error('Keyword search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const performImageSearch = useCallback(async (imageFile) => {
    if (!imageFile) return;
    try {
      setImageSearchLoading(true);
      const searchResults = await searchProductsByImage(imageFile);
      const adaptedResults = searchResults.map(adaptBackendProduct);
      setResults(adaptedResults);
      setSearchType('image');
    } catch (error) {
      console.error('Image search error:', error);
      setResults([]);
    } finally {
      setImageSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'image') {
      // Load from sessionStorage nếu từ Header image search
      const savedResults = sessionStorage.getItem('imageSearchResults');
      if (savedResults) {
        try {
          const resultsData = JSON.parse(savedResults);
          const adaptedResults = resultsData.map(adaptBackendProduct);
          setResults(adaptedResults);
          setSearchType('image');
          // Không xóa để khi quay lại vẫn giữ danh sách.
          // sessionStorage.removeItem('imageSearchResults');
        } catch (error) {
          console.error('Load image results error:', error);
        }
      }
    } else if (keyword) {
      performKeywordSearch(keyword);
    } else {
      // Nếu không có q và không có type=image, nhưng vẫn có sẵn cached ảnh
      // (trường hợp user navigate sâu và back), thì hiển thị lại cache.
      const savedResults = sessionStorage.getItem('imageSearchResults');
      if (savedResults) {
        try {
          const resultsData = JSON.parse(savedResults);
          const adaptedResults = resultsData.map(adaptBackendProduct);
          setResults(adaptedResults);
          setSearchType('image');
        } catch {
          setResults([]);
        }
      } else {
        setResults([]);
      }
    }
  }, [keyword, searchParams, performKeywordSearch]);

  return (
    <MainLayout>
      <section className="container-shell py-16">
        <div className="text-center mb-12 space-y-4">
          {/* Unified Search Bar with Image Button */}
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-white rounded-2xl shadow-lg border-2 border-stone-200 p-1 flex">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400 z-10" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm bằng từ khóa..."
                value={keyword}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedImage(null); // Clear image on text input
                  if (value) {
                    setSearchParams({ q: value });
                  } else {
                    setSearchParams({});
                  }
                }}
                className="flex-1 pl-12 pr-20 py-4 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl text-lg bg-transparent"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-blue-50 rounded-full transition-colors group"
                title="Tìm kiếm bằng hình ảnh"
              >
                <Image className="h-6 w-6 text-stone-500 group-hover:text-blue-600 transition-colors" />
              </button>
            </div>
            {selectedImage && (
              <p className="text-sm text-blue-600 mt-2 text-center">📸 Đã chọn ảnh, tìm kiếm tương tự đang tải...</p>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setSelectedImage(file);
                performImageSearch(file);
                // Clear keyword param
                setSearchParams({});
              }
            }}
            className="hidden"
          />

          {/* Results Header */}
          <div>
            <h1 className="text-4xl font-black mb-4">
              {searchType === 'image' ? 'Sản phẩm tương tự:' : `Kết quả tìm kiếm: "${keyword || 'không có'}"`}
            </h1>
            <p className="text-xl text-stone-600">
              Tìm thấy {results.length} sản phẩm
            </p>
          </div>
        </div>

        {(loading || imageSearchLoading) ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <Search className="mx-auto h-24 w-24 text-stone-400 mb-6" />
            <h2 className="text-2xl font-bold text-stone-900 mb-2">
              Không tìm thấy sản phẩm
            </h2>
            <p className="text-stone-600 mb-8 max-w-md mx-auto">
              Thử tìm kiếm với từ khóa khác hoặc duyệt danh mục phổ biến.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/men" className="btn-secondary px-6 py-2">Thời trang nam</Link>
              <Link to="/sale" className="btn-primary px-6 py-2">Sale hot</Link>
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setResults([]);
                  setSearchParams({});
                }}
                className="btn-outline px-6 py-2"
              >
                Xóa tìm kiếm
              </button>
            </div>
          </div>
        )}
      </section>
    </MainLayout>
  );
}

