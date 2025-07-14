import React from "react";
import { useNavigate } from "react-router-dom";

const AdminBusinessDashboard = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();

    if (!user || user.userType !== "staff" || user.role !== "AdminBusiness") {
        navigate("/login");
        return null;
    }


    const features = [
        {
            icon: "📄",
            title: "Danh sách hóa đơn",
            description: "Xem và theo dõi các hóa đơn đã tạo",
            link: "/invoice-list",
        },
        {
            icon: "📊",
            title: "Thống kê doanh thu",
            description: "Xem báo cáo doanh thu theo thời gian",
            link: "/revenue-statistics",
        },
    ];

    return (
        <div className="container py-5">
            <h2 className="text-center text-primary mb-5">
                Xin chào, Quản lý tài chính {user.full_name || ""}
            </h2>
            <div className="row g-4">
                {features.map((f, idx) => (
                    <div className="col-md-6" key={idx}>
                        <div
                            className="card h-100 shadow-sm"
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

export default AdminBusinessDashboard;
