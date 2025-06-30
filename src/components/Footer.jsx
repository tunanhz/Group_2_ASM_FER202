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
                    <h3 style={titleStyle}>🏥 Medical Center</h3>
                    <p>Providing quality healthcare services with compassion and expertise.</p>
                    <p>📞 Emergency: 1800-123-456</p>
                </div>

                <div style={sectionStyle}>
                    <h3 style={titleStyle}>Quick Links</h3>
                    <a href="/about" style={linkStyle}>About Us</a>
                    <a href="/services" style={linkStyle}>Our Services</a>
                    <a href="/doctors" style={linkStyle}>Find a Doctor</a>
                    <a href="/appointments" style={linkStyle}>Book Appointment</a>
                </div>

                <div style={sectionStyle}>
                    <h3 style={titleStyle}>Contact Us</h3>
                    <p>📍 123 Medical Center Drive</p>
                    <p>📧 info@medicalcenter.com</p>
                    <p>☎️ +1 (555) 123-4567</p>
                </div>

                <div style={sectionStyle}>
                    <h3 style={titleStyle}>Working Hours</h3>
                    <p>Monday - Friday: 8:00 AM - 8:00 PM</p>
                    <p>Saturday: 9:00 AM - 6:00 PM</p>
                    <p>Sunday: Emergency Only</p>
                </div>
            </div>

            <div style={bottomBarStyle}>
                <p>© 2023 Medical Center. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
