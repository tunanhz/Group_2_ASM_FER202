import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import RegisterPatient from "./components/RegisterPatient";
import ForgetPassword from "./components/ForgetPassword";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div style={{ textAlign: "center", marginTop: "50px" }}>
              <h1>Hệ thống quản lý bệnh viện</h1>
              <p><Link to="/register">Đăng ký bệnh nhân</Link></p>
              <p><Link to="/login">Đăng nhập</Link></p>
              <p><Link to="/forget-password">Quên mật khẩu</Link></p>
            </div>
          }
        />

        <Route path="/register" element={<RegisterPatient />} />
        <Route path="/forget-password" element={<ForgetPassword />} />

        {/* Trang login tạm thời */}
        <Route
          path="/login"
          element={
            <div style={{ textAlign: "center", marginTop: "50px" }}>
              <Link to="/">Quay về trang chủ</Link>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
