import React, { useEffect, useState } from 'react';

const DoctorProfile = () => {
    const [doctorInfo, setDoctorInfo] = useState({
        name: '',
        specialization: '',
        email: '',
        phone: '',
        id: ''
    });

    useEffect(() => {
        // Lấy thông tin bác sĩ từ localStorage hoặc API
        const savedDoctorInfo = localStorage.getItem('doctorInfo');
        if (savedDoctorInfo) {
            setDoctorInfo(JSON.parse(savedDoctorInfo));
        } else {
            // fallback nếu chưa có dữ liệu
            setDoctorInfo({
                name: 'Bác sĩ',
                specialization: 'Chuyên khoa',
                email: 'doctor@example.com',
                phone: '0123456789',
                id: 'N/A'
            });
        }
    }, []);

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow rounded-4">
                        <div className="card-body p-5">
                            <div className="d-flex align-items-center mb-4">
                                <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-4" style={{width: 80, height: 80}}>
                                    <i className="fas fa-user-md text-white" style={{fontSize: '2.5rem'}}></i>
                                </div>
                                <div>
                                    <h2 className="fw-bold mb-1">{doctorInfo.name}</h2>
                                    <div className="text-muted">ID: {doctorInfo.id}</div>
                                    <div className="badge bg-primary mt-2">{doctorInfo.specialization}</div>
                                </div>
                            </div>
                            <hr />
                            <div className="mb-3">
                                <strong>Email:</strong> <span className="ms-2">{doctorInfo.email}</span>
                            </div>
                            <div className="mb-3">
                                <strong>Số điện thoại:</strong> <span className="ms-2">{doctorInfo.phone}</span>
                            </div>
                            {/* Thêm các trường khác nếu cần */}
                            <div className="mt-4">
                                <button className="btn btn-outline-primary rounded-pill px-4">
                                    <i className="fas fa-edit me-2"></i>Chỉnh sửa thông tin
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile; 