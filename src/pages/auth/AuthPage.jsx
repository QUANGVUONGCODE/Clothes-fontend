import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { useAuth } from '../../context/AuthContext';

export default function AuthPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const { signIn } = useAuth();
  const navigate = useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn(phone, password);
    
    if (result.success) {
      // Check if admin
      const userRole = localStorage.getItem('user_role');
      if (userRole === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate(-1);
      }
    } else {
      setError(result.error || 'Sai số điện thoại hoặc mật khẩu');
    }
    setLoading(false);
  };


  return (
    <MainLayout>
      <section className="min-h-[70vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-stone-900 mb-2">
              {isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
            </h1>
            <p className="text-stone-500">
              {isLogin 
                ? 'Đăng nhập để tiếp tục mua sắm' 
                : 'Đăng ký để bắt đầu trải nghiệm'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-stone-700">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-stone-700">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-900 text-white py-3 rounded-lg font-semibold hover:bg-black disabled:opacity-50 transition-all duration-200"
            >
              {loading ? 'Đang đăng nhập...' : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="w-full py-3 px-4 border border-stone-200 rounded-lg hover:bg-stone-50 font-medium text-stone-700"
            >
              {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
            </button>
            <Link 
              to="/account/create" 
              className="block text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Đăng ký tài khoản mới →
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

