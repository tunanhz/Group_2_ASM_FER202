import React, { useState } from 'react';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Authentication state
    const [userInfo, setUserInfo] = useState({ name: '', role: '' }); // User information

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = async () => {
        try {
           
            setIsLoggedIn(false);
            setUserInfo({ name: '', role: '' });
            localStorage.removeItem('authToken');
            localStorage.removeItem('userInfo');
            sessionStorage.clear();
            alert('Logged out successfully');
            
        } catch (error) {
            console.error('Logout error:', error);
            alert('Logout failed. Please try again.');
        }
    };

    return (
        <>
            {/* Bootstrap CSS - Add this to your index.html if not already included */}
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
                        TrangBo Hospital   
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
                                <a className="nav-link fw-semibold px-3 py-2 rounded-3 mx-1" 
                                   href="/"
                                   style={{
                                       transition: 'all 0.3s ease',
                                       color: '#374151'
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
                                    <i className="fas fa-home me-2"></i>Home
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link fw-semibold px-3 py-2 rounded-3 mx-1" 
                                   href="/doctors"
                                   style={{
                                       transition: 'all 0.3s ease',
                                       color: '#374151'
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
                                    <i className="fas fa-user-md me-2"></i>Doctors
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link fw-semibold px-3 py-2 rounded-3 mx-1" 
                                   href="/services"
                                   style={{
                                       transition: 'all 0.3s ease',
                                       color: '#374151'
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
                                    <i className="fas fa-clinic-medical me-2"></i>Services
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link fw-semibold px-3 py-2 rounded-3 mx-1" 
                                   href="/about"
                                   style={{
                                       transition: 'all 0.3s ease',
                                       color: '#374151'
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
                                    <i className="fas fa-info-circle me-2"></i>About
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link fw-semibold px-3 py-2 rounded-3 mx-1" 
                                   href="/contact"
                                   style={{
                                       transition: 'all 0.3s ease',
                                       color: '#374151'
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
                                    <i className="fas fa-phone me-2"></i>Contact
                                </a>
                            </li>
                        </ul>
                        
                        {/* Auth Section */}
                        <div className="d-flex align-items-center ms-3 gap-2">
                            {!isLoggedIn ? (
                                // Login/Register buttons when not logged in
                                <>
                                    <a 
                                        href="/login"
                                        className="btn btn-outline-primary px-3 py-2 rounded-pill fw-semibold me-2"
                                        style={{
                                            borderWidth: '2px',
                                            transition: 'all 0.3s ease',
                                            textDecoration: 'none'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = '#2563eb';
                                            e.target.style.color = 'white';
                                            e.target.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = 'transparent';
                                            e.target.style.color = '#2563eb';
                                            e.target.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <i className="fas fa-sign-in-alt me-2"></i>
                                        Login
                                    </a>
                                    <a 
                                        href="/register"
                                        className="btn btn-primary px-3 py-2 rounded-pill fw-semibold"
                                        style={{
                                            background: 'linear-gradient(45deg, #2563eb, #3b82f6)',
                                            border: 'none',
                                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                                            transition: 'all 0.3s ease',
                                            textDecoration: 'none'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
                                        }}
                                    >
                                        <i className="fas fa-user-plus me-2"></i>
                                        Register
                                    </a>
                                </>
                            ) : (
                                // User profile and logout when logged in
                                <div className="d-flex align-items-center">
                                    {/* User Profile Dropdown */}
                                    <div className="dropdown me-2">
                                        <button 
                                            className="btn btn-light d-flex align-items-center px-3 py-2 rounded-pill fw-semibold dropdown-toggle"
                                            type="button"
                                            id="userDropdown"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                            style={{
                                                border: '2px solid #e5e7eb',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.borderColor = '#2563eb';
                                                e.target.style.backgroundColor = '#f8fafc';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.borderColor = '#e5e7eb';
                                                e.target.style.backgroundColor = '#f8f9fa';
                                            }}
                                        >
                                            <div className="rounded-circle me-2 d-flex align-items-center justify-content-center" style={{
                                                width: '35px',
                                                height: '35px',
                                                background: 'linear-gradient(45deg, #2563eb, #3b82f6)',
                                                color: 'white'
                                            }}>
                                                <i className="fas fa-user"></i>
                                            </div>
                                            <div className="text-start">
                                                <div style={{fontSize: '0.9rem', fontWeight: '600'}}>{userInfo.name}</div>
                                                <div style={{fontSize: '0.75rem', color: '#6b7280'}}>{userInfo.role}</div>
                                            </div>
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end rounded-3 border-0 shadow-lg" 
                                            aria-labelledby="userDropdown"
                                            style={{minWidth: '220px'}}>
                                            <li>
                                                <a className="dropdown-item py-2 px-3" href="/profile" style={{
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.backgroundColor = '#f3f4f6';
                                                    e.target.style.color = '#2563eb';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.backgroundColor = 'transparent';
                                                    e.target.style.color = '#374151';
                                                }}>
                                                    <i className="fas fa-user-circle me-2"></i>My Profile
                                                </a>
                                            </li>
                                            <li>
                                                <a className="dropdown-item py-2 px-3" href="/dashboard" style={{
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.backgroundColor = '#f3f4f6';
                                                    e.target.style.color = '#2563eb';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.backgroundColor = 'transparent';
                                                    e.target.style.color = '#374151';
                                                }}>
                                                    <i className="fas fa-tachometer-alt me-2"></i>Dashboard
                                                </a>
                                            </li>
                                            <li>
                                                <a className="dropdown-item py-2 px-3" href="/appointments" style={{
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.backgroundColor = '#f3f4f6';
                                                    e.target.style.color = '#2563eb';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.backgroundColor = 'transparent';
                                                    e.target.style.color = '#374151';
                                                }}>
                                                    <i className="fas fa-calendar-check me-2"></i>My Appointments
                                                </a>
                                            </li>
                                            <li>
                                                <a className="dropdown-item py-2 px-3" href="/settings" style={{
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.backgroundColor = '#f3f4f6';
                                                    e.target.style.color = '#2563eb';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.backgroundColor = 'transparent';
                                                    e.target.style.color = '#374151';
                                                }}>
                                                    <i className="fas fa-cog me-2"></i>Settings
                                                </a>
                                            </li>
                                            <li><hr className="dropdown-divider" /></li>
                                            <li>
                                                <button 
                                                    className="dropdown-item py-2 px-3 text-danger"
                                                    onClick={handleLogout}
                                                    style={{
                                                        border: 'none',
                                                        background: 'none',
                                                        width: '100%',
                                                        textAlign: 'left',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.backgroundColor = '#fef2f2';
                                                        e.target.style.color = '#dc2626';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.backgroundColor = 'transparent';
                                                        e.target.style.color = '#dc2626';
                                                    }}
                                                >
                                                    <i className="fas fa-sign-out-alt me-2"></i>Logout
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                            
                           
                        </div>
                    </div>
                </div>
            </nav>

            {/* Bootstrap JS for dropdown functionality */}
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

            {/* Custom styles for mobile responsiveness */}
            <style jsx>{`
                @media (max-width: 991.98px) {
                    .navbar-collapse {
                        margin-top: 1rem;
                        padding-top: 1rem;
                        border-top: 1px solid #e5e7eb;
                    }
                    .d-flex.align-items-center.ms-3 {
                        margin-top: 1rem !important;
                        margin-left: 0 !important;
                        flex-direction: column;
                        gap: 0.5rem;
                    }
                    .d-flex.align-items-center.ms-3 > * {
                        width: 100%;
                    }
                }
                
                .navbar-brand:hover {
                    transform: scale(1.05);
                    transition: transform 0.3s ease;
                }
                
                .navbar {
                    backdrop-filter: blur(10px);
                    background-color: rgba(255, 255, 255, 0.95) !important;
                }
                
                .dropdown-menu {
                    animation: slideDown 0.3s ease;
                }
                
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
};

export default Header;  