import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const EditService = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ name: '', price: '', description: '' });

    const params = new URLSearchParams(location.search);
    const returnPage = params.get("page") || 1;

    useEffect(() => {
        fetch(`http://localhost:9999/ListOfMedicalService/${id}`)
            .then(res => res.json())
            .then(data => setForm(data));
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.price) return alert("Vui lòng nhập đầy đủ tên và giá");

        await fetch(`http://localhost:9999/ListOfMedicalService/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        });

        navigate(`/services?page=${returnPage}`);
    };

    // ... import và hooks không đổi

    return (
        <div className="container py-5">
            <div className="card shadow p-4 mx-auto" style={{ maxWidth: 650, borderRadius: "1.5rem" }}>
                <h3 className="text-center text-warning mb-4 fw-bold">✏️ Cập nhật Dịch vụ Y tế</h3>
                <form onSubmit={handleSubmit} className="needs-validation">
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Tên dịch vụ <span className="text-danger">*</span></label>
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
                        <label className="form-label fw-semibold">Giá dịch vụ (VNĐ) <span className="text-danger">*</span></label>
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
                        <label className="form-label fw-semibold">Mô tả</label>
                        <textarea
                            name="description"
                            className="form-control rounded-4 shadow-sm"
                            rows={4}
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Nhập mô tả chi tiết (nếu có)"
                        />
                    </div>
                    <button className="btn btn-lg btn-warning w-100 rounded-pill fw-bold shadow" type="submit">
                        💾 Lưu thay đổi
                    </button>
                </form>
            </div>
        </div>
    );

};

export default EditService;
