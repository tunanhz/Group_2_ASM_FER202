import React, { useEffect, useState } from "react";

const Stock = () => {
    const [stocks, setStocks] = useState([]);

    useEffect(() => {
        fetch("http://localhost:9999/Stocks")
            .then((res) => res.json())
            .then((data) => setStocks(data))
            .catch((err) => console.error("Lỗi khi tải kho thuốc:", err));
    }, []);

    return (
        <div className="container py-5">
            <h2 className="text-center text-primary mb-4">Quản lý kho thuốc</h2>
            <table className="table table-bordered table-hover">
                <thead className="table-light">
                    <tr>
                        <th>Mã thuốc</th>
                        <th>Tên thuốc</th>
                        <th>Số lượng</th>
                        <th>Hạn sử dụng</th>
                    </tr>
                </thead>
                <tbody>
                    {stocks.map((s) => (
                        <tr key={s.id}>
                            <td>{s.medicineId}</td>
                            <td>{s.medicineName}</td>
                            <td>{s.quantity}</td>
                            <td>{s.expiry}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Stock;
