import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateAccountPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    address: "",
    email: "",
    password: "",
    retype_password: "",
    date_of_birth: "",
    facebook_account_id: 0,
    google_account_id: 0,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Vui lòng nhập họ và tên";
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Vui lòng nhập số điện thoại";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không đúng định dạng";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.retype_password.trim()) {
      newErrors.retype_password = "Vui lòng nhập xác nhận mật khẩu";
    } else if (formData.password !== formData.retype_password) {
      newErrors.retype_password = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/shopclothes/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": "vi",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("API response:", data);

      if (response.ok && data.code === 0) {
        alert("Đăng ký tài khoản thành công");
        navigate("/login");
      } else {
        const message = data?.message?.toLowerCase() || "";

        if (message.includes("phone")) {
          setErrors((prev) => ({
            ...prev,
            phone_number: "Số điện thoại đã tồn tại",
          }));
        } else if (message.includes("email")) {
          setErrors((prev) => ({
            ...prev,
            email: "Email đã tồn tại",
          }));
        } else {
          alert(data?.message || "Đăng ký thất bại");
        }
      }
    } catch (error) {
      console.error("Register error:", error);
      alert("Lỗi hệ thống, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (fieldName) =>
    `w-full rounded-lg px-4 py-3 outline-none border ${
      errors[fieldName]
        ? "border-red-500 focus:ring-2 focus:ring-red-500"
        : "border-gray-300 focus:ring-2 focus:ring-black"
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Đăng ký tài khoản</h1>
        <p className="text-center text-gray-500 mb-8">
          Tạo tài khoản để mua sắm tại NovaWear
        </p>

        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Họ và tên</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
              className={inputClass("full_name")}
            />
            {errors.full_name && (
              <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Số điện thoại</label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              className={inputClass("phone_number")}
            />
            {errors.phone_number && (
              <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Địa chỉ</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Nhập địa chỉ"
              className={inputClass("address")}
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email"
              className={inputClass("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Ngày sinh</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className={inputClass("date_of_birth")}
            />
            {errors.date_of_birth && (
              <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              className={inputClass("password")}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Xác nhận mật khẩu</label>
            <input
              type="password"
              name="retype_password"
              value={formData.retype_password}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
              className={inputClass("retype_password")}
            />
            {errors.retype_password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.retype_password}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>

          <p className="text-center text-sm text-gray-600 pt-2">
            Đã có tài khoản?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-semibold text-black hover:underline"
            >
              Đăng nhập
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountPage;