import React, { useState, useEffect } from 'react';
import { apiService, dataHelpers, handleApiError, handleApiSuccess, deleteAppointment } from '../services/api';
import EditReceptionist from './editInforReceptionist';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReceptionistDashboard = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [receptionists, setReceptionists] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [appointmentStats, setAppointmentStats] = useState([]);
    const [recentPatients, setRecentPatients] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [currentReceptionist, setCurrentReceptionist] = useState(null);
    const [stats, setStats] = useState({
        todayCheckIns: 0,
        totalPatients: 0,
        pendingAppointments: 0,
        completedToday: 0
    });
    const [filterStatus, setFilterStatus] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);

        try {
            const [appointmentsRes, patientsRes, receptionistsRes, doctorsRes] = await Promise.all([
                apiService.getAppointments().catch(() => ({ data: [] })),
                apiService.getPatients().catch(() => ({ data: [] })),
                apiService.getReceptionists().catch(() => ({ data: [] })),
                apiService.getDoctors().catch(() => ({ data: [] }))
            ]);

            const appointmentsData = handleApiSuccess(appointmentsRes).data || [];
            const patientsData = handleApiSuccess(patientsRes).data || [];
            const receptionistsData = handleApiSuccess(receptionistsRes).data || [];
            const doctorsData = handleApiSuccess(doctorsRes).data || [];

            if (receptionistsData.length === 0) {
                setError('Không có dữ liệu lễ tân. Vui lòng thêm dữ liệu vào Receptionist.');
                setLoading(false);
                return;
            }

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

            const today = dataHelpers.getTodayDate();
            const todayAppts = dataHelpers.filterAppointmentsByDate(processedAppointments, today);

            const statusStats = {};
            ['Pending', 'Confirmed', 'Completed', 'Cancelled'].forEach(status => {
                statusStats[status] = processedAppointments.filter(apt => apt.status === status).length;
            });
            const appointmentStatistics = Object.entries(statusStats).map(([status, count]) => ({
                status,
                count
            }));

            const recentPatientsData = patientsData
                .slice()
                .sort((a, b) => b.id.localeCompare(a.id))
                .slice(0, 8);

            const appointmentStatsData = dataHelpers.getAppointmentStats(processedAppointments);

            const currentReceptionistInfo = localStorage.getItem('currentReceptionistId')
                ? receptionistsData.find(r => r.id === localStorage.getItem('currentReceptionistId'))
                : receptionistsData[0];

            if (!currentReceptionistInfo) {
                setError('Không thể xác định lễ tân hiện tại.');
                setLoading(false);
                return;
            }

            setAppointments(processedAppointments);
            setPatients(patientsData);
            setReceptionists(receptionistsData);
            setDoctors(doctorsData);
            setCurrentReceptionist(currentReceptionistInfo);
            setAppointmentStats(appointmentStatistics);
            setRecentPatients(recentPatientsData);
            setStats({
                todayCheckIns: todayAppts.filter(apt => apt.status === 'Confirmed').length,
                totalPatients: patientsData.length,
                pendingAppointments: appointmentStatsData.todayPending,
                completedToday: appointmentStatsData.todayCompleted
            });
        } catch (err) {
            const errorResult = handleApiError(err);
            setError(errorResult.message || 'Không thể tải dữ liệu. Vui lòng kiểm tra kết nối hoặc dữ liệu server.');
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (appointmentId) => {
        try {
            await apiService.checkInAppointment(appointmentId, {
                status: 'Confirmed',
                receptionist_id: currentReceptionist?.id
            });

            const appointment = appointments.find(apt => apt.id === appointmentId);
            if (!appointment) throw new Error('Lịch hẹn không tồn tại');

            const now = new Date();
            const estimatedTime = new Date(now.getTime() + 60 * 60 * 1000);

            const waitlistRes = await apiService.getWaitlist().catch(() => ({ data: [] }));
            const existingWaitlistIds = waitlistRes.data.map(w => parseInt(w.id)) || [];
            const newWaitlistId = Math.max(...existingWaitlistIds, 0) + 1;

            const usedRooms = waitlistRes.data
                .filter(w => new Date(w.estimated_time).toISOString().slice(0, 16) === estimatedTime.toISOString().slice(0, 16))
                .map(w => parseInt(w.room_id)) || [];
            const availableRooms = Array.from({ length: 30 }, (_, i) => i + 1).filter(r => !usedRooms.includes(r));
            const roomId = availableRooms[Math.floor(Math.random() * availableRooms.length)] || 1;

            await apiService.addToWaitlist({
                id: newWaitlistId.toString(),
                patient_id: appointment.patient_id,
                doctor_id: appointment.doctor_id,
                room_id: roomId.toString(),
                registered_at: now.toISOString(),
                estimated_time: estimatedTime.toISOString(),
                visittype: 'Initial',
                status: 'Waiting'
            });

            fetchDashboardData();
            toast.success('✅ Check-in thành công và thêm vào danh sách chờ', {
                position: 'top-right',
                autoClose: 3000
            });
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(`Lỗi check-in: ${errorResult.message}`);
        }
    };

    const handleContactPatient = (phone) => {
        if (phone && phone !== 'N/A') {
            window.location.href = `tel:${phone}`;
            toast.info(`Đang gọi tới ${phone}`);
        } else {
            toast.error('Số điện thoại không khả dụng!');
        }
    };

    const handleViewDetails = (appointment) => {
        setSelectedAppointment(appointment);
        setShowDetailModal(true);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
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

    const handleEditReceptionist = () => {
        setShowEditModal(true);
    };

    const handleSaveReceptionist = () => {
        setShowEditModal(false);
        fetchDashboardData();
    };

    const handleCancelEdit = () => {
        setShowEditModal(false);
    };

    const filteredAppointments = appointments.filter(appointment => {
        const matchesStatus = filterStatus ? appointment.status === filterStatus : true;
        const appointmentDate = appointment.appointment_datetime.split(' ')[0];
        const matchesDate = 
            (!startDate || appointmentDate >= startDate) && 
            (!endDate || appointmentDate <= endDate);
        const matchesSearch = searchQuery
            ? appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              appointment.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
            : true;
        return matchesStatus && matchesDate && matchesSearch;
    });

    const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
    const paginatedAppointments = filteredAppointments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Hủy lịch hẹn
    const handleCancelAppointment = async (appointmentId) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?')) return;
        try {
            await deleteAppointment(appointmentId);
            toast.success('Đã xóa lịch hẹn thành công!');
            fetchDashboardData();
        } catch (err) {
            toast.error('Hủy lịch hẹn thất bại!');
        }
    };

    if (loading) {
        return (
            <div style={{
                background: 'linear-gradient(135deg, #22c1c3 0%, #fdbb2d 100%)',
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

    return (
        <div style={{
            background: 'linear-gradient(135deg, #22c1c3 0%, #fdbb2d 100%)',
            minHeight: '100vh',
            position: 'relative'
        }}>
            <ToastContainer />
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                    radial-gradient(circle at 20% 20%, rgba(34, 193, 195, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(253, 187, 45, 0.3) 0%, transparent 50%)
                `,
                animation: 'floating 6s ease-in-out infinite'
            }}></div>

            <div className="container-fluid py-4" style={{ position: 'relative', zIndex: 1 }}>
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
                                                background: 'linear-gradient(135deg, #22c1c3, #fdbb2d)',
                                                boxShadow: '0 10px 20px rgba(34, 193, 195, 0.4)'
                                            }}>
                                                <i className="fas fa-concierge-bell text-white" style={{ fontSize: '2rem' }}></i>
                                            </div>
                                            <div>
                                                <h1 className="h2 fw-bold mb-2 text-white" style={{
                                                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                                                }}>
                                                    🔔 Receptionist Dashboard
                                                </h1>
                                                {currentReceptionist && (
                                                    <div className="mb-2">
                                                        <span className="badge bg-light text-dark rounded-pill px-3 py-2 me-2">
                                                            <i className="fas fa-user me-2"></i>
                                                            {currentReceptionist.full_name}
                                                        </span>
                                                        <span className="badge bg-success rounded-pill px-3 py-2">
                                                            <i className="fas fa-hospital me-2"></i>
                                                            Lễ tân
                                                        </span>
                                                    </div>
                                                )}
                                                <p className="mb-0 text-white-50">
                                                    <i className="fas fa-calendar-day me-2"></i>
                                                    {formatDate(currentTime)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="d-flex gap-3">
                                            <button
                                                className="btn btn-light btn-sm rounded-pill px-4"
                                                onClick={fetchDashboardData}
                                                disabled={loading}
                                                style={{ boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
                                                aria-label="Làm mới dữ liệu"
                                            >
                                                <i className="fas fa-sync-alt me-2"></i>
                                                Làm mới dữ liệu
                                            </button>
                                            <button
                                                className="btn btn-outline-light btn-sm rounded-pill px-4"
                                                onClick={handleEditReceptionist}
                                                aria-label="Chỉnh sửa thông tin lễ tân"
                                            >
                                                <i className="fas fa-user-edit me-2"></i>
                                                Chỉnh sửa thông tin
                                            </button>
                                            
                                            <Link className="btn btn-outline-light btn-sm rounded-pill px-4" aria-label="Tất Cả Hóa Đơn Thanh Toán" to="/invoives">
                                                <i className="fas fa-file me-2"></i>
                                                Tất Cả Hóa Đơn Thanh Toán
                                            </Link>
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
                                                Chào ngày mới vui vẻ
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mb-5">
                    {[
                        {
                            title: 'Check-in hôm nay',
                            value: stats.todayCheckIns,
                            icon: 'fa-check-square',
                            gradient: 'linear-gradient(135deg, #22c1c3, #fdbb2d)',
                            shadowColor: 'rgba(34, 193, 195, 0.4)',
                            change: '+10%'
                        },
                        {
                            title: 'Tổng bệnh nhân',
                            value: stats.totalPatients,
                            icon: 'fa-users',
                            gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
                            shadowColor: 'rgba(240, 147, 251, 0.4)',
                            change: '+5%'
                        },
                        {
                            title: 'Lịch hẹn chờ',
                            value: stats.pendingAppointments,
                            icon: 'fa-clock',
                            gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                            shadowColor: 'rgba(79, 172, 254, 0.4)',
                            change: '-2%'
                        },
                        {
                            title: 'Hoàn thành hôm nay',
                            value: stats.completedToday,
                            icon: 'fa-check-circle',
                            gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                            shadowColor: 'rgba(67, 233, 123, 0.4)',
                            change: '+12%'
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

                <div className="row mb-4">
                    <div className="col-lg-12">
                        <div className="card border-0 rounded-4 mb-4" style={{
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                        }}>
                            <div className="card-body p-4">
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <label className="form-label fw-bold">Trạng thái</label>
                                        <select
                                            className="form-select rounded-pill"
                                            value={filterStatus}
                                            onChange={(e) => {
                                                setFilterStatus(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <option value="">Tất cả</option>
                                            <option value="Pending">Chờ xác nhận</option>
                                            <option value="Confirmed">Đã xác nhận</option>
                                            <option value="Completed">Hoàn thành</option>
                                            <option value="Cancelled">Đã hủy</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-bold">Từ ngày</label>
                                        <input
                                            type="date"
                                            className="form-control rounded-pill"
                                            value={startDate}
                                            onChange={(e) => {
                                                setStartDate(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-bold">Đến ngày</label>
                                        <input
                                            type="date"
                                            className="form-control rounded-pill"
                                            value={endDate}
                                            onChange={(e) => {
                                                setEndDate(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-bold">Tìm kiếm</label>
                                        <input
                                            type="text"
                                            className="form-control rounded-pill"
                                            placeholder="Tìm theo tên bệnh nhân hoặc bác sĩ"
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 mb-4">
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
                                            background: 'linear-gradient(135deg, #22c1c3, #fdbb2d)'
                                        }}>
                                            <i className="fas fa-calendar-check text-white"></i>
                                        </div>
                                        Tất cả lịch hẹn
                                        <span className="badge bg-primary rounded-pill ms-3">{filteredAppointments.length}</span>
                                    </h5>
                                    <button className="btn btn-primary rounded-pill px-4" style={{
                                        background: 'linear-gradient(135deg, #22c1c3, #fdbb2d)',
                                        border: 'none',
                                        boxShadow: '0 10px 20px rgba(34, 193, 195, 0.3)'
                                    }}>
                                        <i className="fas fa-plus me-2"></i>Thêm lịch hẹn
                                    </button>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                {filteredAppointments.length === 0 ? (
                                    <div className="text-center py-5">
                                        <div className="mb-4">
                                            <i className="fas fa-calendar-times text-muted" style={{ fontSize: '4rem' }}></i>
                                        </div>
                                        <h5 className="text-muted mb-3">Không có lịch hẹn nào</h5>
                                        <p className="text-muted">Hãy thêm lịch hẹn mới hoặc thay đổi bộ lọc! 🌟</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="table-responsive">
                                            <table className="table table-hover mb-0">
                                                <thead style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' }}>
                                                    <tr>
                                                        <th className="border-0 px-4 py-3 fw-bold">ID</th>
                                                        <th className="border-0 px-4 py-3 fw-bold">⏰ Thời gian</th>
                                                        <th className="border-0 px-4 py-3 fw-bold">👤 Bệnh nhân</th>
                                                        <th className="border-0 px-4 py-3 fw-bold">👨‍⚕️ Bác sĩ</th>
                                                        <th className="border-0 px-4 py-3 fw-bold">🔄 Ca</th>
                                                        <th className="border-0 px-4 py-3 fw-bold">📝 Ghi chú</th>
                                                        <th className="border-0 px-4 py-3 fw-bold">📊 Trạng thái</th>
                                                        <th className="border-0 px-4 py-3 fw-bold">⚡ Thao tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paginatedAppointments.map((appointment, index) => {
                                                        const dateTime = dataHelpers.formatDateTime(appointment.appointment_datetime);
                                                        return (
                                                            <tr key={appointment.id} style={{
                                                                transition: 'all 0.3s ease',
                                                                animation: `slideInUp 0.5s ease-out ${index * 0.1}s both`
                                                            }}>
                                                                <td className="px-4 py-4">{appointment.id}</td>
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
                                                                                {dateTime.time} {dateTime.date}
                                                                            </div>
                                                                            <small className="text-muted fw-semibold">{dataHelpers.getShift(appointment.shift) || 'N/A'}</small>
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
                                                                    <div className="fw-bold mb-1">{appointment.doctorName}</div>
                                                                    <small className="text-muted">{appointment.doctorDepartment}</small>
                                                                </td>
                                                                <td className="px-4 py-4">
                                                                    <div className="fw-bold mb-1">{dataHelpers.getShift(appointment.shift)}</div>
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
                                                                            onClick={() => handleViewDetails(appointment)}
                                                                            style={{ transition: 'all 0.3s ease' }}
                                                                            aria-label="Xem chi tiết lịch hẹn"
                                                                        >
                                                                            <i className="fas fa-eye"></i>
                                                                        </button>
                                                                        {appointment.status === 'Pending' && (
                                                                            <button
                                                                                className="btn btn-outline-success btn-sm rounded-pill"
                                                                                title="Check-in"
                                                                                onClick={() => handleCheckIn(appointment.id)}
                                                                                style={{ transition: 'all 0.3s ease' }}
                                                                                aria-label="Check-in lịch hẹn"
                                                                            >
                                                                                <i className="fas fa-check"></i>
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            className="btn btn-outline-info btn-sm rounded-pill"
                                                                            title="Liên hệ"
                                                                            onClick={() => handleContactPatient(appointment.patientPhone)}
                                                                            disabled={appointment.patientPhone === 'N/A'}
                                                                            style={{ transition: 'all 0.3s ease' }}
                                                                            aria-label="Liên hệ bệnh nhân"
                                                                        >
                                                                            <i className="fas fa-phone"></i>
                                                                        </button>
                                                                        {(appointment.status === 'Pending' || appointment.status === 'Confirmed') && (
                                                                            <button
                                                                                className="btn btn-outline-danger btn-sm rounded-pill"
                                                                                title="Hủy lịch hẹn"
                                                                                onClick={() => handleCancelAppointment(appointment.id)}
                                                                                style={{ transition: 'all 0.3s ease' }}
                                                                                aria-label="Hủy lịch hẹn"
                                                                            >
                                                                                <i className="fas fa-times"></i>
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="d-flex justify-content-center mt-3 mb-3">
                                            <button
                                                className="btn btn-outline-primary me-2"
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage(currentPage - 1)}
                                                aria-label="Trang trước"
                                            >
                                                Trước
                                            </button>
                                            <span className="align-self-center">
                                                Trang {currentPage} / {totalPages}
                                            </span>
                                            <button
                                                className="btn btn-outline-primary ms-2"
                                                disabled={currentPage >= totalPages}
                                                onClick={() => setCurrentPage(currentPage + 1)}
                                                aria-label="Trang sau"
                                            >
                                                Sau
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {showEditModal && currentReceptionist && (
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
                                aria-label="Đóng modal"
                            >
                                ✕
                            </button>
                            <EditReceptionist
                                receptionistId={currentReceptionist.id}
                                onSave={handleSaveReceptionist}
                                onCancel={handleCancelEdit}
                            />
                        </div>
                    </div>
                )}

                {showDetailModal && selectedAppointment && (
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
                            maxWidth: '600px',
                            background: 'white',
                            borderRadius: '15px',
                            padding: '20px',
                            position: 'relative'
                        }}>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    background: 'red',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '30px',
                                    height: '30px',
                                    cursor: 'pointer'
                                }}
                                aria-label="Đóng modal chi tiết"
                            >
                                ✕
                            </button>
                            <h3>Chi tiết lịch hẹn</h3>
                            <p><strong>ID:</strong> {selectedAppointment.id}</p>
                            <p><strong>Bệnh nhân:</strong> {selectedAppointment.patientName}</p>
                            <p><strong>Bác sĩ:</strong> {selectedAppointment.doctorName}</p>
                            <p><strong>Khoa:</strong> {selectedAppointment.doctorDepartment}</p>
                            <p><strong>Thời gian:</strong> {dataHelpers.formatDateTime(selectedAppointment.appointment_datetime).time} {dataHelpers.formatDateTime(selectedAppointment.appointment_datetime).date}</p>
                            <p><strong>Ca:</strong> {selectedAppointment.shift || 'N/A'}</p>
                            <p><strong>Ghi chú:</strong> {selectedAppointment.note || 'Không có ghi chú'}</p>
                            <p><strong>Trạng thái:</strong> {dataHelpers.getStatusText(selectedAppointment.status)}</p>
                            <p><strong>Số điện thoại:</strong> {selectedAppointment.patientPhone}</p>
                        </div>
                    </div>
                )}

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
                        boxShadow: 0 10px 20px rgba(0,0,0,0.2) !important;
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
        </div>
    );
};

export default ReceptionistDashboard;