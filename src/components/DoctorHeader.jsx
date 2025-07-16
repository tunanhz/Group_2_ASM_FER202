import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorHeader = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [doctorInfo, setDoctorInfo] = useState({ name: 'Bác sĩ', specialization: 'Chuyên khoa' });

    useEffect(() => {
        // Load doctor info from localStorage or API
        const savedDoctorInfo = localStorage.getItem('doctorInfo');
        if (savedDoctorInfo) {
            setDoctorInfo(JSON.parse(savedDoctorInfo));
        }
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = async () => {
        try {
            localStorage.removeItem('authToken');
            localStorage.removeItem('doctorInfo');
            localStorage.removeItem('userInfo');
            sessionStorage.clear();
            alert('Đăng xuất thành công');
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            alert('Đăng xuất thất bại. Vui lòng thử lại.');
        }
    };

    const handleNavigation = (path) => {
        navigate(path);
        setIsMenuOpen(false);
    };

    return (
        <>
            {/* Bootstrap CSS Links */}
            <link 
                href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" 
                rel="stylesheet"
            />
            <link 
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
                rel="stylesheet"
            />

            <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow">
                <div className="container-fluid">
                    {/* Logo */}
                    <div className="navbar-brand fw-bold fs-4 d-flex align-items-center">
                        <i className="fas fa-stethoscope me-2 text-white"></i>
                        <span className="text-white">Bảng Điều Khiển Bác Sĩ</span>
                    </div>
                    {/* User Info and Logout Button */}
                    <div className="d-flex align-items-center">
                        {doctorInfo && (
                            <div className="d-flex align-items-center me-3">
                                <i className="fas fa-user-md text-white me-2"></i>
                                <span className="text-white">{doctorInfo.name}</span>
                            </div>
                        )}
                        <button
                            className="btn btn-outline-light border-0"
                            onClick={handleLogout}
                            style={{
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                            }}
                        >
                            <i className="fas fa-sign-out-alt me-2"></i>
                            Đăng xuất
                        </button>
                    </div>

                    {/* Mobile Toggle Button */}
                    <button 
                        className="navbar-toggler border-0 shadow-none" 
                        type="button"
                        onClick={toggleMenu}
                        style={{fontSize: '1.2rem'}}
                    >
                        <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-white`}></i>
                    </button>

                    {/* Navigation Menu */}
                    <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <button 
                                    className="nav-link btn btn-link text-white fw-semibold px-3 py-2 rounded-3 mx-1 border-0" 
                                    onClick={() => handleNavigation('/doctor-dashboard')}
                                    style={{
                                        transition: 'all 0.3s ease',
                                        textDecoration: 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <i className="fas fa-home me-2"></i>Dashboard
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className="nav-link btn btn-link text-white fw-semibold px-3 py-2 rounded-3 mx-1 border-0" 
                                    onClick={() => handleNavigation('/assign-service')}
                                    style={{
                                        transition: 'all 0.3s ease',
                                        textDecoration: 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <i className="fas fa-tasks me-2"></i>Dịch Vụ Phân Công
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className="nav-link btn btn-link text-white fw-semibold px-3 py-2 rounded-3 mx-1 border-0" 
                                    onClick={() => handleNavigation('/result-page')}
                                    style={{
                                        transition: 'all 0.3s ease',
                                        textDecoration: 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <i className="fas fa-clipboard-list me-2"></i>Kết Quả Dịch Vụ
                                </button>
                            </li>
                            
                            {/* Doctor Info Dropdown */}
                            <li className="nav-item dropdown">
                                <button 
                                    className="nav-link dropdown-toggle btn btn-link text-white fw-semibold px-3 py-2 rounded-3 mx-1 border-0 d-flex align-items-center" 
                                    data-bs-toggle="dropdown" 
                                    aria-expanded="false"
                                    style={{
                                        transition: 'all 0.3s ease',
                                        textDecoration: 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <div className="bg-white rounded-circle p-1 me-2" style={{width: '32px', height: '32px'}}>
                                        <i className="fas fa-user-md text-primary" style={{fontSize: '16px'}}></i>
                                    </div>
                                    <div className="text-start d-none d-lg-block">
                                        <div style={{fontSize: '0.9rem', lineHeight: '1.2'}}>{doctorInfo.name}</div>
                                        <div style={{fontSize: '0.75rem', opacity: '0.8'}}>{doctorInfo.specialization}</div>
                                    </div>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <button 
                                            className="dropdown-item d-flex align-items-center"
                                            onClick={() => handleNavigation('/doctor-profile')}
                                        >
                                            <i className="fas fa-user me-2 text-primary"></i>
                                            Thông Tin Cá Nhân
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            className="dropdown-item d-flex align-items-center"
                                            onClick={() => handleNavigation('/doctor-schedule')}
                                        >
                                            <i className="fas fa-calendar me-2 text-success"></i>
                                            Lịch Trình
                                        </button>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button 
                                            className="dropdown-item d-flex align-items-center text-danger"
                                            onClick={handleLogout}
                                        >
                                            <i className="fas fa-sign-out-alt me-2"></i>
                                            Đăng Xuất
                                        </button>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Bootstrap JS for dropdown functionality */}
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        </>
    );
};

export default DoctorHeader; 