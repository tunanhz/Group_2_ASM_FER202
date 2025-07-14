import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ServiceList = () => {
    const [services, setServices] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetch("http://localhost:9999/ListOfMedicalService")
            .then((res) => res.json())
            .then((data) => setServices(data));
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const pageParam = parseInt(params.get("page"));
        if (!isNaN(pageParam) && pageParam >= 1) {
            setCurrentPage(pageParam);
        }
    }, [location.search]);

    const totalPages = Math.ceil(services.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentServices = services.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleEdit = (svc) => {
        navigate(`/edit-service/${svc.id}?page=${currentPage}`);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Xác nhận xoá?")) {
            await fetch(`http://localhost:9999/ListOfMedicalService/${id}`, {
                method: "DELETE"
            });
            setServices(prev => prev.filter(s => s.id !== id));
        }
    };

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="text-primary fw-bold">📋 Danh sách Dịch vụ Y tế</h3>
                <button className="btn btn-success rounded-pill px-4" onClick={() => navigate('/add-service')}>
                    ➕ Thêm dịch vụ
                </button>
            </div>
            <div className="table-responsive rounded-3 shadow">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-success text-center">
                        <tr>
                            <th>ID</th>
                            <th>Tên</th>
                            <th>Giá</th>
                            <th>Mô tả</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="text-center">
                        {currentServices.map((svc) => (
                            <tr key={svc.id}>
                                <td>{svc.id}</td>
                                <td className="fw-semibold text-start">{svc.name}</td>
                                <td className="text-danger fw-bold">{Number(svc.price).toLocaleString()} VNĐ</td>
                                <td className="text-muted text-start">{svc.description}</td>
                                <td>
                                    <button className="btn btn-sm btn-warning rounded-pill me-2" onClick={() => handleEdit(svc)}>
                                        ✏️ Sửa
                                    </button>
                                    <button className="btn btn-sm btn-danger rounded-pill" onClick={() => handleDelete(svc.id)}>
                                        🗑️ Xoá
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="row align-items-center mt-4">
                    <div className="col-md-8 d-flex justify-content-center">
                        <nav>
                            <ul className="pagination pagination-sm mb-0">
                                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                    <button className="page-link rounded-pill" onClick={() => handlePageChange(1)}>&laquo;</button>
                                </li>
                                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                    <button className="page-link rounded-pill" onClick={() => handlePageChange(currentPage - 1)}>&lsaquo;</button>
                                </li>
                                {currentPage > 2 && <li className="page-item disabled"><span className="page-link">...</span></li>}
                                {currentPage > 1 && (
                                    <li className="page-item">
                                        <button className="page-link rounded-pill" onClick={() => handlePageChange(currentPage - 1)}>{currentPage - 1}</button>
                                    </li>
                                )}
                                <li className="page-item active">
                                    <span className="page-link rounded-pill bg-primary text-white shadow-sm">{currentPage}</span>
                                </li>
                                {currentPage < totalPages && (
                                    <li className="page-item">
                                        <button className="page-link rounded-pill" onClick={() => handlePageChange(currentPage + 1)}>{currentPage + 1}</button>
                                    </li>
                                )}
                                {currentPage < totalPages - 1 && <li className="page-item disabled"><span className="page-link">...</span></li>}
                                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                    <button className="page-link rounded-pill" onClick={() => handlePageChange(currentPage + 1)}>&rsaquo;</button>
                                </li>
                                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                    <button className="page-link rounded-pill" onClick={() => handlePageChange(totalPages)}>&raquo;</button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                    <div className="col-md-4 d-flex justify-content-md-end justify-content-center mt-3 mt-md-0">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const value = parseInt(e.target.pageInput.value);
                                if (!isNaN(value) && value >= 1 && value <= totalPages) {
                                    setCurrentPage(value);
                                }
                            }}
                            className="d-flex align-items-center"
                        >
                            <label className="me-2 mb-0 fw-semibold text-nowrap">Trang:</label>
                            <input
                                type="number"
                                name="pageInput"
                                min={1}
                                max={totalPages}
                                className="form-control form-control-sm me-2 rounded-3 shadow-sm"
                                style={{ width: "80px" }}
                                placeholder={`${currentPage}/${totalPages}`}
                            />
                            <button type="submit" className="btn btn-sm btn-outline-primary rounded-pill px-3">
                                Đi
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceList;
