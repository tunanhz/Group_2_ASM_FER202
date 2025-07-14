// src/components/PharmacistDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PharmacistDashboard = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (!stored) {
            navigate("/login");
            return;
        }

        const parsed = JSON.parse(stored);

        // ✅ Sửa lại điều kiện phù hợp với login
        if (parsed.userType !== "pharmacist") {
            navigate("/login");
        } else {
            setUser(parsed);
        }
    }, [navigate]);

    const features = [
        {
            icon: "📋",
            title: "Danh sách thuốc",
            description: "Xem, tìm kiếm và chỉnh sửa thuốc trong hệ thống",
            link: "/medicines",
        },
        {
            icon: "➕",
            title: "Thêm thuốc mới",
            description: "Cập nhật các loại thuốc mới vào kho",
            link: "/add-medicine",
        },
        {
            icon: "📑",
            title: "Duyệt đơn thuốc",
            description: "Xem và xác nhận các đơn thuốc từ bác sĩ",
            link: "/prescriptions",
        },
    ];

    if (!user) return null;

    return (
        <div className="container py-5">
            <h2 className="text-center text-primary mb-5">
                Xin chào, Dược sĩ {user.full_name || ""}
            </h2>
            <div className="row g-4">
                {features.map((f, idx) => (
                    <div className="col-md-6" key={idx}>
                        <div
                            className="card h-100 shadow-sm hover-shadow"
                            onClick={() => navigate(f.link)}
                            style={{ cursor: "pointer" }}
                        >
                            <div className="card-body text-center">
                                <div style={{ fontSize: "2.5rem" }}>{f.icon}</div>
                                <h5 className="card-title mt-3">{f.title}</h5>
                                <p className="card-text text-muted">{f.description}</p>
                            </div>
                            <div className="card-footer text-center bg-transparent">
                                <button className="btn btn-outline-primary btn-sm">Truy cập</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PharmacistDashboard;
