import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import imageCompression from 'browser-image-compression';

const EditDoctor = ({ doctorId, onSave = () => {}, onCancel = () => {} }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    department: '',
    phone: '',
    eduLevel: '',
    img: null,
    imgPreview: 'default.png',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Kiểm tra nếu không có doctorId
        if (!doctorId) {
          throw new Error('Không tìm thấy ID bác sĩ');
        }
        
        console.log('Fetching doctor data for ID:', doctorId);
        
        const doctorResponse = await fetch(`http://localhost:9999/Doctor/${doctorId}`);
        if (!doctorResponse.ok) {
          if (doctorResponse.status === 404) {
            throw new Error(`Không tìm thấy bác sĩ với ID: ${doctorId}`);
          }
          throw new Error(`Lỗi server: ${doctorResponse.status} - ${doctorResponse.statusText}`);
        }
        const doctorData = await doctorResponse.json();
        
        console.log('Doctor data loaded:', doctorData);

        // Khởi tạo dữ liệu cơ bản từ doctor
        let accountData = { img: 'default.png' };
        
        // Chỉ fetch account data nếu có account_staff_id
        if (doctorData.account_staff_id) {
          try {
            console.log('Fetching account data for ID:', doctorData.account_staff_id);
            const accountResponse = await fetch(`http://localhost:9999/AccountStaff/${doctorData.account_staff_id}`);
            if (accountResponse.ok) {
              accountData = await accountResponse.json();
              console.log('Account data loaded:', accountData);
            } else {
              console.warn('Không thể tải thông tin tài khoản, sử dụng dữ liệu mặc định');
            }
          } catch (accountError) {
            console.warn('Lỗi khi tải thông tin tài khoản:', accountError.message);
            // Không throw error, chỉ sử dụng dữ liệu mặc định
          }
        }

        setFormData({
          full_name: doctorData.full_name || '',
          department: doctorData.department || '',
          phone: doctorData.phone || '',
          eduLevel: doctorData.eduLevel || '',
          img: null,
          imgPreview: accountData.img || 'default.png',
        });
        
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [doctorId]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.full_name.trim()) {
      errors.full_name = 'Họ tên không được để trống';
    } else if (formData.full_name.length < 2) {
      errors.full_name = 'Họ tên phải có ít nhất 2 ký tự';
    }

    if (!formData.department.trim()) {
      errors.department = 'Khoa không được để trống';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      errors.phone = 'Số điện thoại phải có đúng 10 chữ số';
    }

    if (!formData.eduLevel) {
      errors.eduLevel = 'Vui lòng chọn trình độ học vấn';
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 350,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        setFormData((prev) => ({
          ...prev,
          img: compressedFile,
          imgPreview: URL.createObjectURL(compressedFile),
        }));
      } catch (err) {
        setError('Không thể xử lý ảnh: ' + err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setLoading(true);
      const doctorResponse = await fetch(`http://localhost:9999/Doctor/${doctorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: doctorId,
          full_name: formData.full_name,
          department: formData.department,
          phone: formData.phone,
          eduLevel: formData.eduLevel,
        }),
      });

      if (!doctorResponse.ok) {
        throw new Error('Không thể cập nhật thông tin bác sĩ');
      }

      if (formData.img) {
        const doctorData = await doctorResponse.json();
        const formDataToSend = new FormData();
        formDataToSend.append('img', formData.img);
        const accountResponse = await fetch(`http://localhost:9999/AccountStaff/${doctorData.account_staff_id}`, {
          method: 'PUT',
          body: formDataToSend,
        });

        if (!accountResponse.ok) {
          throw new Error('Không thể cập nhật ảnh tài khoản');
        }
      }

      // Success notification
      const notification = document.createElement('div');
      notification.innerHTML = `
        <div style="
          position: fixed; 
          top: 20px; 
          right: 20px; 
          background: linear-gradient(135deg, #10b981, #34d399); 
          color: white; 
          padding: 15px 25px; 
          border-radius: 15px; 
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
          z-index: 9999;
          animation: slideIn 0.3s ease-out;
        ">
          ✅ Cập nhật thông tin thành công!
        </div>
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);

      const updatedDoctor = await doctorResponse.json();
      onSave(updatedDoctor);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '25px'
      }}>
        <div className="text-center text-white">
          <div className="spinner-border mb-4" style={{ width: '4rem', height: '4rem' }} role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <h4 className="mb-3">🩺 Đang tải thông tin bác sĩ...</h4>
          <p className="mb-0">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center p-4 rounded-4" style={{
        background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
        border: 'none',
        color: 'white'
      }}>
        <i className="fas fa-exclamation-triangle fs-2 mb-3"></i>
        <h5 className="mb-2">Có lỗi xảy ra</h5>
        <p className="mb-0">{error}</p>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '20px',
      position: 'relative'
    }}>
      {/* Animated Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 20%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)
        `,
        animation: 'floating 6s ease-in-out infinite'
      }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Header */}
            <div className="text-center mb-5">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4" style={{
                width: '100px',
                height: '100px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <i className="fas fa-user-edit text-white" style={{ fontSize: '3rem' }}></i>
              </div>
              <h1 className="text-white fw-bold mb-3" style={{ 
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                fontSize: '2.5rem'
              }}>
                🩺 Chỉnh Sửa Thông Tin Bác Sĩ
              </h1>
              <p className="text-white-50 fs-5 mb-0">
                Cập nhật thông tin cá nhân và chuyên môn
              </p>
            </div>

            {/* Main Form Card */}
            <div className="card border-0 rounded-4" style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div className="card-body p-5">
                <form onSubmit={handleSubmit}>
                  <div className="row g-5">
                    {/* Profile Image Section */}
                    <div className="col-lg-4">
                      <div className="text-center">
                        <div className="position-relative d-inline-block">
                          <div className="rounded-4 overflow-hidden" style={{
                            width: '280px',
                            height: '280px',
                            background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                            border: '4px solid white',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                          }}>
                            <img
                              src={formData.imgPreview === 'default.png' ? 
                                'https://via.placeholder.com/280x280/667eea/ffffff?text=👨‍⚕️' : 
                                formData.imgPreview}
                              alt="Ảnh đại diện"
                              className="w-100 h-100"
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                          <div className="position-absolute bottom-0 end-0">
                            <button
                              type="button"
                              className="btn rounded-circle"
                              onClick={() => document.getElementById('img').click()}
                              style={{
                                width: '60px',
                                height: '60px',
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                border: '4px solid white',
                                boxShadow: '0 10px 20px rgba(102, 126, 234, 0.4)'
                              }}
                            >
                              <i className="fas fa-camera text-white fs-5"></i>
                            </button>
                          </div>
                        </div>
                        <div className="mt-4">
                          <h5 className="fw-bold mb-2" style={{ color: '#1f2937' }}>Ảnh Đại Diện</h5>
                          <p className="text-muted mb-3">Tải lên ảnh chân dung chuyên nghiệp</p>
                          <button
                            type="button"
                            className="btn btn-outline-primary rounded-pill px-4"
                            onClick={() => document.getElementById('img').click()}
                          >
                            <i className="fas fa-upload me-2"></i>
                            Chọn ảnh mới
                          </button>
                        </div>
                        <input
                          type="file"
                          id="img"
                          name="img"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="d-none"
                        />
                      </div>
                    </div>

                    {/* Form Fields Section */}
                    <div className="col-lg-8">
                      <div className="row g-4">
                        {/* Full Name */}
                        <div className="col-12">
                          <label htmlFor="full_name" className="form-label fw-bold d-flex align-items-center" style={{ color: '#1f2937' }}>
                            <div className="rounded-circle me-3 d-flex align-items-center justify-content-center" style={{
                              width: '35px',
                              height: '35px',
                              background: 'linear-gradient(135deg, #667eea, #764ba2)'
                            }}>
                              <i className="fas fa-user text-white small"></i>
                            </div>
                            Họ và Tên *
                          </label>
                          <input
                            type="text"
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            className={`form-control form-control-lg rounded-3 ${validationErrors.full_name ? 'is-invalid' : ''}`}
                            placeholder="Nhập họ và tên đầy đủ"
                            style={{
                              border: '2px solid #e2e8f0',
                              background: 'rgba(248, 250, 252, 0.8)',
                              transition: 'all 0.3s ease'
                            }}
                            required
                          />
                          {validationErrors.full_name && (
                            <div className="invalid-feedback d-flex align-items-center">
                              <i className="fas fa-exclamation-circle me-2"></i>
                              {validationErrors.full_name}
                            </div>
                          )}
                        </div>

                        {/* Department */}
                        <div className="col-md-6">
                          <label htmlFor="department" className="form-label fw-bold d-flex align-items-center" style={{ color: '#1f2937' }}>
                            <div className="rounded-circle me-3 d-flex align-items-center justify-content-center" style={{
                              width: '35px',
                              height: '35px',
                              background: 'linear-gradient(135deg, #f093fb, #f5576c)'
                            }}>
                              <i className="fas fa-hospital text-white small"></i>
                            </div>
                            Khoa *
                          </label>
                          <select
                            id="department"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className={`form-select form-control-lg rounded-3 ${validationErrors.department ? 'is-invalid' : ''}`}
                            style={{
                              border: '2px solid #e2e8f0',
                              background: 'rgba(248, 250, 252, 0.8)',
                              transition: 'all 0.3s ease'
                            }}
                            required
                          >
                            <option value="">Chọn khoa điều trị</option>
                            <option value="Nội tổng quát">🫀 Nội tổng quát</option>
                            <option value="Ngoại tổng quát">🏥 Ngoại tổng quát</option>
                            <option value="Tim mạch">❤️ Tim mạch</option>
                            <option value="Hô hấp">🫁 Hô hấp</option>
                            <option value="Nhi">👶 Nhi</option>
                            <option value="Chấn thương chỉnh hình">🦴 Chấn thương chỉnh hình</option>
                            <option value="Tiêu hóa">🍎 Tiêu hóa</option>
                            <option value="Tai Mũi Họng">👂 Tai Mũi Họng</option>
                            <option value="Nội tiết">🧬 Nội tiết</option>
                            <option value="Thần kinh">🧠 Thần kinh</option>
                            <option value="Phụ sản">🤱 Phụ sản</option>
                            <option value="Mắt">👁️ Mắt</option>
                            <option value="Da liễu">🧴 Da liễu</option>
                            <option value="Chẩn đoán hình ảnh">📷 Chẩn đoán hình ảnh</option>
                            <option value="Hồi sức cấp cứu">🚑 Hồi sức cấp cứu</option>
                          </select>
                          {validationErrors.department && (
                            <div className="invalid-feedback d-flex align-items-center">
                              <i className="fas fa-exclamation-circle me-2"></i>
                              {validationErrors.department}
                            </div>
                          )}
                        </div>

                        {/* Phone */}
                        <div className="col-md-6">
                          <label htmlFor="phone" className="form-label fw-bold d-flex align-items-center" style={{ color: '#1f2937' }}>
                            <div className="rounded-circle me-3 d-flex align-items-center justify-content-center" style={{
                              width: '35px',
                              height: '35px',
                              background: 'linear-gradient(135deg, #4facfe, #00f2fe)'
                            }}>
                              <i className="fas fa-phone text-white small"></i>
                            </div>
                            Số Điện Thoại *
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`form-control form-control-lg rounded-3 ${validationErrors.phone ? 'is-invalid' : ''}`}
                            placeholder="0123456789"
                            pattern="[0-9]{10}"
                            style={{
                              border: '2px solid #e2e8f0',
                              background: 'rgba(248, 250, 252, 0.8)',
                              transition: 'all 0.3s ease'
                            }}
                            required
                          />
                          {validationErrors.phone && (
                            <div className="invalid-feedback d-flex align-items-center">
                              <i className="fas fa-exclamation-circle me-2"></i>
                              {validationErrors.phone}
                            </div>
                          )}
                        </div>

                        {/* Education Level */}
                        <div className="col-12">
                          <label htmlFor="eduLevel" className="form-label fw-bold d-flex align-items-center" style={{ color: '#1f2937' }}>
                            <div className="rounded-circle me-3 d-flex align-items-center justify-content-center" style={{
                              width: '35px',
                              height: '35px',
                              background: 'linear-gradient(135deg, #43e97b, #38f9d7)'
                            }}>
                              <i className="fas fa-graduation-cap text-white small"></i>
                            </div>
                            Trình Độ Học Vấn *
                          </label>
                          <select
                            id="eduLevel"
                            name="eduLevel"
                            value={formData.eduLevel}
                            onChange={handleChange}
                            className={`form-select form-control-lg rounded-3 ${validationErrors.eduLevel ? 'is-invalid' : ''}`}
                            style={{
                              border: '2px solid #e2e8f0',
                              background: 'rgba(248, 250, 252, 0.8)',
                              transition: 'all 0.3s ease'
                            }}
                            required
                          >
                            <option value="">Chọn trình độ học vấn</option>
                            <option value="Tiến sĩ">🎓 Tiến sĩ</option>
                            <option value="Thạc sĩ">📚 Thạc sĩ</option>
                            <option value="Bác sĩ CKI">🩺 Bác sĩ Chuyên khoa I</option>
                            <option value="Bác sĩ CKII">👨‍⚕️ Bác sĩ Chuyên khoa II</option>
                            <option value="Phó giáo sư">🏆 Phó giáo sư</option>
                          </select>
                          {validationErrors.eduLevel && (
                            <div className="invalid-feedback d-flex align-items-center">
                              <i className="fas fa-exclamation-circle me-2"></i>
                              {validationErrors.eduLevel}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="col-12">
                          <div className="d-flex justify-content-end gap-3 mt-4">
                            <button
                              type="button"
                              onClick={onCancel}
                              className="btn btn-outline-secondary btn-lg rounded-pill px-5"
                              style={{ 
                                border: '2px solid #6c757d',
                                fontWeight: '600'
                              }}
                            >
                              <i className="fas fa-times me-2"></i>
                              Hủy bỏ
                            </button>
                            <button
                              type="submit"
                              className="btn btn-lg rounded-pill px-5"
                              disabled={loading}
                              style={{
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                border: 'none',
                                color: 'white',
                                fontWeight: '600',
                                boxShadow: '0 10px 20px rgba(102, 126, 234, 0.4)',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              {loading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                  </span>
                                  Đang lưu...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-save me-2"></i>
                                  Lưu thay đổi
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for enhanced effects */}
      <style jsx>{`
        @keyframes floating {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
        
        .form-control:focus, .form-select:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25) !important;
          background: white !important;
        }
        
        .form-control:hover, .form-select:hover {
          background: white !important;
          border-color: #667eea !important;
        }
        
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.2) !important;
        }
        
        .btn:disabled {
          transform: none !important;
        }
        
        .card {
          transition: all 0.3s ease;
        }
        
        .invalid-feedback {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

EditDoctor.propTypes = {
  doctorId: PropTypes.string,
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
};

EditDoctor.defaultProps = {
  doctorId: '1',
  onSave: () => {},
  onCancel: () => {},
};

export default EditDoctor;