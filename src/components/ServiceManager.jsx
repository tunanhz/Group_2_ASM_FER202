import React, { useEffect, useState } from 'react';
import { fetchJsonBinData } from '../services/api';


const ServiceManager = () => {
    const [services, setServices] = useState([]);
    const [form, setForm] = useState({ name: '', price: '', description: '' });
    const [editingId, setEditingId] = useState(null);

    const fetchServices = async () => {
        const data = await fetchJsonBinData();
        setServices(data.ListOfMedicalService || []);
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.price) return alert('Vui lòng nhập đầy đủ tên và giá');

        if (editingId) {
            // Các thao tác thêm/sửa/xóa cần disable hoặc thông báo không hỗ trợ vì jsonbin chỉ GET
            alert('Chức năng cập nhật không hỗ trợ trên jsonbin.io.');
            return;
        } else {
            // Các thao tác thêm/sửa/xóa cần disable hoặc thông báo không hỗ trợ vì jsonbin chỉ GET
            alert('Chức năng thêm mới không hỗ trợ trên jsonbin.io.');
            return;
        }

        setForm({ name: '', price: '', description: '' });
        setEditingId(null);
        fetchServices();
    };

    const handleEdit = (svc) => {
        setForm({
            name: svc.name,
            price: svc.price,
            description: svc.description || ''
        });
        setEditingId(svc.id);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Xác nhận xoá?')) {
            // Các thao tác thêm/sửa/xóa cần disable hoặc thông báo không hỗ trợ vì jsonbin chỉ GET
            alert('Chức năng xóa không hỗ trợ trên jsonbin.io.');
            return;
        }
    };

    return (
        <div className="container py-5">
            <h2 className="mb-4 text-center">Quản lý Dịch vụ</h2>

            <form className="card p-4 shadow-sm mb-5" onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Tên dịch vụ</label>
                    <input
                        name="name"
                        className="form-control"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Giá (VNĐ)</label>
                    <input
                        name="price"
                        type="number"
                        className="form-control"
                        value={form.price}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Mô tả</label>
                    <textarea
                        name="description"
                        className="form-control"
                        value={form.description}
                        onChange={handleChange}
                    />
                </div>
                <div className="d-grid">
                    <button className="btn btn-primary" type="submit">
                        {editingId ? 'Cập nhật' : 'Thêm mới'}
                    </button>
                </div>
            </form>

            <table className="table table-bordered table-hover shadow-sm">
                <thead className="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Tên</th>
                        <th>Giá</th>
                        <th>Mô tả</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {services.map((svc) => (
                        <tr key={svc.id}>
                            <td>{svc.id}</td>
                            <td>{svc.name}</td>
                            <td>{svc.price}</td>
                            <td>{svc.description}</td>
                            <td>
                                <button
                                    onClick={() => handleEdit(svc)}
                                    className="btn btn-warning btn-sm me-2"
                                >
                                    <i className="bi bi-pencil-square">Edit</i>
                                </button>
                                <button
                                    onClick={() => handleDelete(svc.id)}
                                    className="btn btn-danger btn-sm"
                                >
                                    <i className="bi bi-trash">Delete</i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ServiceManager;
