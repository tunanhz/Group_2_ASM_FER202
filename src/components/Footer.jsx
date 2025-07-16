import React from 'react';

const Footer = () => {
    const footerStyle = {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff',
        padding: '3rem 0',
        marginTop: 'auto'
    };

    const containerStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem'
    };

    const sectionStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    };

    const titleStyle = {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '1rem'
    };

    const linkStyle = {
        color: '#ffffff',
        textDecoration: 'none',
        transition: 'opacity 0.3s ease',
        opacity: 0.8
    };

    const bottomBarStyle = {
        borderTop: '1px solid rgba(255,255,255,0.1)',
        marginTop: '2rem',
        paddingTop: '2rem',
        textAlign: 'center',
        opacity: 0.8
    };

    return (
        <footer style={footerStyle}>
            <div style={containerStyle}>
                <div style={sectionStyle}>
                    <h3 style={titleStyle}>🏥 Trung Tâm Y Tế</h3>
                    <p>Cung cấp dịch vụ chăm sóc sức khỏe chất lượng với sự tận tâm và chuyên môn.</p>
                    <p>📞 Cấp cứu: 0968537367</p>
                </div>

                <div style={sectionStyle}>
                    <h3 style={titleStyle}>Liên Kết Nhanh</h3>
                    <a href="/about" style={linkStyle}>Về Chúng Tôi</a>
                    <a href="/services" style={linkStyle}>Dịch Vụ</a>
                    <a href="/doctors" style={linkStyle}>Tìm Bác Sĩ</a>
                    <a href="/appointments" style={linkStyle}>Đặt Lịch Hẹn</a>
                </div>

                <div style={sectionStyle}>
                    <h3 style={titleStyle}>Liên Hệ</h3>
                    <p>📍 123 Đường TrangBo</p>
                    <p>📧 info@trangbo.com</p>
                    <p>☎️ +84 (28) 123-4567</p>
                </div>

                <div style={sectionStyle}>
                    <h3 style={titleStyle}>Giờ Làm Việc</h3>
                    <p>Thứ Hai - Thứ Sáu: 8:00 - 20:00</p>
                    <p>Thứ Bảy: 9:00 - 18:00</p>
                    <p>Chủ Nhật: Chỉ Cấp Cứu</p>
                </div>
            </div>

            <div style={bottomBarStyle}>
                <p>© 2025 Bệnh Viện TrangBo. Tất cả quyền được bảo lưu.</p>
            </div>
        </footer>
    );
};

export default Footer;
