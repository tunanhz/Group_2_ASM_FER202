import React, { useState, useEffect } from 'react';
import { getDoctors, apiService } from '../services/api';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [accountStaff, setAccountStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all');

    // Fetch doctors and account staff data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [doctorsResponse, accountStaffResponse] = await Promise.all([
                    getDoctors(),
                    apiService.getAccountStaff()
                ]);

                if (doctorsResponse.success && accountStaffResponse.data) {
                    setDoctors(doctorsResponse.data);
                    setAccountStaff(accountStaffResponse.data);
                } else {
                    setError('Không thể tải dữ liệu bác sĩ');
                }
            } catch (err) {
                setError('Có lỗi xảy ra khi tải dữ liệu');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Combine doctor data with account staff data
    const getCombinedDoctorData = () => {
        return doctors.map(doctor => {
            const accountInfo = accountStaff.find(staff => 
                staff.id === doctor.account_staff_id && staff.role === 'Doctor'
            );
            return {
                ...doctor,
                accountInfo: accountInfo || null
            };
        }).filter(doctor => doctor.accountInfo?.status === 'Enable'); // Only show enabled doctors
    };

    // Get unique departments for filter
    const getDepartments = () => {
        const departments = [...new Set(doctors.map(doctor => doctor.department))];
        return departments.sort();
    };

    // Filter doctors based on search term and department
    const filteredDoctors = getCombinedDoctorData().filter(doctor => {
        const matchesSearch = doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            doctor.department.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = selectedDepartment === 'all' || doctor.department === selectedDepartment;
        return matchesSearch && matchesDepartment;
    });

    const getDepartmentColor = (department) => {
        const colors = {
            'Nội tổng quát': '#3b82f6',
            'Ngoại tổng quát': '#10b981',
            'Tim mạch': '#ef4444',
            'Hô hấp': '#f59e0b',
            'Nhi': '#8b5cf6',
            'Chấn thương chỉnh hình': '#06b6d4',
            'Tiêu hóa': '#84cc16',
            'Tai Mũi Họng': '#f97316',
            'Nội tiết': '#ec4899',
            'Thần kinh': '#6366f1',
            'Phụ sản': '#14b8a6',
            'Mắt': '#a855f7',
            'Da liễu': '#22c55e',
            'Chẩn đoán hình ảnh': '#f43f5e'
        };
        return colors[department] || '#6b7280';
    };

    if (loading) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-3 text-muted">Đang tải danh sách bác sĩ...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger text-center" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            {/* Page Header */}
            <div className="text-center mb-5">
                <h1 className="display-4 fw-bold mb-3" style={{
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    <i className="fas fa-user-md me-3"></i>
                    Đội Ngũ Bác Sĩ
                </h1>
                <p className="lead text-muted mx-auto" style={{maxWidth: '600px'}}>
                    Gặp gỡ đội ngũ bác sĩ chuyên khoa giàu kinh nghiệm và tận tâm của chúng tôi
                </p>
            </div>

            {/* Search and Filter Section */}
            <div className="row mb-4">
                <div className="col-md-8">
                    <div className="input-group">
                        <span className="input-group-text">
                            <i className="fas fa-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="Tìm kiếm bác sĩ theo tên hoặc chuyên khoa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="col-md-4">
                    <select
                        className="form-select form-select-lg"
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                    >
                        <option value="all">Tất cả chuyên khoa</option>
                        {getDepartments().map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Statistics */}
            <div className="row mb-5">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm text-center">
                        <div className="card-body">
                            <div className="text-primary fs-1 mb-2">
                                <i className="fas fa-user-md"></i>
                            </div>
                            <h3 className="fw-bold text-primary">{filteredDoctors.length}</h3>
                            <p className="text-muted mb-0">Bác sĩ có sẵn</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm text-center">
                        <div className="card-body">
                            <div className="text-success fs-1 mb-2">
                                <i className="fas fa-hospital"></i>
                            </div>
                            <h3 className="fw-bold text-success">{getDepartments().length}</h3>
                            <p className="text-muted mb-0">Chuyên khoa</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm text-center">
                        <div className="card-body">
                            <div className="text-warning fs-1 mb-2">
                                <i className="fas fa-award"></i>
                            </div>
                            <h3 className="fw-bold text-warning">
                                {filteredDoctors.filter(d => d.eduLevel.includes('Tiến sĩ') || d.eduLevel.includes('Giáo sư')).length}
                            </h3>
                            <p className="text-muted mb-0">Tiến sĩ & Giáo sư</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Doctors Grid */}
            <div className="row g-4">
                {filteredDoctors.map(doctor => (
                    <div key={doctor.id} className="col-lg-4 col-md-6">
                        <div className="card border-0 shadow-sm h-100" style={{
                            transition: 'all 0.3s ease',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-10px)';
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                        }}>
                            <div className="card-body p-4">
                                {/* Doctor Avatar */}
                                <div className="text-center mb-3">
                                    <div className="position-relative d-inline-block">
                                        <img
                                            src={doctor.accountInfo?.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.full_name)}&background=667eea&color=fff&size=120`}
                                            alt={doctor.full_name}
                                            className="rounded-circle"
                                            style={{
                                                width: '120px',
                                                height: '120px',
                                                objectFit: 'cover',
                                                border: '4px solid #f8f9fa'
                                            }}
                                        />
                                        <div className="position-absolute bottom-0 end-0">
                                            <div className="bg-success rounded-circle" style={{
                                                width: '24px',
                                                height: '24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '3px solid white'
                                            }}>
                                                <i className="fas fa-check text-white" style={{fontSize: '10px'}}></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Doctor Info */}
                                <div className="text-center">
                                    <h5 className="fw-bold mb-2" style={{color: '#1f2937'}}>
                                        BS. {doctor.full_name}
                                    </h5>
                                    
                                    <div className="mb-2">
                                        <span className="badge rounded-pill px-3 py-2 fw-semibold" style={{
                                            backgroundColor: getDepartmentColor(doctor.department),
                                            color: 'white',
                                            fontSize: '0.85rem'
                                        }}>
                                            {doctor.department}
                                        </span>
                                    </div>

                                    <div className="mb-3">
                                        <span className="badge bg-light text-dark border px-3 py-2">
                                            <i className="fas fa-graduation-cap me-1"></i>
                                            {doctor.eduLevel}
                                        </span>
                                    </div>

                                    <div className="text-muted mb-3">
                                        <div className="d-flex align-items-center justify-content-center mb-2">
                                            <i className="fas fa-phone me-2 text-primary"></i>
                                            <span>{doctor.phone}</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <i className="fas fa-envelope me-2 text-primary"></i>
                                            <span className="text-truncate" style={{maxWidth: '200px'}}>
                                                {doctor.accountInfo?.email || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="d-flex gap-2 justify-content-center">
                                    <button 
                                        className="btn btn-primary btn-sm rounded-pill px-3"
                                        style={{
                                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                            border: 'none',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'scale(1.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'scale(1)';
                                        }}
                                    >
                                        <i className="fas fa-calendar-plus me-1"></i>
                                        Đặt lịch
                                    </button>
                                    <button 
                                        className="btn btn-outline-primary btn-sm rounded-pill px-3"
                                        style={{
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'scale(1.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'scale(1)';
                                        }}
                                    >
                                        <i className="fas fa-user-circle me-1"></i>
                                        Xem thêm
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* No Results Message */}
            {filteredDoctors.length === 0 && (
                <div className="text-center py-5">
                    <div className="text-muted">
                        <i className="fas fa-search fs-1 mb-3"></i>
                        <h4>Không tìm thấy bác sĩ phù hợp</h4>
                        <p>Vui lòng thử lại với từ khóa khác hoặc chọn chuyên khoa khác</p>
                    </div>
                </div>
            )}

            {/* Call to Action */}
            <div className="text-center mt-5">
                <div className="bg-light rounded-4 p-5">
                    <h3 className="mb-3">Cần tư vấn thêm?</h3>
                    <p className="text-muted mb-4">
                        Liên hệ với chúng tôi để được tư vấn và hỗ trợ tốt nhất
                    </p>
                    <div className="d-flex gap-3 justify-content-center">
                        <button className="btn btn-primary btn-lg rounded-pill px-4">
                            <i className="fas fa-phone me-2"></i>
                            Gọi ngay
                        </button>
                        <button className="btn btn-outline-primary btn-lg rounded-pill px-4">
                            <i className="fas fa-calendar-check me-2"></i>
                            Đặt lịch hẹn
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Doctors; 