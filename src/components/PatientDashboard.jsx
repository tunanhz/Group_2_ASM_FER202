import React, { useState, useEffect } from 'react';
import { 
  getPatients, 
  getAppointments, 
  getDiagnosis, 
  getDoctors,
  getPatientStats,
  getPatientAppointments,
  getPatientDiagnosis 
} from '../services/api';

const PatientDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [patientData, setPatientData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [diagnosis, setDiagnosis] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPatientId, setCurrentPatientId] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    shift: '',
    note: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Khởi tạo thông tin user và patient ID
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user && user.userType === 'patient' && user.id) {
      setCurrentUser(user);
      setCurrentPatientId(user.id);
    } else if (!user.userType || user.userType !== 'patient') {
      // Nếu chưa đăng nhập hoặc không phải patient, redirect về login
      window.location.href = '/login';
      return;
    } else {
      // Fallback
      setCurrentPatientId("1");
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!currentPatientId) return; 
      
      try {
        setLoading(true);
        const [patientsRes, appointmentsRes, diagnosisRes, doctorsRes] = await Promise.all([
          getPatients(),
          getAppointments(), 
          getDiagnosis(),
          getDoctors()
        ]);

        const patient = patientsRes.data.find(p => p.id === currentPatientId);
        const patientAppointments = getPatientAppointments(appointmentsRes.data, currentPatientId);
        const patientDiagnosis = getPatientDiagnosis(diagnosisRes.data, currentPatientId);
        const stats = getPatientStats(appointmentsRes.data, diagnosisRes.data, currentPatientId);

        setPatientData(patient);
        setAppointments(patientAppointments);
        setDiagnosis(patientDiagnosis);
        setDoctors(doctorsRes.data);
        setStats(stats);
      } catch (error) {
        console.error('Error fetching patient data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [currentPatientId]); // Dependency: currentPatientId

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.full_name : 'Đang cập nhật';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Confirmed': { class: 'bg-success', text: 'Đã xác nhận' },
      'Pending': { class: 'bg-warning', text: 'Chờ xác nhận' },
      'Completed': { class: 'bg-primary', text: 'Hoàn thành' },
      'Cancelled': { class: 'bg-danger', text: 'Đã hủy' }
    };
    const config = statusConfig[status] || { class: 'bg-secondary', text: status };
    return <span className={`badge ${config.class} px-3 py-2`}>{config.text}</span>;
  };

  const getShiftText = (shift) => {
    const shiftConfig = {
      'Morning': 'Buổi sáng',
      'Afternoon': 'Buổi chiều', 
      'Evening': 'Buổi tối'
    };
    return shiftConfig[shift] || shift;
  };

  const getAvailableTimes = () => {
    const allTimes = [
      '07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
      '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30',
      '18:00','18:30','19:00','19:30','20:00','20:30'
    ];
    if (!bookingForm.appointmentDate) return allTimes;
    const today = new Date();
    const selectedDate = new Date(bookingForm.appointmentDate);
    today.setHours(0,0,0,0);
    selectedDate.setHours(0,0,0,0);
    if (selectedDate.getTime() !== today.getTime()) return allTimes;
    // Nếu là hôm nay, chỉ lấy giờ >= hiện tại
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return allTimes.filter(time => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m >= currentMinutes;
    });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Kiểm tra ngày không được là quá khứ
      const today = new Date();
      today.setHours(0,0,0,0);
      const selectedDate = new Date(bookingForm.appointmentDate);
      selectedDate.setHours(0,0,0,0);
      if (selectedDate < today) {
        alert('❌ Không thể đặt lịch cho ngày trong quá khứ!');
        setSubmitting(false);
        return;
      }
      // Kiểm tra giờ không được là quá khứ nếu đặt hôm nay
      if (selectedDate.getTime() === today.getTime()) {
        const now = new Date();
        const [h, m] = bookingForm.appointmentTime.split(':').map(Number);
        const selectedMinutes = h * 60 + m;
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        if (selectedMinutes < nowMinutes) {
          alert('❌ Không thể đặt giờ trong quá khứ!');
          setSubmitting(false);
          return;
        }
      }
      const appointmentDateTime = `${bookingForm.appointmentDate} ${bookingForm.appointmentTime}:00`;
      
      const newAppointment = {
        doctor_id: bookingForm.doctorId,
        patient_id: currentPatientId,
        appointment_datetime: appointmentDateTime,
        receptionist_id: "1", // Default receptionist
        shift: bookingForm.shift,
        status: "Pending",
        note: bookingForm.note || "Đặt lịch qua hệ thống"
      };

      // Thêm appointment mới vào database
      const response = await fetch('http://localhost:9999/Appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAppointment)
      });

      if (response.ok) {
        alert('✅ Đặt lịch khám thành công! Vui lòng chờ xác nhận từ bệnh viện.');
        setShowBookingModal(false);
        setBookingForm({
          doctorId: '',
          appointmentDate: '',
          appointmentTime: '',
          shift: '',
          note: ''
        });
        
        // Refresh data để hiển thị appointment mới
        const [patientsRes, appointmentsRes, diagnosisRes, doctorsRes] = await Promise.all([
          getPatients(),
          getAppointments(), 
          getDiagnosis(),
          getDoctors()
        ]);

        const patientAppointments = getPatientAppointments(appointmentsRes.data, currentPatientId);
        const patientDiagnosis = getPatientDiagnosis(diagnosisRes.data, currentPatientId);
        const stats = getPatientStats(appointmentsRes.data, diagnosisRes.data, currentPatientId);

        setAppointments(patientAppointments);
        setDiagnosis(patientDiagnosis);
        setStats(stats);
      } else {
        alert('❌ Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('❌ Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimeChange = (time) => {
    const hour = parseInt(time.split(':')[0]);
    let shift = '';
    
    if (hour >= 6 && hour < 12) {
      shift = 'Morning';
    } else if (hour >= 12 && hour < 18) {
      shift = 'Afternoon';
    } else {
      shift = 'Evening';
    }
    
    setBookingForm(prev => ({
      ...prev,
      appointmentTime: time,
      shift: shift
    }));
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
          <h5 className="text-muted">Đang tải thông tin bệnh nhân...</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-dashboard min-vh-100" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paddingTop: '100px'
    }}>
      <div className="container-fluid px-4">
        {/* Header Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-lg" style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
              borderRadius: '20px'
            }}>
              <div className="card-body p-4 text-white">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <div className="d-flex align-items-center mb-3">
                      <div className="avatar-container me-4">
                        <div className="rounded-circle bg-white d-flex align-items-center justify-content-center" 
                             style={{ width: '80px', height: '80px' }}>
                          <i className="fas fa-user-circle text-primary" style={{ fontSize: '60px' }}></i>
                        </div>
                      </div>
                      <div>
                        <h2 className="mb-1 fw-bold">
                          Xin chào, {patientData?.full_name || currentUser?.username || 'Bệnh nhân'}! 👋
                        </h2>
                        <p className="mb-0 opacity-90">
                          <i className="fas fa-map-marker-alt me-2"></i>
                          {patientData?.address || 'Đang cập nhật...'}
                        </p>
                        <p className="mb-0 opacity-90">
                          <i className="fas fa-phone me-2"></i>
                          {patientData?.phone || 'Đang cập nhật...'}
                        </p>
                        <p className="mb-0 opacity-90">
                          <i className="fas fa-envelope me-2"></i>
                          {currentUser?.email || 'Đang cập nhật...'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 text-md-end">
                    <div className="digital-clock">
                      <h4 className="mb-1 fw-bold">
                        {currentTime.toLocaleTimeString('vi-VN')}
                      </h4>
                      <p className="mb-2 opacity-90">
                        {currentTime.toLocaleDateString('vi-VN', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <button 
                        className="btn btn-outline-light btn-sm rounded-pill px-3"
                        onClick={() => {
                          localStorage.removeItem('user');
                          window.location.href = '/login';
                        }}
                      >
                        <i className="fas fa-sign-out-alt me-2"></i>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <i className="fas fa-calendar-check text-success" style={{ fontSize: '3rem' }}></i>
                </div>
                <h3 className="fw-bold text-success mb-1">{stats.totalAppointments || 0}</h3>
                <p className="text-muted mb-0">Tổng lịch hẹn</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <i className="fas fa-stethoscope text-primary" style={{ fontSize: '3rem' }}></i>
                </div>
                <h3 className="fw-bold text-primary mb-1">{stats.completedAppointments || 0}</h3>
                <p className="text-muted mb-0">Đã khám</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <i className="fas fa-clock text-warning" style={{ fontSize: '3rem' }}></i>
                </div>
                <h3 className="fw-bold text-warning mb-1">{stats.pendingAppointments || 0}</h3>
                <p className="text-muted mb-0">Chờ xác nhận</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <i className="fas fa-notes-medical text-info" style={{ fontSize: '3rem' }}></i>
                </div>
                <h3 className="fw-bold text-info mb-1">{stats.totalDiagnosis || 0}</h3>
                <p className="text-muted mb-0">Chẩn đoán</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
              <div className="card-body p-0">
                <nav className="nav nav-pills nav-fill p-3" style={{ background: 'rgba(102, 126, 234, 0.1)', borderRadius: '15px' }}>
                  <button 
                    className={`nav-link mx-2 px-4 py-3 fw-bold ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                    style={{ 
                      borderRadius: '10px',
                      background: activeTab === 'overview' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'
                    }}
                  >
                    <i className="fas fa-chart-line me-2"></i>Tổng quan
                  </button>
                  <button 
                    className={`nav-link mx-2 px-4 py-3 fw-bold ${activeTab === 'appointments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('appointments')}
                    style={{ 
                      borderRadius: '10px',
                      background: activeTab === 'appointments' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'
                    }}
                  >
                    <i className="fas fa-calendar-alt me-2"></i>Lịch khám
                  </button>
                  <button 
                    className={`nav-link mx-2 px-4 py-3 fw-bold ${activeTab === 'medical' ? 'active' : ''}`}
                    onClick={() => setActiveTab('medical')}
                    style={{ 
                      borderRadius: '10px',
                      background: activeTab === 'medical' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'
                    }}
                  >
                    <i className="fas fa-file-medical me-2"></i>Hồ sơ bệnh án
                  </button>
                  <button 
                    className={`nav-link mx-2 px-4 py-3 fw-bold ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                    style={{ 
                      borderRadius: '10px',
                      background: activeTab === 'profile' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'
                    }}
                  >
                    <i className="fas fa-user-edit me-2"></i>Thông tin cá nhân
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="row">
          <div className="col-12">
            {activeTab === 'overview' && (
              <div className="card border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                <div className="card-body p-4">
                  <h4 className="fw-bold mb-4">
                    <i className="fas fa-chart-line text-primary me-3"></i>
                    Tổng quan sức khỏe
                  </h4>
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <div className="bg-light p-4 rounded-3">
                        <h6 className="fw-bold text-primary mb-3">
                          <i className="fas fa-calendar-check me-2"></i>
                          Lịch hẹn gần nhất
                        </h6>
                        {appointments.length > 0 ? (
                          <div className="appointment-card">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <p className="mb-1 fw-bold">
                                  BS. {getDoctorName(appointments[0].doctor_id)}
                                </p>
                                <p className="mb-1 text-muted small">
                                  {new Date(appointments[0].appointment_datetime).toLocaleString('vi-VN')}
                                </p>
                                <p className="mb-1 text-muted small">
                                  {getShiftText(appointments[0].shift)}
                                </p>
                              </div>
                              {getStatusBadge(appointments[0].status)}
                            </div>
                            <p className="mb-0 text-muted small">
                              <i className="fas fa-notes-medical me-1"></i>
                              {appointments[0].note}
                            </p>
                          </div>
                        ) : (
                          <p className="text-muted">Không có lịch hẹn nào</p>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6 mb-4">
                      <div className="bg-light p-4 rounded-3">
                        <h6 className="fw-bold text-success mb-3">
                          <i className="fas fa-heartbeat me-2"></i>
                          Tình trạng sức khỏe
                        </h6>
                        {diagnosis.length > 0 ? (
                          <div className="diagnosis-card">
                            <p className="mb-2 fw-bold text-success">
                              Chẩn đoán gần nhất: {diagnosis[0].disease}
                            </p>
                            <p className="mb-2 text-muted small">
                              <strong>Kết luận:</strong> {diagnosis[0].conclusion}
                            </p>
                            <p className="mb-0 text-muted small">
                              <strong>Phương pháp điều trị:</strong> {diagnosis[0].treatment_plan}
                            </p>
                          </div>
                        ) : (
                          <p className="text-muted">Chưa có chẩn đoán nào</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="card border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">
                      <i className="fas fa-calendar-alt text-primary me-3"></i>
                      Lịch khám của tôi
                    </h4>
                    <button 
                      className="btn btn-primary rounded-pill px-4"
                      onClick={() => setShowBookingModal(true)}
                    >
                      <i className="fas fa-plus me-2"></i>Đặt lịch khám
                    </button>
                  </div>
                  
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <tr className="text-white">
                          <th className="border-0 py-3">Thời gian</th>
                          <th className="border-0 py-3">Bác sĩ</th>
                          <th className="border-0 py-3">Ca khám</th>
                          <th className="border-0 py-3">Trạng thái</th>
                          <th className="border-0 py-3">Ghi chú</th>
                          <th className="border-0 py-3">Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((appointment) => (
                          <tr key={appointment.id} className="align-middle">
                            <td className="py-3">
                              <div>
                                <div className="fw-bold">
                                  {new Date(appointment.appointment_datetime).toLocaleDateString('vi-VN')}
                                </div>
                                <div className="text-muted small">
                                  {new Date(appointment.appointment_datetime).toLocaleTimeString('vi-VN', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              <div className="fw-bold">BS. {getDoctorName(appointment.doctor_id)}</div>
                            </td>
                            <td className="py-3">
                              <span className="badge bg-info px-3 py-2">
                                {getShiftText(appointment.shift)}
                              </span>
                            </td>
                            <td className="py-3">{getStatusBadge(appointment.status)}</td>
                            <td className="py-3">
                              <span className="text-muted">{appointment.note}</span>
                            </td>
                            <td className="py-3">
                              <div className="btn-group">
                                <button className="btn btn-sm btn-outline-primary">
                                  <i className="fas fa-eye"></i>
                                </button>
                                {appointment.status === 'Pending' && (
                                  <button className="btn btn-sm btn-outline-danger">
                                    <i className="fas fa-times"></i>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {appointments.length === 0 && (
                    <div className="text-center py-5">
                      <div className="mb-3">
                        <i className="fas fa-calendar-times text-muted" style={{ fontSize: '4rem' }}></i>
                      </div>
                      <h5 className="text-muted">Chưa có lịch khám nào</h5>
                      <p className="text-muted">Hãy đặt lịch khám để được chăm sóc sức khỏe tốt nhất!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'medical' && (
              <div className="card border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                <div className="card-body p-4">
                  <h4 className="fw-bold mb-4">
                    <i className="fas fa-file-medical text-primary me-3"></i>
                    Hồ sơ bệnh án
                  </h4>
                  
                  <div className="row">
                    {diagnosis.map((diag, index) => (
                      <div key={diag.id} className="col-md-6 mb-4">
                        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                          <div className="card-header border-0 text-white" style={{
                            background: `linear-gradient(135deg, ${index % 2 === 0 ? '#ff6b6b 0%, #ee5a24 100%' : '#4ecdc4 0%, #44a08d 100%'})`,
                            borderRadius: '15px 15px 0 0'
                          }}>
                            <h6 className="fw-bold mb-0">
                              <i className="fas fa-stethoscope me-2"></i>
                              Chẩn đoán #{diag.id}
                            </h6>
                          </div>
                          <div className="card-body p-4">
                            <div className="mb-3">
                              <h6 className="fw-bold text-danger">{diag.disease}</h6>
                            </div>
                            <div className="mb-3">
                              <p className="text-muted mb-1"><strong>Kết luận:</strong></p>
                              <p className="mb-0">{diag.conclusion}</p>
                            </div>
                            <div className="mb-3">
                              <p className="text-muted mb-1"><strong>Phương pháp điều trị:</strong></p>
                              <p className="mb-0">{diag.treatment_plan}</p>
                            </div>
                            <div className="text-end">
                              <span className="badge bg-light text-dark">
                                BS. {getDoctorName(diag.doctor_id)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {diagnosis.length === 0 && (
                    <div className="text-center py-5">
                      <div className="mb-3">
                        <i className="fas fa-file-medical text-muted" style={{ fontSize: '4rem' }}></i>
                      </div>
                      <h5 className="text-muted">Chưa có hồ sơ bệnh án nào</h5>
                      <p className="text-muted">Hồ sơ bệnh án sẽ xuất hiện sau khi bạn được khám bệnh.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="card border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">
                      <i className="fas fa-user-edit text-primary me-3"></i>
                      Thông tin cá nhân
                    </h4>
                    <button className="btn btn-primary rounded-pill px-4">
                      <i className="fas fa-edit me-2"></i>Chỉnh sửa
                    </button>
                  </div>
                  
                  {patientData && (
                    <div className="row">
                      <div className="col-md-6">
                        <div className="bg-light p-4 rounded-3">
                          <h6 className="fw-bold text-primary mb-3">Thông tin cơ bản</h6>
                          <div className="mb-3">
                            <label className="form-label text-muted">Họ và tên</label>
                            <p className="fw-bold">{patientData.full_name}</p>
                          </div>
                          <div className="mb-3">
                            <label className="form-label text-muted">Ngày sinh</label>
                            <p className="fw-bold">
                              {new Date(patientData.dob).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <div className="mb-3">
                            <label className="form-label text-muted">Giới tính</label>
                            <p className="fw-bold">
                              <i className={`fas ${patientData.gender === 'Nam' ? 'fa-mars text-primary' : 'fa-venus text-danger'} me-2`}></i>
                              {patientData.gender}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="bg-light p-4 rounded-3">
                          <h6 className="fw-bold text-success mb-3">Thông tin liên hệ</h6>
                          <div className="mb-3">
                            <label className="form-label text-muted">Số điện thoại</label>
                            <p className="fw-bold">
                              <i className="fas fa-phone text-success me-2"></i>
                              {patientData.phone}
                            </p>
                          </div>
                          <div className="mb-3">
                            <label className="form-label text-muted">Địa chỉ</label>
                            <p className="fw-bold">
                              <i className="fas fa-map-marker-alt text-danger me-2"></i>
                              {patientData.address}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      
        {showBookingModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content" style={{ borderRadius: '20px', border: 'none' }}>
                <div className="modal-header border-0 text-white" style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '20px 20px 0 0'
                }}>
                  <h5 className="modal-title fw-bold">
                    <i className="fas fa-calendar-plus me-3"></i>
                    Đặt lịch khám bệnh
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={() => setShowBookingModal(false)}
                  ></button>
                </div>
                
                <div className="modal-body p-4">
                  <form onSubmit={handleBookingSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          <i className="fas fa-user-md text-primary me-2"></i>
                          Chọn bác sĩ
                        </label>
                        <select 
                          className="form-select form-select-lg"
                          value={bookingForm.doctorId}
                          onChange={(e) => setBookingForm(prev => ({...prev, doctorId: e.target.value}))}
                          required
                          style={{ borderRadius: '10px' }}
                        >
                          <option value="">-- Chọn bác sĩ --</option>
                          {doctors.map(doctor => (
                            <option key={doctor.id} value={doctor.id}>
                              BS. {doctor.full_name} - {doctor.department}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          <i className="fas fa-calendar text-success me-2"></i>
                          Ngày khám
                        </label>
                        <input 
                          type="date"
                          className="form-control form-control-lg"
                          value={bookingForm.appointmentDate}
                          onChange={(e) => setBookingForm(prev => ({...prev, appointmentDate: e.target.value}))}
                          min={new Date().toISOString().split('T')[0]}
                          required
                          style={{ borderRadius: '10px' }}
                        />
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          <i className="fas fa-clock text-warning me-2"></i>
                          Giờ khám
                        </label>
                        <select 
                          className="form-select form-select-lg"
                          value={bookingForm.appointmentTime}
                          onChange={(e) => handleTimeChange(e.target.value)}
                          required
                          style={{ borderRadius: '10px' }}
                        >
                          <option value="">-- Chọn giờ --</option>
                          <optgroup label="🌅 Buổi sáng (6:00 - 12:00)">
                            {getAvailableTimes().filter(t => t >= '07:00' && t < '12:00').map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </optgroup>
                          <optgroup label="🌞 Buổi chiều (12:00 - 18:00)">
                            {getAvailableTimes().filter(t => t >= '13:00' && t < '18:00').map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </optgroup>
                          <optgroup label="🌙 Buổi tối (18:00 - 21:00)">
                            {getAvailableTimes().filter(t => t >= '18:00').map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </optgroup>
                        </select>
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          <i className="fas fa-sun text-info me-2"></i>
                          Ca khám
                        </label>
                        <input 
                          type="text"
                          className="form-control form-control-lg"
                          value={getShiftText(bookingForm.shift)}
                          readOnly
                          placeholder="Sẽ tự động chọn theo giờ"
                          style={{ borderRadius: '10px', backgroundColor: '#f8f9fa' }}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="form-label fw-bold">
                        <i className="fas fa-notes-medical text-danger me-2"></i>
                        Ghi chú (không bắt buộc)
                      </label>
                      <textarea 
                        className="form-control"
                        rows="3"
                        value={bookingForm.note}
                        onChange={(e) => setBookingForm(prev => ({...prev, note: e.target.value}))}
                        placeholder="Mô tả triệu chứng hoặc lý do khám..."
                        style={{ borderRadius: '10px' }}
                      ></textarea>
                    </div>
                    
                    <div className="d-flex justify-content-end gap-3">
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary btn-lg px-4"
                        onClick={() => setShowBookingModal(false)}
                        style={{ borderRadius: '25px' }}
                      >
                        <i className="fas fa-times me-2"></i>
                        Hủy
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-lg px-4"
                        disabled={submitting}
                        style={{ 
                          borderRadius: '25px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: 'none'
                        }}
                      >
                        {submitting ? (
                          <>
                            <div className="spinner-border spinner-border-sm me-2"></div>
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-calendar-check me-2"></i>
                            Đặt lịch khám
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard; 