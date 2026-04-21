import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn(phoneNumber, password);
    if (result.success) {
      navigate("/account");
    } else {
      setError(result.error || "Đăng nhập thất bại");
    }
    setLoading(false);
  };

  return (
    <MainLayout>
      <section className="container-shell py-16">
        <div className="mx-auto max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8">Đăng nhập</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium">Số điện thoại</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Nhập số điện thoại"
                className="w-full rounded-lg px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-black outline-none"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full rounded-lg px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-black outline-none"
                required
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
          <p className="text-center mt-6 text-sm">
            Chưa có tài khoản?{" "}
            <Link to="/account/create" className="font-semibold text-black hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </section>
    </MainLayout>
  );
}

