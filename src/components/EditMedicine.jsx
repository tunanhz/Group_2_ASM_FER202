import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const EditMedicine = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const page = location.state?.page || 1;

    const [medicine, setMedicine] = useState({
        name: "",
        category_id: "",
        price: "",
        quantity: "",
        status: "Enable"
    });

    const categoryMap = {
        1: "Giảm đau",
        2: "Kháng sinh",
        3: "Hạ sốt",
        4: "Chống viêm",
        5: "Tiêu hóa",
        6: "Bổ sung khoáng chất",
        7: "Ho – Hô hấp",
        8: "Chống dị ứng",
        9: "Thuốc mắt",
        11: "Sát khuẩn",
        12: "Truyền dịch",
        13: "Vitamin",
        14: "Tim mạch",
        15: "Tiểu đường",
        16: "Hô hấp",
        18: "Gan mật",
        19: "Dạ dày – ruột",
        24: "Cholesterol máu",
        30: "Kháng viêm mạnh",
        49: "Thuốc mũi"
    };

    useEffect(() => {
        if (location.state?.medicine) {
            setMedicine(location.state.medicine);
        } else {
            fetch(`http://localhost:9999/Medicines/${id}`)
                .then((res) => res.json())
                .then((data) => setMedicine(data))
                .catch(() => alert("Không thể tải dữ liệu thuốc!"));
        }
    }, [id, location.state]);

    const handleChange = (e) => {
        setMedicine({ ...medicine, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetch(`http://localhost:9999/Medicine/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(medicine),
        });
        navigate(`/medicines?page=${page}`);
    };

    return (
        <div className="container py-5">
            <div className="card shadow-sm p-4 mx-auto" style={{ maxWidth: 600, borderRadius: "1rem" }}>
                <h3 className="text-center text-primary mb-4">
                    ✏️ Chỉnh sửa thông tin thuốc
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">📝 Tên thuốc</label>
                        <input
                            type="text"
                            name="name"
                            value={medicine.name}
                            className="form-control rounded-3 shadow-sm"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">📦 Loại thuốc</label>
                        <select
                            name="category_id"
                            value={medicine.category_id}
                            onChange={handleChange}
                            className="form-select rounded-3 shadow-sm"
                            required
                        >
                            <option value="">-- Chọn loại thuốc --</option>
                            {Object.entries(categoryMap).map(([id, name]) => (
                                <option key={id} value={id}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">💰 Giá (VNĐ)</label>
                        <input
                            type="number"
                            name="price"
                            value={medicine.price}
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
                            value={medicine.quantity}
                            className="form-control rounded-3 shadow-sm"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100 rounded-pill shadow-sm fw-semibold">
                        💾 Lưu thay đổi
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditMedicine;
