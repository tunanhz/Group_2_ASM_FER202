import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddMedicine = () => {
    const [form, setForm] = useState({ name: "", type: "", price: "", quantity: "", status: "Enable" });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetch("http://localhost:9999/Medicine", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        navigate("/medicines");
    };

    return (
        <div className="container py-5">
            <div className="card shadow-sm p-4 mx-auto" style={{ maxWidth: 600, borderRadius: "1rem" }}>
                <h3 className="text-center text-primary mb-4">➕ Thêm thuốc mới</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">📝 Tên thuốc</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Nhập tên thuốc"
                            className="form-control rounded-3 shadow-sm"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">📦 Loại</label>
                        <input
                            type="text"
                            name="type"
                            placeholder="Nhập loại thuốc"
                            className="form-control rounded-3 shadow-sm"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">💰 Giá (VNĐ)</label>
                        <input
                            type="number"
                            name="price"
                            placeholder="Ví dụ: 15000"
                            className="form-control rounded-3 shadow-sm"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label fw-semibold">🔢 Số lượng</label>
                        <input
                            type="number"
                            name="quantity"
                            placeholder="Ví dụ: 500"
                            className="form-control rounded-3 shadow-sm"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-success w-100 rounded-pill fw-semibold shadow-sm">
                        💾 Lưu thuốc
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddMedicine;
