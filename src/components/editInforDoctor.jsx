import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import imageCompression from 'browser-image-compression';

const EditDoctor = ({ doctorId = '5', onSave = () => {}, onCancel = () => {} }) => {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const doctorResponse = await fetch(`http://localhost:9999/Doctor/${doctorId}`);
        if (!doctorResponse.ok) {
          throw new Error('Không thể tải thông tin bác sĩ');
        }
        const doctorData = await doctorResponse.json();

        const accountResponse = await fetch(`http://localhost:9999/AccountStaff/${doctorData.account_staff_id}`);
        if (!accountResponse.ok) {
          throw new Error('Không thể tải thông tin tài khoản');
        }
        const accountData = await accountResponse.json();

        setFormData({
          full_name: doctorData.full_name || '',
          department: doctorData.department || '',
          phone: doctorData.phone || '',
          eduLevel: doctorData.eduLevel || '',
          img: null,
          imgPreview: accountData.img || 'default.png',
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [doctorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      <div className="d-flex justify-content-center align-items-center h-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center p-4 mx-auto" style={{ maxWidth: '700px' }} role="alert">
        <strong>Lỗi:</strong> {error}
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="card shadow-sm border-0 rounded-4 mx-auto" style={{ maxWidth: '800px' }}>
        <div className="card-body p-4">
          <div className="row g-4">
            <div className="col-md-4 text-center">
              <div className="position-relative">
                <img
                  src={formData.imgPreview}
                  alt="Ảnh đại diện"
                  className="img-fluid rounded-3"
                  style={{ width: '350px', height: '350px', objectFit: 'cover' }}
                />
                {formData.imgPreview === 'default.png' && (
                  <div className="position-absolute top-50 start-50 translate-middle text-dark" style={{ fontSize: '2rem' }}>
                  </div>
                )}
              </div>
              <p className="mt-3 mb-1 text-muted">Doctor Profile</p>
              <button
                type="button"
                className="btn btn-link text-decoration-none text-primary"
                onClick={() => document.getElementById('img').click()}
              >
                Upload A New Image
              </button>
              <input
                type="file"
                id="img"
                name="img"
                accept="image/*"
                onChange={handleImageChange}
                className="d-none"
              />
            </div>
            <div className="col-md-8">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="full_name" className="form-label fw-semibold text-dark">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="form-control form-control-lg rounded-3"
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="department" className="form-label fw-semibold text-dark">
                      Department *
                    </label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="form-control form-control-lg rounded-3"
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="phone" className="form-label fw-semibold text-dark">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-control form-control-lg rounded-3"
                      pattern="[0-9]{10}"
                      placeholder="Nhập số điện thoại (10 số)"
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="eduLevel" className="form-label fw-semibold text-dark">
                      Education Level *
                    </label>
                    <select
                      id="eduLevel"
                      name="eduLevel"
                      value={formData.eduLevel}
                      onChange={handleChange}
                      className="form-select form-control-lg rounded-3"
                      required
                    >
                      <option value="">Chọn trình độ</option>
                      <option value="Tiến sĩ">Tiến sĩ</option>
                      <option value="Thạc sĩ">Thạc sĩ</option>
                      <option value="Bác sĩ CKI">Bác sĩ CKI</option>
                      <option value="Bác sĩ CKII">Bác sĩ CKII</option>
                      <option value="Phó giáo sư">Phó giáo sư</option>
                    </select>
                  </div>
                </div>
                <div className="d-flex justify-content-end mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg px-4 rounded-3"
                    disabled={loading}
                  >
                    Save Changes <i className="bi bi-plus-lg"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .card {
          background: #f8f9fa;
        }
        .img-fluid {
          border: 1px solid #dee2e6;
        }
        .btn-primary {
          background-color: #6c757d;
          border-color: #6c757d;
        }
        .btn-primary:hover:enabled {
          background-color: #5a6268;
          border-color: #5a6268;
        }
        .btn-primary:disabled {
          background-color: #ced4da;
          border-color: #ced4da;
          cursor: not-allowed;
        }
        .form-control-lg, .form-select {
          background-color: #e9ecef;
          border: none;
          transition: background-color 0.3s ease;
        }
        .form-control-lg:focus, .form-select:focus {
          background-color: #ffffff;
          box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.25);
        }
        .form-control-lg:hover, .form-select:hover {
          background-color: #dee2e6;
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