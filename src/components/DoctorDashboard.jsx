import React, { useState, useEffect } from 'react';
import { apiService, dataHelpers, handleApiError, handleApiSuccess } from '../services/api';
import EditDoctor from './editInforDoctor';
import DatabaseGuide from './DatabaseGuide';

const DoctorDashboard = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [appointments, setAppointments] = useState([]);
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [departmentStats, setDepartmentStats] = useState([]);
    const [recentPatients, setRecentPatients] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentDoctor, setCurrentDoctor] = useState(null);
    const [stats, setStats] = useState({
        todayPatients: 0,
        totalPatients: 0,
        pendingAppointments: 0,
        completedToday: 0
    });

    // Update time every second for live feel
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch data from database
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Fetch all necessary data in parallel
            const [appointmentsRes, patientsRes, doctorsRes] = await Promise.all([
                apiService.getAppointments(),
                apiService.getPatients(),
                apiService.getDoctors()
            ]);

            const appointmentsData = handleApiSuccess(appointmentsRes).data;
            const patientsData = handleApiSuccess(patientsRes).data;
            const doctorsData = handleApiSuccess(doctorsRes).data;

            // Process appointments with patient names
            const processedAppointments = appointmentsData.map(appointment => {
                const patient = patientsData.find(p => p.id === appointment.patient_id);
                const doctor = doctorsData.find(d => d.id === appointment.doctor_id);
                
                return {
                    ...appointment,
                    patientName: patient ? patient.full_name : 'Không xác định',
                    doctorName: doctor ? doctor.full_name : 'Không xác định',
                    doctorDepartment: doctor ? doctor.department : 'Không xác định',
                    patientGender: patient ? patient.gender : 'N/A',
                    patientPhone: patient ? patient.phone : 'N/A'
                };
            });

            // Filter today's appointments
            const today = dataHelpers.getTodayDate();
            const todayAppts = dataHelpers.filterAppointmentsByDate(processedAppointments, today);

            // Calculate department statistics
            const deptStats = {};
            doctorsData.forEach(doctor => {
                const dept = doctor.department;
                if (!deptStats[dept]) {
                    deptStats[dept] = { count: 0, appointments: 0 };
                }
                deptStats[dept].count++;
                deptStats[dept].appointments += appointmentsData.filter(apt => apt.doctor_id === doctor.id).length;
            });

            const departmentStatistics = Object.entries(deptStats).map(([name, data]) => ({
                name,
                doctorCount: data.count,
                appointmentCount: data.appointments
            })).sort((a, b) => b.appointmentCount - a.appointmentCount);

            // Get recent patients (last 10)
            const recentPatientsData = patientsData
                .slice()
                .sort((a, b) => b.id.localeCompare(a.id))
                .slice(0, 8);

            // Calculate statistics
            const appointmentStats = dataHelpers.getAppointmentStats(appointmentsData);

            // Set current doctor (lấy doctor đầu tiên hoặc từ localStorage nếu có login system)
            const currentDoctorInfo = localStorage.getItem('currentDoctorId') 
                ? doctorsData.find(d => d.id === localStorage.getItem('currentDoctorId'))
                : doctorsData[0]; // Lấy doctor đầu tiên nếu chưa có login system

            setAppointments(processedAppointments);
            setTodayAppointments(todayAppts);
            setPatients(patientsData);
            setDoctors(doctorsData);
            setCurrentDoctor(currentDoctorInfo);
            setDepartmentStats(departmentStatistics);
            setRecentPatients(recentPatientsData);
            setStats({
                todayPatients: todayAppts.length,
                totalPatients: patientsData.length,
                pendingAppointments: appointmentStats.todayPending,
                completedToday: appointmentStats.todayCompleted
            });

        } catch (err) {
            const errorResult = handleApiError(err);
            setError(errorResult.message);
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAppointmentStatus = async (appointmentId, newStatus) => {
        try {
            await apiService.updateAppointmentStatus(appointmentId, newStatus);
            fetchDashboardData();
            
            // Cool notification effect
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
                    ✅ Cập nhật thành công: ${dataHelpers.getStatusText(newStatus)}
                </div>
            `;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
            
        } catch (err) {
            const errorResult = handleApiError(err);
            alert(`Lỗi cập nhật: ${errorResult.message}`);
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            hour12: false 
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('vi-VN', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const getGenderIcon = (gender) => {
        return gender === 'Nam' ? 'fas fa-mars text-primary' : 'fas fa-venus text-danger';
    };

    const handleEditDoctor = () => {
        setShowEditModal(true);
    };

    const handleSaveDoctor = (updatedDoctor) => {
        setShowEditModal(false);
        fetchDashboardData(); // Refresh data after update
    };

    const handleCancelEdit = () => {
        setShowEditModal(false);
    };

    const handleSwitchDoctor = (doctorId) => {
        localStorage.setItem('currentDoctorId', doctorId);
        const selectedDoctor = doctors.find(d => d.id === doctorId);
        setCurrentDoctor(selectedDoctor);
    };

    if (loading) {
        return (
            <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div className="text-center text-white">
                    <div className="spinner-border mb-4" style={{ width: '4rem', height: '4rem' }} role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <h3 className="mb-3">🚀 Đang tải dữ liệu Dashboard...</h3>
                    <p className="mb-0">Vui lòng chờ trong giây lát</p>
                </div>
            </div>
        );
    }

    if (error) {
        return <DatabaseGuide />;
    }

    return (
        <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minHeight: '100vh',
            position: 'relative'
        }}>
            {/* Animated Background Elements */}
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
            
            <div className="container-fluid py-4" style={{ position: 'relative', zIndex: 1 }}>
                {/* Epic Header Section */}
                <div className="row mb-5">
                    <div className="col-12">
                        <div className="card border-0 rounded-4" style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <div className="card-body p-5">
                                <div className="row align-items-center">
                                    <div className="col-md-8">
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="rounded-circle me-4 d-flex align-items-center justify-content-center" style={{
                                                width: '80px',
                                                height: '80px',
                                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                                boxShadow: '0 10px 20px rgba(102, 126, 234, 0.4)'
                                            }}>
                                                <i className="fas fa-user-md text-white" style={{ fontSize: '2rem' }}></i>
                                            </div>
                                            <div>
                                                <h1 className="h2 fw-bold mb-2 text-white" style={{ 
                                                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)' 
                                                }}>
                                                    🩺 Doctor Dashboard Pro
                                                </h1>
                                                {currentDoctor && (
                                                    <div className="mb-2">
                                                        <span className="badge bg-light text-dark rounded-pill px-3 py-2 me-2">
                                                            <i className="fas fa-user-md me-2"></i>
                                                            {currentDoctor.full_name}
                                                        </span>
                                                        <span className="badge bg-success rounded-pill px-3 py-2">
                                                            <i className="fas fa-hospital me-2"></i>
                                                            {currentDoctor.department}
                                                        </span>
                                                    </div>
                                                )}
                                                <p className="mb-0 text-white-50">
                                                    <i className="fas fa-calendar-day me-2"></i>
                                                    {formatDate(currentTime)} • Dữ liệu thời gian thực
                                                </p>
                                            </div>
                                        </div>
                                        <div className="d-flex gap-3">
                                            <button 
                                                className="btn btn-light btn-sm rounded-pill px-4"
                                                onClick={fetchDashboardData}
                                                disabled={loading}
                                                style={{ boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
                                            >
                                                <i className="fas fa-sync-alt me-2"></i>
                                                Làm mới dữ liệu
                                            </button>
                                            <button 
                                                className="btn btn-outline-light btn-sm rounded-pill px-4"
                                                onClick={handleEditDoctor}
                                            >
                                                <i className="fas fa-user-edit me-2"></i>
                                                Chỉnh sửa thông tin
                                            </button>
                                            <div className="dropdown">
                                                <button 
                                                    className="btn btn-outline-light btn-sm rounded-pill px-4 dropdown-toggle"
                                                    type="button"
                                                    data-bs-toggle="dropdown"
                                                    aria-expanded="false"
                                                >
                                                    <i className="fas fa-user-friends me-2"></i>
                                                    Chọn bác sĩ
                                                </button>
                                                <ul className="dropdown-menu">
                                                    {doctors.slice(0, 5).map((doctor) => (
                                                        <li key={doctor.id}>
                                                            <button 
                                                                className={`dropdown-item ${currentDoctor?.id === doctor.id ? 'active' : ''}`}
                                                                onClick={() => handleSwitchDoctor(doctor.id)}
                                                            >
                                                                <i className="fas fa-user-md me-2"></i>
                                                                {doctor.full_name}
                                                                <small className="text-muted d-block">{doctor.department}</small>
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <button className="btn btn-outline-light btn-sm rounded-pill px-4">
                                                <i className="fas fa-download me-2"></i>
                                                Xuất báo cáo
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-md-4 text-end">
                                        <div className="text-center">
                                            <div className="h1 fw-bold mb-2 text-white" style={{ 
                                                fontSize: '3rem',
                                                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                                                fontFamily: 'monospace'
                                            }}>
                                                {formatTime(currentTime)}
                                            </div>
                                            <div className="badge bg-success rounded-pill px-3 py-2">
                                                <i className="fas fa-wifi me-2"></i>
                                                Kết nối Database
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Stats Cards */}
                <div className="row mb-5">
                    {[
                        {
                            title: 'Lịch hẹn hôm nay',
                            value: stats.todayPatients,
                            icon: 'fa-calendar-check',
                            gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
                            shadowColor: 'rgba(102, 126, 234, 0.4)',
                            change: '+12%'
                        },
                        {
                            title: 'Tổng bệnh nhân',
                            value: stats.totalPatients,
                            icon: 'fa-users',
                            gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
                            shadowColor: 'rgba(240, 147, 251, 0.4)',
                            change: '+8%'
                        },
                        {
                            title: 'Chờ xác nhận',
                            value: stats.pendingAppointments,
                            icon: 'fa-clock',
                            gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                            shadowColor: 'rgba(79, 172, 254, 0.4)',
                            change: '-3%'
                        },
                        {
                            title: 'Hoàn thành hôm nay',
                            value: stats.completedToday,
                            icon: 'fa-check-circle',
                            gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                            shadowColor: 'rgba(67, 233, 123, 0.4)',
                            change: '+15%'
                        }
                    ].map((stat, index) => (
                        <div key={index} className="col-xl-3 col-md-6 mb-4">
                            <div 
                                className="card border-0 rounded-4 h-100" 
                                style={{
                                    background: stat.gradient,
                                    boxShadow: `0 20px 40px ${stat.shadowColor}`,
                                    transform: 'translateY(0)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-10px)';
                                    e.currentTarget.style.boxShadow = `0 30px 60px ${stat.shadowColor}`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = `0 20px 40px ${stat.shadowColor}`;
                                }}
                            >
                                <div className="card-body p-4 text-white">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                                            width: '60px',
                                            height: '60px',
                                            background: 'rgba(255,255,255,0.2)',
                                            backdropFilter: 'blur(10px)'
                                        }}>
                                            <i className={`fas ${stat.icon} fs-4`}></i>
                                        </div>
                                        <div className="badge bg-light text-dark rounded-pill px-3">
                                            {stat.change}
                                        </div>
                                    </div>
                                    <div className="h2 fw-bold mb-2" style={{ fontSize: '2.5rem' }}>
                                        {stat.value}
                                    </div>
                                    <div className="fw-semibold opacity-90">{stat.title}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="row">
                    {/* Today's Appointments - Enhanced */}
                    <div className="col-lg-8 mb-4">
                        <div className="card border-0 rounded-4" style={{
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                        }}>
                            <div className="card-header bg-transparent border-0 p-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="fw-bold mb-0 d-flex align-items-center" style={{ color: '#1f2937' }}>
                                        <div className="rounded-circle me-3 d-flex align-items-center justify-content-center" style={{
                                            width: '45px',
                                            height: '45px',
                                            background: 'linear-gradient(135deg, #667eea, #764ba2)'
                                        }}>
                                            <i className="fas fa-calendar-check text-white"></i>
                                        </div>
                                        Lịch hẹn hôm nay 
                                        <span className="badge bg-primary rounded-pill ms-3">{todayAppointments.length}</span>
                                    </h5>
                                    <button className="btn btn-primary rounded-pill px-4" style={{
                                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                        border: 'none',
                                        boxShadow: '0 10px 20px rgba(102, 126, 234, 0.3)'
                                    }}>
                                        <i className="fas fa-plus me-2"></i>Thêm lịch hẹn
                                    </button>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                {todayAppointments.length === 0 ? (
                                    <div className="text-center py-5">
                                        <div className="mb-4">
                                            <i className="fas fa-calendar-times text-muted" style={{ fontSize: '4rem' }}></i>
                                        </div>
                                        <h5 className="text-muted mb-3">Không có lịch hẹn nào hôm nay</h5>
                                        <p className="text-muted">Hãy tận hưởng ngày nghỉ của bạn! 🌟</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' }}>
                                                <tr>
                                                    <th className="border-0 px-4 py-3 fw-bold">⏰ Thời gian</th>
                                                    <th className="border-0 px-4 py-3 fw-bold">👤 Bệnh nhân</th>
                                                    <th className="border-0 px-4 py-3 fw-bold">📝 Ghi chú</th>
                                                    <th className="border-0 px-4 py-3 fw-bold">📊 Trạng thái</th>
                                                    <th className="border-0 px-4 py-3 fw-bold">⚡ Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {todayAppointments.map((appointment, index) => {
                                                    const dateTime = dataHelpers.formatDateTime(appointment.appointment_datetime);
                                                    return (
                                                        <tr key={appointment.id} style={{
                                                            transition: 'all 0.3s ease',
                                                            animation: `slideInUp 0.5s ease-out ${index * 0.1}s both`
                                                        }}>
                                                            <td className="px-4 py-4">
                                                                <div className="d-flex align-items-center">
                                                                    <div className="rounded-circle me-3 d-flex align-items-center justify-content-center" style={{
                                                                        width: '45px',
                                                                        height: '45px',
                                                                        background: 'linear-gradient(135deg, #4facfe, #00f2fe)'
                                                                    }}>
                                                                        <i className="fas fa-clock text-white"></i>
                                                                    </div>
                                                                    <div>
                                                                        <div className="h6 fw-bold mb-1" style={{ color: '#1f2937' }}>
                                                                            {dateTime.time}
                                                                        </div>
                                                                        <small className="text-muted fw-semibold">{appointment.shift}</small>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <div className="d-flex align-items-center">
                                                                    <div className="rounded-circle me-3 d-flex align-items-center justify-content-center" style={{
                                                                        width: '50px',
                                                                        height: '50px',
                                                                        background: 'linear-gradient(135deg, #f093fb, #f5576c)'
                                                                    }}>
                                                                        <i className={getGenderIcon(appointment.patientGender) || 'fas fa-user text-white'}></i>
                                                                    </div>
                                                                    <div>
                                                                        <div className="fw-bold mb-1">{appointment.patientName}</div>
                                                                        <div className="d-flex align-items-center gap-2">
                                                                            <small className="text-muted">ID: {appointment.patient_id}</small>
                                                                            <span className="badge bg-light text-dark rounded-pill small">
                                                                                {appointment.patientGender}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <div className="bg-light rounded-3 p-3">
                                                                    <small className="text-muted fw-semibold">
                                                                        {appointment.note || '📋 Không có ghi chú'}
                                                                    </small>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <span className="badge rounded-pill px-3 py-2 fw-bold" style={{
                                                                    background: `linear-gradient(135deg, ${dataHelpers.getStatusColor(appointment.status)}, ${dataHelpers.getStatusColor(appointment.status)}dd)`,
                                                                    color: 'white',
                                                                    fontSize: '0.8rem',
                                                                    boxShadow: `0 5px 15px ${dataHelpers.getStatusColor(appointment.status)}40`
                                                                }}>
                                                                    {dataHelpers.getStatusText(appointment.status)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <div className="d-flex gap-2">
                                                                    <button 
                                                                        className="btn btn-outline-primary btn-sm rounded-pill"
                                                                        title="Xem chi tiết"
                                                                        style={{ transition: 'all 0.3s ease' }}
                                                                    >
                                                                        <i className="fas fa-eye"></i>
                                                                    </button>
                                                                    {appointment.status !== 'Completed' && (
                                                                        <button 
                                                                            className="btn btn-outline-success btn-sm rounded-pill"
                                                                            title="Hoàn thành"
                                                                            onClick={() => handleUpdateAppointmentStatus(appointment.id, 'Completed')}
                                                                            style={{ transition: 'all 0.3s ease' }}
                                                                        >
                                                                            <i className="fas fa-check"></i>
                                                                        </button>
                                                                    )}
                                                                    <button 
                                                                        className="btn btn-outline-info btn-sm rounded-pill"
                                                                        title="Liên hệ"
                                                                    >
                                                                        <i className="fas fa-phone"></i>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar with Database Info */}
                    <div className="col-lg-4">
                        {/* Department Statistics */}
                        <div className="card border-0 rounded-4 mb-4" style={{
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                        }}>
                            <div className="card-header bg-transparent border-0 p-4">
                                <h5 className="fw-bold mb-0 d-flex align-items-center" style={{ color: '#1f2937' }}>
                                    <div className="rounded-circle me-3 d-flex align-items-center justify-content-center" style={{
                                        width: '45px',
                                        height: '45px',
                                        background: 'linear-gradient(135deg, #43e97b, #38f9d7)'
                                    }}>
                                        <i className="fas fa-hospital text-white"></i>
                                    </div>
                                    📊 Thống kê khoa
                                </h5>
                            </div>
                            <div className="card-body p-4">
                                <div className="d-flex flex-column gap-3">
                                    {departmentStats.slice(0, 5).map((dept, index) => (
                                        <div key={index} className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{
                                            background: `linear-gradient(135deg, ${['#667eea', '#f093fb', '#4facfe', '#43e97b', '#ffeaa7'][index]}20, ${['#764ba2', '#f5576c', '#00f2fe', '#38f9d7', '#fdcb6e'][index]}20)`,
                                            border: `1px solid ${['#667eea', '#f093fb', '#4facfe', '#43e97b', '#ffeaa7'][index]}40`,
                                            animation: `slideInRight 0.5s ease-out ${index * 0.1}s both`
                                        }}>
                                            <div>
                                                <div className="fw-bold">{dept.name}</div>
                                                <small className="text-muted">{dept.doctorCount} bác sĩ</small>
                                            </div>
                                            <div className="text-end">
                                                <div className="h6 fw-bold mb-0" style={{ color: ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#ffeaa7'][index] }}>
                                                    {dept.appointmentCount}
                                                </div>
                                                <small className="text-muted">lịch hẹn</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Patients */}
                        <div className="card border-0 rounded-4 mb-4" style={{
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                        }}>
                            <div className="card-header bg-transparent border-0 p-4">
                                <h5 className="fw-bold mb-0 d-flex align-items-center" style={{ color: '#1f2937' }}>
                                    <div className="rounded-circle me-3 d-flex align-items-center justify-content-center" style={{
                                        width: '45px',
                                        height: '45px',
                                        background: 'linear-gradient(135deg, #f093fb, #f5576c)'
                                    }}>
                                        <i className="fas fa-user-friends text-white"></i>
                                    </div>
                                    👥 Bệnh nhân mới
                                </h5>
                            </div>
                            <div className="card-body p-4">
                                <div className="d-flex flex-column gap-3">
                                    {recentPatients.slice(0, 6).map((patient, index) => (
                                        <div key={patient.id} className="d-flex align-items-center p-3 rounded-3" style={{
                                            background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                                            border: '1px solid #e2e8f0',
                                            transition: 'all 0.3s ease',
                                            animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                                        }}>
                                            <div className="rounded-circle me-3 d-flex align-items-center justify-content-center" style={{
                                                width: '45px',
                                                height: '45px',
                                                background: patient.gender === 'Nam' ? 
                                                    'linear-gradient(135deg, #4facfe, #00f2fe)' : 
                                                    'linear-gradient(135deg, #f093fb, #f5576c)'
                                            }}>
                                                <i className={patient.gender === 'Nam' ? 'fas fa-mars text-white' : 'fas fa-venus text-white'}></i>
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="fw-bold small mb-1">{patient.full_name}</div>
                                                <div className="d-flex align-items-center gap-2">
                                                    <small className="text-muted">ID: {patient.id}</small>
                                                    <span className="badge bg-light text-dark rounded-pill" style={{ fontSize: '0.7rem' }}>
                                                        {patient.gender}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* System Info */}
                        <div className="card border-0 rounded-4" style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.8))',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                        }}>
                            <div className="card-header bg-transparent border-0 p-4">
                                <h5 className="fw-bold mb-0 d-flex align-items-center" style={{ color: '#1f2937' }}>
                                    <div className="rounded-circle me-3 d-flex align-items-center justify-content-center" style={{
                                        width: '45px',
                                        height: '45px',
                                        background: 'linear-gradient(135deg, #667eea, #764ba2)'
                                    }}>
                                        <i className="fas fa-database text-white"></i>
                                    </div>
                                    🖥️ Hệ thống
                                </h5>
                            </div>
                            <div className="card-body p-4">
                                <div className="d-flex flex-column gap-3">
                                    <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{
                                        background: 'linear-gradient(135deg, #667eea20, #764ba220)',
                                        border: '1px solid #667eea40'
                                    }}>
                                        <div>
                                            <div className="fw-bold">💊 Tổng Bác sĩ</div>
                                            <small className="text-muted">Đang hoạt động</small>
                                        </div>
                                        <div className="h4 fw-bold mb-0" style={{ color: '#667eea' }}>
                                            {doctors.length}
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{
                                        background: 'linear-gradient(135deg, #43e97b20, #38f9d720)',
                                        border: '1px solid #43e97b40'
                                    }}>
                                        <div>
                                            <div className="fw-bold">📅 Tổng Lịch hẹn</div>
                                            <small className="text-muted">Tất cả thời gian</small>
                                        </div>
                                        <div className="h4 fw-bold mb-0" style={{ color: '#43e97b' }}>
                                            {appointments.length}
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{
                                        background: 'linear-gradient(135deg, #f093fb20, #f5576c20)',
                                        border: '1px solid #f093fb40'
                                    }}>
                                        <div>
                                            <div className="fw-bold">👨‍⚕️ Khoa điều trị</div>
                                            <small className="text-muted">Chuyên khoa</small>
                                        </div>
                                        <div className="h4 fw-bold mb-0" style={{ color: '#f093fb' }}>
                                            {departmentStats.length}
                                        </div>
                                    </div>
                                    <div className="text-center pt-3">
                                        <div className="badge bg-success rounded-pill px-4 py-2" style={{
                                            fontSize: '1rem',
                                            boxShadow: '0 5px 15px rgba(67, 233, 123, 0.3)'
                                        }}>
                                            <i className="fas fa-circle me-2" style={{ fontSize: '0.6rem' }}></i>
                                            Database Online
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Doctor Modal */}
            {showEditModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '1200px',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        borderRadius: '25px',
                        position: 'relative'
                    }}>
                        <button
                            onClick={handleCancelEdit}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                                border: 'none',
                                color: 'white',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                zIndex: 10000,
                                boxShadow: '0 10px 20px rgba(255, 107, 107, 0.4)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'scale(1)';
                            }}
                        >
                            ✕
                        </button>
                        {currentDoctor && (
                            <EditDoctor
                                doctorId={currentDoctor.id}
                                onSave={handleSaveDoctor}
                                onCancel={handleCancelEdit}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Custom CSS for animations */}
            <style jsx>{`
                @keyframes floating {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    33% { transform: translateY(-10px) rotate(1deg); }
                    66% { transform: translateY(5px) rotate(-1deg); }
                }
                
                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.2) !important;
                }
                
                .card:hover {
                    transform: translateY(-5px);
                }
                
                tr:hover {
                    background: linear-gradient(135deg, #f8fafc, #f1f5f9) !important;
                    transform: scale(1.01);
                }
            `}</style>
        </div>
    );
};

export default DoctorDashboard; 