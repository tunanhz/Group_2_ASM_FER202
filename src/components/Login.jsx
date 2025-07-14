import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const endpoints = [
        { type: "patient", url: "http://localhost:9999/AccountPatient" },
        { type: "staff", url: "http://localhost:9999/AccountStaff" },
        { type: "pharmacist", url: "http://localhost:9999/AccountPharmacist" },
      ];

      let matchedUser = null;
      let userType = "";

      for (const endpoint of endpoints) {
        const res = await fetch(endpoint.url);
        const data = await res.json();
        const found = data.find(
          (user) => user.email === email && user.password === password
        );

        if (found) {
          matchedUser = found;
          userType = endpoint.type;
          break;
        }
      }

      if (matchedUser) {
        if (matchedUser.status === "Disable") {
          setError("❌ Tài khoản đã bị vô hiệu hóa.");
        } else {
          setSuccess("✅ Đăng nhập thành công!");
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...matchedUser,
              userType,
              loginTime: new Date().toISOString(),
            })
          );

          setTimeout(() => {
            if (userType === "staff") {
              switch (matchedUser.role) {
                case "Doctor":
                  window.location.href = "/doctor-dashboard";
                  break;
                case "Nurse":
                  window.location.href = "/nurse-dashboard";
                  break;
                case "Receptionist":
                  window.location.href = "/receptionist-dashboard";
                  break;
                case "AdminSys":
                  window.location.href = "/dashboard";
                  break;
                case "AdminBusiness":
                  window.location.href = "/business-dashboard";
                  break;
                case "Pharmacist":
                  window.location.href = "/pharmacist-dashboard";
                  break;
                default:
                  window.location.href = "/staff-dashboard";
              }
            } else if (userType === "pharmacist") {
              window.location.href = "/pharmacist-dashboard";
            }
            else {
              window.location.href = "/patient-dashboard";
            }
          }, 1000);
        }
      } else {
        setError("❌ Email hoặc mật khẩu không đúng.");
      }
    } catch (err) {
      setError("❌ Lỗi khi đọc dữ liệu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-lg p-4" style={{ width: "100%", maxWidth: "420px" }}>
        <h3 className="text-center text-primary mb-4">Đăng nhập hệ thống</h3>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Nhập email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              className="form-control"
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>

          {error && (
            <div className="alert alert-danger mt-3 text-center" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success mt-3 text-center" role="alert">
              {success}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
