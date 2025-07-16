import React from 'react';

const Home = () => {
    return (
        <div>
            
            {/* Hero Section */}
            <section className="position-relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                minHeight: '90vh',
                display: 'flex',
                alignItems: 'center'
            }}>
                {/* Background Pattern */}
                <div className="position-absolute w-100 h-100" style={{
                    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    opacity: 0.3
                }}></div>
                
                <div className="container position-relative">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className="text-white" data-aos="fade-right">
                                <h1 className="display-3 fw-bold mb-4" style={{
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                                    lineHeight: '1.2'
                                }}>
                                    Sức Khỏe Của Bạn, 
                                    <span style={{
                                        background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}> Ưu Tiên Của Chúng Tôi</span>
                                </h1>
                                <p className="lead mb-4 fs-5" style={{opacity: 0.9}}>
                                    Trải nghiệm dịch vụ y tế đẳng cấp thế giới với công nghệ tiên tiến, 
                                    sự chăm sóc tận tâm và đội ngũ chuyên gia y tế tận tụy vì sức khỏe của bạn.
                                </p>
                                <div className="d-flex flex-wrap gap-3">
                                    <button className="btn btn-light btn-lg px-4 py-3 rounded-pill fw-semibold" style={{
                                        boxShadow: '0 8px 25px rgba(255,255,255,0.3)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-3px)';
                                        e.target.style.boxShadow = '0 12px 35px rgba(255,255,255,0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 8px 25px rgba(255,255,255,0.3)';
                                    }}>
                                        <i className="fas fa-calendar-check me-2"></i>
                                        Đặt Lịch Hẹn
                                    </button>
                                    
            </div>
                            </div>
                        </div>
                        <div className="col-lg-6" data-aos="fade-left">
                            <div className="position-relative text-center">
                                <div className="rounded-circle mx-auto" style={{
                                    width: '400px',
                                    height: '400px',
                                    background: 'rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(10px)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid rgba(255,255,255,0.3)'
                                }}>
                                    <i className="fas fa-heartbeat text-white" style={{fontSize: '8rem', opacity: 0.8}}></i>
                    </div>
                                {/* Floating elements */}
                                <div className="position-absolute" style={{
                                    top: '10%',
                                    right: '10%',
                                    background: 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(10px)',
                                    padding: '1rem',
                                    borderRadius: '15px',
                                    animation: 'float 3s ease-in-out infinite'
                                }}>
                                    <i className="fas fa-user-md text-white fs-3"></i>
                            </div>
                                <div className="position-absolute" style={{
                                    bottom: '20%',
                                    left: '5%',
                                    background: 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(10px)',
                                    padding: '1rem',
                                    borderRadius: '15px',
                                    animation: 'float 3s ease-in-out infinite 1s'
                                }}>
                                    <i className="fas fa-ambulance text-white fs-3"></i>
                    </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-5" style={{
                background: 'linear-gradient(45deg, #f8fafc, #e2e8f0)',
                marginTop: '-50px',
                position: 'relative',
                zIndex: 2
            }}>
                <div className="container">
                    <div className="row">
                        {[
                            { number: '50+', label: 'Bác Sĩ Chuyên Khoa', icon: 'fa-user-md', color: '#3b82f6' },
                            { number: '15K+', label: 'Bệnh Nhân Hài Lòng', icon: 'fa-smile', color: '#10b981' },
                            { number: '20+', label: 'Năm Kinh Nghiệm', icon: 'fa-award', color: '#f59e0b' },
                            { number: '24/7', label: 'Cấp Cứu', icon: 'fa-clock', color: '#ef4444' }
                        ].map((stat, index) => (
                            <div key={index} className="col-md-3 col-6 mb-4">
                                <div className="text-center p-4 rounded-4 h-100" style={{
                                    background: 'white',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-10px)';
                                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                                }}>
                                    <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{
                                        width: '70px',
                                        height: '70px',
                                        background: `linear-gradient(45deg, ${stat.color}, ${stat.color}dd)`
                                    }}>
                                        <i className={`fas ${stat.icon} text-white fs-4`}></i>
                        </div>
                                    <h3 className="fw-bold mb-2" style={{color: stat.color, fontSize: '2.5rem'}}>{stat.number}</h3>
                                    <p className="text-muted mb-0 fw-semibold">{stat.label}</p>
                        </div>
                        </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-5 my-5">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="display-5 fw-bold mb-3" style={{
                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>Dịch Vụ Cao Cấp Của Chúng Tôi</h2>
                        <p className="lead text-muted mx-auto" style={{maxWidth: '600px'}}>
                            Các giải pháp chăm sóc sức khỏe toàn diện được thiết kế với sự thoải mái và phục hồi của bạn
                        </p>
                    </div>
                    
                    <div className="row g-4">
                        {[
                            {
                                icon: 'fa-user-md',
                                title: 'Tư Vấn Chuyên Khoa',
                                description: 'Nhận lời khuyên y tế cá nhân từ các chuyên gia được chứng nhận với nhiều năm kinh nghiệm.',
                                color: '#3b82f6'
                            },
                            {
                                icon: 'fa-heartbeat',
                                title: 'Cấp Cứu',
                                description: 'Dịch vụ cấp cứu 24/7 với phản ứng nhanh và hệ thống hỗ trợ sự sống hiện đại.',
                                color: '#ef4444'
                            },
                            {
                                icon: 'fa-microscope',
                                title: 'Chẩn Đoán Tiên Tiến',
                                description: 'Thiết bị chẩn đoán tiên tiến để có kết quả chính xác và phát hiện bệnh sớm.',
                                color: '#10b981'
                            },
                            {
                                icon: 'fa-procedures',
                                title: 'Phẫu Thuật Xuất Sắc',
                                description: 'Các thủ thuật xâm lấn tối thiểu với công nghệ phẫu thuật mới nhất để phục hồi nhanh hơn.',
                                color: '#f59e0b'
                            },
                            {
                                icon: 'fa-pills',
                                title: 'Dịch Vụ Dược Phẩm',
                                description: 'Chăm sóc dược phẩm hoàn chỉnh với tư vấn thuốc và tùy chọn giao hàng tận nhà.',
                                color: '#8b5cf6'
                            },
                            {
                                icon: 'fa-spa',
                                title: 'Chương Trình Sức Khỏe',
                                description: 'Các chương trình sức khỏe tổng thể bao gồm tư vấn dinh dưỡng và hỗ trợ sức khỏe tâm thần.',
                                color: '#06b6d4'
                            }
                        ].map((service, index) => (
                            <div key={index} className="col-lg-4 col-md-6">
                                <div className="card h-100 border-0 rounded-4 overflow-hidden" style={{
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-15px)';
                                    e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                                }}>
                                    <div className="card-body p-4 text-center">
                                        <div className="rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center" style={{
                                            width: '80px',
                                            height: '80px',
                                            background: `linear-gradient(45deg, ${service.color}, ${service.color}dd)`
                                        }}>
                                            <i className={`fas ${service.icon} text-white fs-3`}></i>
                                        </div>
                                        <h5 className="fw-bold mb-3" style={{color: '#1f2937'}}>{service.title}</h5>
                                        <p className="text-muted mb-4" style={{lineHeight: '1.6'}}>{service.description}</p>
                                        <button className="btn btn-outline-primary rounded-pill px-4" style={{
                                            borderColor: service.color,
                                            color: service.color,
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = service.color;
                                            e.target.style.color = 'white';
                                            e.target.style.transform = 'scale(1.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = 'transparent';
                                            e.target.style.color = service.color;
                                            e.target.style.transform = 'scale(1)';
                                        }}>
                                            Tìm Hiểu Thêm
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                            </div>
                        </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-5" style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            }}>
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="display-5 fw-bold mb-3" style={{
                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>Bệnh Nhân Nói Gì Về Chúng Tôi</h2>
                        <p className="lead text-muted">Những câu chuyện thực tế từ những người tin tưởng chúng tôi với sức khỏe của họ</p>
                    </div>
                    
                    <div className="row g-4">
                        {[
                            {
                                name: 'Nguyễn Thị Linh',
                                role: 'Mẹ của hai con',
                                rating: 5,
                                text: 'Mức độ chăm sóc và sự quan tâm mà gia đình tôi nhận được thật đặc biệt. Các bác sĩ đã dành thời gian để giải thích mọi thứ và khiến chúng tôi cảm thấy thoải mái trong suốt quá trình điều trị.',
                                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
                            },
                            {
                                name: 'Trần Văn Minh',
                                role: 'Giám đốc điều hành',
                                rating: 5,
                                text: 'Chuyên nghiệp, hiệu quả và chu đáo. Hệ thống đặt lịch hẹn trực tuyến rất tuyệt vời và nhân viên luôn cố gắng hết sức để phù hợp với lịch trình bận rộn của tôi.',
                                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
                            },
                            {
                                name: 'Lê Thị Hương',
                                role: 'Giáo viên',
                                rating: 5,
                                text: 'Tôi đã là bệnh nhân ở đây được hơn 5 năm. Chất lượng chăm sóc, cơ sở vật chất hiện đại và nhân viên thân thiện khiến mỗi lần đến khám đều là trải nghiệm tích cực.',
                                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
                            }
                        ].map((testimonial, index) => (
                            <div key={index} className="col-lg-4">
                                <div className="card border-0 rounded-4 h-100" style={{
                                    background: 'white',
                                    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-10px)';
                                    e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)';
                                }}>
                                    <div className="card-body p-4">
                                        <div className="mb-3">
                                            {[...Array(testimonial.rating)].map((_, i) => (
                                                <i key={i} className="fas fa-star text-warning me-1"></i>
                                            ))}
                                        </div>
                                        <p className="mb-4 fst-italic" style={{
                                            fontSize: '1.1rem',
                                            lineHeight: '1.6',
                                            color: '#374151'
                                        }}>"{testimonial.text}"</p>
                                        <div className="d-flex align-items-center">
                                            <img 
                                                src={testimonial.avatar} 
                                                alt={testimonial.name}
                                                className="rounded-circle me-3"
                                                style={{width: '60px', height: '60px', objectFit: 'cover'}}
                                            />
                                    <div>
                                                <h6 className="mb-0 fw-bold">{testimonial.name}</h6>
                                                <small className="text-muted">{testimonial.role}</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                                    </div>
            </section>

            {/* CTA Section */}
            <section className="py-5 my-5">
                <div className="container">
                    <div className="text-center p-5 rounded-4" style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white'
                    }}>
                        <h2 className="display-5 fw-bold mb-3">Sẵn Sàng Chăm Sóc Sức Khỏe Của Bạn?</h2>
                        <p className="lead mb-4">Đặt lịch hẹn hôm nay và trải nghiệm dịch vụ chăm sóc sức khỏe như chưa từng có</p>
                        <div className="d-flex justify-content-center gap-3 flex-wrap">
                            <button className="btn btn-light btn-lg px-5 py-3 rounded-pill fw-semibold" style={{
                                boxShadow: '0 8px 25px rgba(255,255,255,0.3)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-3px) scale(1.05)';
                                e.target.style.boxShadow = '0 12px 35px rgba(255,255,255,0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0) scale(1)';
                                e.target.style.boxShadow = '0 8px 25px rgba(255,255,255,0.3)';
                            }}>
                                <i className="fas fa-calendar-plus me-2"></i>
                                Đặt Lịch Hẹn Ngay
                            </button>
                            <button className="btn btn-outline-light btn-lg px-5 py-3 rounded-pill fw-semibold" style={{
                                borderWidth: '2px',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                e.target.style.transform = 'translateY(-3px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.transform = 'translateY(0)';
                            }}>
                                <i className="fas fa-phone me-2"></i>
                                Gọi Cho Chúng Tôi
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Custom Animations */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                
                @media (max-width: 768px) {
                    .display-3 { font-size: 2.5rem !important; }
                    .display-5 { font-size: 2rem !important; }
                }
            `}</style>
        </div>
    );
};

export default Home;
