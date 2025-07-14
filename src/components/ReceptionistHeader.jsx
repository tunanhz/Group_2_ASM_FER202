import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ReceptionistHeader = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [receptionistInfo, setReceptionistInfo] = useState({ name: 'Lễ tân', role: 'Lễ tân' });

    useEffect(() => {
        // Load receptionist info from localStorage or API
        const savedReceptionistInfo = localStorage.getItem('receptionistInfo');
        if (savedReceptionistInfo) {
            setReceptionistInfo(JSON.parse(savedReceptionistInfo));
        }
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = async () => {
        try {
            localStorage.removeItem('authToken');
            localStorage.removeItem('receptionistInfo');
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
        <nav className="navbar navbar-expand-lg navbar-dark bg-success sticky-top shadow">
            <div className="container-fluid">
                {/* Logo */}
                <div className="navbar-brand fw-bold fs-4 d-flex align-items-center">
                    <i className="fas fa-user-tie me-2 text-white"></i>
                    <span className="text-white">Bảng Điều Khiển Lễ Tân</span>
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
                                onClick={() => handleNavigation('/receptionist-dashboard')}
                                style={{transition: 'all 0.3s ease', textDecoration: 'none'}} 
                                onMouseEnter={e => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
                            >
                                <i className="fas fa-home me-2"></i>Dashboard
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className="nav-link btn btn-link text-white fw-semibold px-3 py-2 rounded-3 mx-1 border-0" 
                                onClick={() => handleNavigation('/manage-patients')}
                                style={{transition: 'all 0.3s ease', textDecoration: 'none'}} 
                                onMouseEnter={e => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
                            >
                                <i className="fas fa-users me-2"></i>Quản Lý Bệnh Nhân
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className="nav-link btn btn-link text-white fw-semibold px-3 py-2 rounded-3 mx-1 border-0" 
                                onClick={() => handleNavigation('/manage-invoices')}
                                style={{transition: 'all 0.3s ease', textDecoration: 'none'}} 
                                onMouseEnter={e => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
                            >
                                <i className="fas fa-file-invoice-dollar me-2"></i>Quản Lý Hóa Đơn
                            </button>
                        </li>
                        {/* Receptionist Info Dropdown */}
                        <li className="nav-item dropdown">
                            <button 
                                className="nav-link dropdown-toggle btn btn-link text-white fw-semibold px-3 py-2 rounded-3 mx-1 border-0 d-flex align-items-center" 
                                data-bs-toggle="dropdown" 
                                aria-expanded="false"
                                style={{transition: 'all 0.3s ease', textDecoration: 'none'}}
                                onMouseEnter={e => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
                            >
                                <div className="bg-white rounded-circle p-1 me-2" style={{width: '32px', height: '32px'}}>
                                    <i className="fas fa-user-tie text-success" style={{fontSize: '16px'}}></i>
                                </div>
                                <div className="text-start d-none d-lg-block">
                                    <div style={{fontSize: '0.9rem', lineHeight: '1.2'}}>{receptionistInfo.name}</div>
                                    <div style={{fontSize: '0.75rem', opacity: '0.8'}}>{receptionistInfo.role}</div>
                                </div>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                                <li>
                                    <button 
                                        className="dropdown-item d-flex align-items-center"
                                        onClick={() => handleNavigation('/receptionist-profile')}
                                    >
                                        <i className="fas fa-user me-2 text-success"></i>
                                        Thông Tin Cá Nhân
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
    );
};

export default ReceptionistHeader; 