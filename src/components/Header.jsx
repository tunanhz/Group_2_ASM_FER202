import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleNavigation = (path) => {
        navigate(path);
        setIsMenuOpen(false);
    };

    return (
        <>
            {/* Bootstrap CSS */}
            <link 
                href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" 
                rel="stylesheet"
            />
            <link 
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
                rel="stylesheet"
            />

            <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm">
                <div className="container">
                    {/* Logo */}
                    <a className="navbar-brand fw-bold fs-3" href="/" style={{
                        background: 'linear-gradient(45deg, #2563eb, #06b6d4)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        <i className="fas fa-heartbeat me-2 text-primary"></i>
                        Bệnh Viện QAT   
                    </a>

                    {/* Mobile Toggle Button */}
                    <button 
                        className="navbar-toggler border-0 shadow-none" 
                        type="button"
                        onClick={toggleMenu}
                        style={{fontSize: '1.2rem'}}
                    >
                        <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-primary`}></i>
                    </button>

                    {/* Navigation Menu */}
                    <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <button 
                                    className="nav-link btn btn-link fw-semibold px-3 py-2 rounded-3 mx-1 border-0" 
                                    onClick={() => handleNavigation('/')}
                                    style={{
                                        transition: 'all 0.3s ease',
                                        color: '#374151',
                                        textDecoration: 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#f3f4f6';
                                        e.target.style.color = '#2563eb';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#374151';
                                    }}
                                >
                                    <i className="fas fa-home me-2"></i>Trang Chủ
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className="nav-link btn btn-link fw-semibold px-3 py-2 rounded-3 mx-1 border-0" 
                                    onClick={() => handleNavigation('/login')}
                                    style={{
                                        transition: 'all 0.3s ease',
                                        color: '#374151',
                                        textDecoration: 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#f3f4f6';
                                        e.target.style.color = '#2563eb';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#374151';
                                    }}
                                >
                                    <i className="fas fa-sign-in-alt me-2"></i>Đăng Nhập
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className="nav-link btn btn-link fw-semibold px-3 py-2 rounded-3 mx-1 border-0" 
                                    onClick={() => handleNavigation('/register')}
                                    style={{
                                        transition: 'all 0.3s ease',
                                        color: '#374151',
                                        textDecoration: 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#f3f4f6';
                                        e.target.style.color = '#2563eb';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#374151';
                                    }}
                                >
                                    <i className="fas fa-user-plus me-2"></i>Đăng Ký
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className="nav-link btn btn-link fw-semibold px-3 py-2 rounded-3 mx-1 border-0" 
                                    onClick={() => handleNavigation('/doctor-dashboard')}
                                    style={{
                                        transition: 'all 0.3s ease',
                                        color: '#374151',
                                        textDecoration: 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#f3f4f6';
                                        e.target.style.color = '#2563eb';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#374151';
                                    }}
                                >
                                    <i className="fas fa-user-md me-2"></i>Bác Sĩ
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Bootstrap JS for responsive menu */}
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        </>
    );
};

export default Header;  