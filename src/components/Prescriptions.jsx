import React, { useEffect, useState } from "react";

// Format ngày theo dd/MM/yyyy
const formatDate = (isoDate) => {
    if (!isoDate) return "Không rõ";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
};

const PrescriptionList = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const presRes = await fetch("http://localhost:9999/Prescription");
                const docRes = await fetch("http://localhost:9999/Doctor");

                const presData = await presRes.json();
                const docData = await docRes.json();

                setPrescriptions(presData.filter(p => p.status === "Pending"));
                setDoctors(docData);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu:", err);
            }
        };
        fetchData();
    }, []);

    const getDoctorName = (id) => {
        const found = doctors.find((d) => Number(d.id) === Number(id));
        return found ? found.full_name : "Không rõ bác sĩ";
    };

    const totalPages = Math.ceil(prescriptions.length / pageSize);
    const pageData = prescriptions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="container py-4">
            <h3 className="text-center text-primary mb-4">📋 Danh sách đơn thuốc cần duyệt</h3>

            <div className="table-responsive shadow-sm rounded-3 overflow-hidden">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-primary text-center">
                        <tr>
                            <th>STT</th>
                            <th>Bác sĩ</th>
                            <th>Ngày kê</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageData.map((p, idx) => (
                            <tr key={p.id}>
                                <td className="text-center">{(currentPage - 1) * pageSize + idx + 1}</td>
                                <td className="text-center">{getDoctorName(p.doctor_id)}</td>
                                <td className="text-center">{formatDate(p.prescription_date)}</td>
                                <td className="text-center">
                                    <span className="badge bg-warning rounded-pill px-3 py-2">
                                        {p.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {pageData.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center text-muted py-3">
                                    Không có đơn thuốc nào chờ duyệt.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="row align-items-center mt-4">
                    {/* Pagination number center */}
                    <div className="col-md-8 d-flex justify-content-center">
                        <nav>
                            <ul className="pagination pagination-sm mb-0">
                                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                    <button className="page-link rounded-pill" onClick={() => setCurrentPage(1)}>&laquo;</button>
                                </li>
                                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                    <button className="page-link rounded-pill" onClick={() => setCurrentPage(currentPage - 1)}>&lsaquo;</button>
                                </li>

                                {currentPage > 2 && <li className="page-item disabled"><span className="page-link">...</span></li>}

                                {currentPage > 1 && (
                                    <li className="page-item">
                                        <button className="page-link rounded-pill" onClick={() => setCurrentPage(currentPage - 1)}>
                                            {currentPage - 1}
                                        </button>
                                    </li>
                                )}

                                <li className="page-item active">
                                    <span className="page-link rounded-pill bg-primary text-white shadow-sm">{currentPage}</span>
                                </li>

                                {currentPage < totalPages && (
                                    <li className="page-item">
                                        <button className="page-link rounded-pill" onClick={() => setCurrentPage(currentPage + 1)}>
                                            {currentPage + 1}
                                        </button>
                                    </li>
                                )}

                                {currentPage < totalPages - 1 && <li className="page-item disabled"><span className="page-link">...</span></li>}

                                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                    <button className="page-link rounded-pill" onClick={() => setCurrentPage(currentPage + 1)}>&rsaquo;</button>
                                </li>
                                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                    <button className="page-link rounded-pill" onClick={() => setCurrentPage(totalPages)}>&raquo;</button>
                                </li>
                            </ul>
                        </nav>
                    </div>

                    {/* Jump to page */}
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

export default PrescriptionList;
