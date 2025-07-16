import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

const ForgetPassword = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      // Tìm tài khoản theo username + email
      const accRes = await fetch("http://localhost:9999/AccountPatient");
      const accData = await accRes.json();

      const matchedAcc = accData.find(
        (acc) => acc.username === username && acc.email === email
      );

      if (!matchedAcc) {
        return alert("Không tìm thấy tài khoản với tên đăng nhập và email đã nhập");
      }

      // Cập nhật mật khẩu mới
      const updateRes = await fetch(`http://localhost:9999/AccountPatient/${matchedAcc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword })
      });

      if (!updateRes.ok) throw new Error("Cập nhật mật khẩu thất bại");

      alert("Đặt lại mật khẩu thành công!");
      navigate("/login");
    } catch (err) {
      alert("Có lỗi xảy ra khi đặt lại mật khẩu: " + err.message);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="card-title text-center mb-4">Quên mật khẩu</h3>
              <form onSubmit={handleReset}>
                <div className="mb-3">
                  <label className="form-label">Tên đăng nhập</label>
                  <input
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Mật khẩu mới</label>
                  <input
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">
                    Đặt lại mật khẩu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
