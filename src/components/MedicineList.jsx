import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const MedicineList = () => {
    const [medicines, setMedicines] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetch("http://localhost:9999/Medicine")
            .then((res) => res.json())
            .then((data) => setMedicines(data))
            .catch((err) => console.error("Lỗi khi tải danh sách thuốc:", err));
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const savedPage = parseInt(params.get("page"));
        if (!isNaN(savedPage) && savedPage >= 1) {
            setCurrentPage(savedPage);
        }
    }, [location.search]);

    // Map tay category_id -> tên loại thuốc
    const getCategoryName = (id) => {
        const map = {
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
        return map[parseInt(id)] || "Không rõ";
    };

    // Giả định tất cả thuốc đều đang bán nếu không có status
    const getStatusLabel = (status) => (parseInt(status ?? 1) === 1 ? "Còn bán" : "Ngưng bán");
    const getStatusClass = (status) => (parseInt(status ?? 1) === 1 ? "bg-success" : "bg-secondary");

    const totalPages = Math.ceil(medicines.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentMedicines = medicines.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="container py-4">
            <h3 className="text-center text-primary mb-4">📋 Danh sách thuốc</h3>

            <div className="table-responsive shadow-sm rounded-3 overflow-hidden">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-primary text-center">
                        <tr>
                            <th>STT</th>
                            <th>Tên thuốc</th>
                            <th>Loại</th>
                            <th>Giá (VNĐ)</th>
                            <th>Số lượng</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="text-center">
                        {currentMedicines.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-muted py-3">Không có dữ liệu</td>
                            </tr>
                        ) : (
                            currentMedicines.map((m, idx) => (
                                <tr key={m.id}>
                                    <td>{startIndex + idx + 1}</td>
                                    <td>{m.name || "Không rõ"}</td>
                                    <td>{getCategoryName(m.category_id)}</td>
                                    <td className="text-danger fw-bold">{Number(m.price).toLocaleString()}</td>
                                    <td>{m.quantity}</td>
                                    <td>
                                        <span className={`badge ${getStatusClass(m.status)}`}>
                                            {getStatusLabel(m.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-warning rounded-pill px-3"
                                            onClick={() =>
                                                navigate(`/edit-medicine/${m.id}?page=${currentPage}`, {
                                                    state: { medicine: m, page: currentPage }
                                                })
                                            }
                                        >
                                            ✏️ Sửa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
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

export default MedicineList;
