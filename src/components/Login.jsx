import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { getAccountPatients, getAccountStaff, getAccountPharmacist } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
        const [patients, staff, pharmacists] = await Promise.all([
            getAccountPatients(),
            getAccountStaff(),
            getAccountPharmacist ? getAccountPharmacist() : Promise.resolve([])
        ]);
        let matchedUser = null;
        let userType = "";
        const foundPatient = patients.find(user => user.email === email && user.password === password);
        if (foundPatient) {
            matchedUser = foundPatient;
            userType = "patient";
        } else {
            const foundStaff = staff.find(user => user.email === email && user.password === password);
            if (foundStaff) {
                matchedUser = foundStaff;
                userType = "staff";
            } else if (pharmacists && pharmacists.length) {
                const foundPharmacist = pharmacists.find(user => user.email === email && user.password === password);
                if (foundPharmacist) {
                    matchedUser = foundPharmacist;
                    userType = "pharmacist";
                }
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
                  if (userType === "patient") navigate("/patient-dashboard");
                  else if (userType === "staff") navigate("/doctor-dashboard");
                  else if (userType === "pharmacist") navigate("/pharmacist-dashboard");
                  else navigate("/");
                }, 800);
            }
        } else {
            setError("❌ Sai thông tin đăng nhập.");
        }
    } catch (err) {
        setError("❌ Lỗi đăng nhập.");
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
