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
                                    Your Health, Our 
                                    <span style={{
                                        background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}> Priority</span>
                                </h1>
                                <p className="lead mb-4 fs-5" style={{opacity: 0.9}}>
                                    Experience world-class healthcare with cutting-edge technology, 
                                    compassionate care, and expert medical professionals dedicated to your wellbeing.
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
                                        Book Appointment
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
                            { number: '50+', label: 'Expert Doctors', icon: 'fa-user-md', color: '#3b82f6' },
                            { number: '15K+', label: 'Happy Patients', icon: 'fa-smile', color: '#10b981' },
                            { number: '20+', label: 'Years Experience', icon: 'fa-award', color: '#f59e0b' },
                            { number: '24/7', label: 'Emergency Care', icon: 'fa-clock', color: '#ef4444' }
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
                        }}>Our Premium Services</h2>
                        <p className="lead text-muted mx-auto" style={{maxWidth: '600px'}}>
                            Comprehensive healthcare solutions designed with your comfort and recovery in mind
                        </p>
                    </div>
                    
                    <div className="row g-4">
                        {[
                            {
                                icon: 'fa-user-md',
                                title: 'Expert Consultation',
                                description: 'Get personalized medical advice from our board-certified specialists with years of experience.',
                                color: '#3b82f6'
                            },
                            {
                                icon: 'fa-heartbeat',
                                title: 'Emergency Care',
                                description: 'Round-the-clock emergency services with rapid response and state-of-the-art life support systems.',
                                color: '#ef4444'
                            },
                            {
                                icon: 'fa-microscope',
                                title: 'Advanced Diagnostics',
                                description: 'Cutting-edge diagnostic equipment for accurate results and early disease detection.',
                                color: '#10b981'
                            },
                            {
                                icon: 'fa-procedures',
                                title: 'Surgical Excellence',
                                description: 'Minimally invasive procedures with the latest surgical technology for faster recovery.',
                                color: '#f59e0b'
                            },
                            {
                                icon: 'fa-pills',
                                title: 'Pharmacy Services',
                                description: 'Complete pharmaceutical care with medication counseling and home delivery options.',
                                color: '#8b5cf6'
                            },
                            {
                                icon: 'fa-spa',
                                title: 'Wellness Programs',
                                description: 'Holistic wellness programs including nutrition counseling and mental health support.',
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
                                            Learn More
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
                        }}>What Our Patients Say</h2>
                        <p className="lead text-muted">Real stories from people who trust us with their health</p>
                    </div>
                    
                    <div className="row g-4">
                        {[
                            {
                                name: 'Sarah Johnson',
                                role: 'Mother of Two',
                                rating: 5,
                                text: 'The level of care and attention my family received was exceptional. The doctors took time to explain everything and made us feel comfortable throughout the entire process.',
                                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
                            },
                            {
                                name: 'Michael Chen',
                                role: 'Business Executive',
                                rating: 5,
                                text: 'Professional, efficient, and caring. The online appointment system is fantastic and the staff always goes above and beyond to accommodate my busy schedule.',
                                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
                            },
                            {
                                name: 'Emma Rodriguez',
                                role: 'Teacher',
                                rating: 5,
                                text: 'I have been a patient here for over 5 years. The quality of care, modern facilities, and friendly staff make every visit a positive experience.',
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
                        <h2 className="display-5 fw-bold mb-3">Ready to Take Care of Your Health?</h2>
                        <p className="lead mb-4">Book your appointment today and experience healthcare like never before</p>
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
                                Book Appointment Now
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
                                Call Us Now
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
