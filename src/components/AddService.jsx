import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addMedicalService } from '../services/api';

const AddService = () => {
    const [form, setForm] = useState({ name: '', price: '', description: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.price) {
            alert("Vui lòng nhập đầy đủ tên và giá");
            return;
        }
        await addMedicalService(form);
        navigate('/services');
    };

    return (
        <div className="container py-5">
            <div className="card shadow p-4 mx-auto" style={{ maxWidth: 650, borderRadius: "1.5rem" }}>
                <h3 className="text-center text-success mb-4 fw-bold">➕ Thêm Dịch vụ Y tế</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">📝 Tên dịch vụ</label>
                        <input
                            name="name"
                            className="form-control form-control-lg rounded-4 shadow-sm"
                            value={form.name}
                            onChange={handleChange}
                            required
                            placeholder="Nhập tên dịch vụ"
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">💰 Giá (VNĐ)</label>
                        <input
                            name="price"
                            type="number"
                            className="form-control form-control-lg rounded-4 shadow-sm"
                            value={form.price}
                            onChange={handleChange}
                            required
                            placeholder="Nhập giá"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-semibold">📄 Mô tả</label>
                        <textarea
                            name="description"
                            className="form-control rounded-4 shadow-sm"
                            value={form.description}
                            rows={4}
                            onChange={handleChange}
                            placeholder="Nhập mô tả (nếu có)"
                        />
                    </div>
                    <button className="btn btn-lg btn-success w-100 rounded-pill fw-bold shadow" type="submit">
                        💾 Lưu dịch vụ
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddService;
