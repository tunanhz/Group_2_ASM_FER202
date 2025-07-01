import React from 'react';

const DatabaseGuide = () => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 rounded-4" style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div className="card-body p-5 text-center">
                <div className="mb-4">
                  <div className="rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center" style={{
                    width: '120px',
                    height: '120px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)'
                  }}>
                    <i className="fas fa-database text-white" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h1 className="h2 fw-bold mb-3" style={{ color: '#1f2937' }}>
                    🚀 Hướng Dẫn Khởi Động Database
                  </h1>
                  <p className="text-muted fs-5 mb-4">
                    Để sử dụng đầy đủ tính năng Doctor Dashboard, bạn cần khởi động database server
                  </p>
                </div>

                <div className="row g-4 mb-5">
                  <div className="col-md-4">
                    <div className="p-4 rounded-3" style={{
                      background: 'linear-gradient(135deg, #667eea20, #764ba220)',
                      border: '1px solid #667eea40'
                    }}>
                      <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{
                        width: '60px',
                        height: '60px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)'
                      }}>
                        <span className="text-white fw-bold fs-4">1</span>
                      </div>
                      <h5 className="fw-bold mb-2">Mở Terminal</h5>
                      <p className="text-muted small mb-0">
                        Mở Command Prompt hoặc PowerShell trong thư mục project
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-4 rounded-3" style={{
                      background: 'linear-gradient(135deg, #f093fb20, #f5576c20)',
                      border: '1px solid #f093fb40'
                    }}>
                      <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{
                        width: '60px',
                        height: '60px',
                        background: 'linear-gradient(135deg, #f093fb, #f5576c)'
                      }}>
                        <span className="text-white fw-bold fs-4">2</span>
                      </div>
                      <h5 className="fw-bold mb-2">Chạy Lệnh</h5>
                      <p className="text-muted small mb-0">
                        Chạy lệnh JSON server để khởi động database
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-4 rounded-3" style={{
                      background: 'linear-gradient(135deg, #43e97b20, #38f9d720)',
                      border: '1px solid #43e97b40'
                    }}>
                      <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{
                        width: '60px',
                        height: '60px',
                        background: 'linear-gradient(135deg, #43e97b, #38f9d7)'
                      }}>
                        <span className="text-white fw-bold fs-4">3</span>
                      </div>
                      <h5 className="fw-bold mb-2">Hoàn Thành</h5>
                      <p className="text-muted small mb-0">
                        Refresh trang để kết nối với database
                      </p>
                    </div>
                  </div>
                </div>

                <div className="alert alert-info border-0 rounded-3 mb-4" style={{
                  background: 'linear-gradient(135deg, #4facfe20, #00f2fe20)',
                  border: '1px solid #4facfe40'
                }}>
                  <h6 className="fw-bold mb-2">
                    <i className="fas fa-terminal me-2" style={{ color: '#4facfe' }}></i>
                    Lệnh cần chạy:
                  </h6>
                  <div className="p-3 rounded-3" style={{
                    background: '#1a1a1a',
                    fontFamily: 'monospace',
                    fontSize: '1.1rem',
                    color: '#00ff00'
                  }}>
                    <code>npx json-server database.json --port 9999 --watch</code>
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center p-3 rounded-3" style={{
                      background: 'linear-gradient(135deg, #667eea10, #764ba210)',
                      border: '1px solid #667eea30'
                    }}>
                      <i className="fas fa-check-circle text-success fs-4 me-3"></i>
                      <div className="text-start">
                        <div className="fw-bold small">Port 9999</div>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>Database sẽ chạy trên cổng này</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center p-3 rounded-3" style={{
                      background: 'linear-gradient(135deg, #f093fb10, #f5576c10)',
                      border: '1px solid #f093fb30'
                    }}>
                      <i className="fas fa-sync-alt text-primary fs-4 me-3"></i>
                      <div className="text-start">
                        <div className="fw-bold small">Auto Watch</div>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>Tự động cập nhật khi có thay đổi</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-center gap-3">
                  <button 
                    className="btn btn-lg rounded-pill px-5"
                    onClick={() => window.location.reload()}
                    style={{
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      border: 'none',
                      color: 'white',
                      fontWeight: '600',
                      boxShadow: '0 10px 20px rgba(102, 126, 234, 0.4)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <i className="fas fa-sync-alt me-2"></i>
                    Refresh Trang
                  </button>
                  <button 
                    className="btn btn-outline-secondary btn-lg rounded-pill px-5"
                    onClick={() => window.open('https://github.com/typicode/json-server', '_blank')}
                  >
                    <i className="fas fa-question-circle me-2"></i>
                    Tài liệu JSON Server
                  </button>
                </div>

                <div className="mt-4 pt-4 border-top">
                  <p className="text-muted small mb-0">
                    <i className="fas fa-lightbulb me-2"></i>
                    Tip: Sau khi database khởi động thành công, bạn sẽ thấy thông báo "Database Online" ở góc dưới dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.2) !important;
        }
        
        .card {
          transition: all 0.3s ease;
        }
        
        code {
          user-select: all;
        }
        
        .alert {
          border: none !important;
        }
      `}</style>
    </div>
  );
};

export default DatabaseGuide; 