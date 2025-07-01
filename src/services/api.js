import axios from 'axios';

// Base URL cho JSON Server (chạy trên port 9999)
const BASE_URL = 'http://localhost:9999';

// Create axios instance
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// API Service Functions
export const apiService = {
    // Doctor related APIs
    getDoctors: () => api.get('/Doctor'),
    getDoctorById: (id) => api.get(`/Doctor/${id}`),
    
    // Patient related APIs
    getPatients: () => api.get('/Patient'),
    getPatientById: (id) => api.get(`/Patient/${id}`),
    
    // Appointment related APIs
    getAppointments: () => api.get('/Appointment'),
    getAppointmentById: (id) => api.get(`/Appointment/${id}`),
    getAppointmentsByDoctorId: (doctorId) => api.get(`/Appointment?doctor_id=${doctorId}`),
    getAppointmentsByDate: (date) => api.get(`/Appointment?appointment_datetime_like=${date}`),
    updateAppointmentStatus: (id, status) => api.patch(`/Appointment/${id}`, { status }),
    createAppointment: (appointmentData) => api.post('/Appointment', appointmentData),
    
    // Diagnosis related APIs
    getDiagnosis: () => api.get('/Diagnosis'),
    getDiagnosisByPatientId: (patientId) => api.get(`/Diagnosis?patient_id=${patientId}`),
    
    // Prescription related APIs
    getPrescriptions: () => api.get('/Prescription'),
    getPrescriptionsByDoctorId: (doctorId) => api.get(`/Prescription?doctor_id=${doctorId}`),
    
    // Exam Results
    getExamResults: () => api.get('/ExamResult'),
    
    // Account related APIs
    getAccountPatients: () => api.get('/AccountPatient'),
    getAccountStaff: () => api.get('/AccountStaff'),
};

// Helper functions for data processing
export const dataHelpers = {
    // Get today's date in YYYY-MM-DD format
    getTodayDate: () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    },
    
    // Filter appointments by date
    filterAppointmentsByDate: (appointments, date) => {
        return appointments.filter(appointment => 
            appointment.appointment_datetime.startsWith(date)
        );
    },
    
    // Filter appointments by status
    filterAppointmentsByStatus: (appointments, status) => {
        return appointments.filter(appointment => 
            appointment.status.toLowerCase() === status.toLowerCase()
        );
    },
    
    // Get appointment statistics
    getAppointmentStats: (appointments) => {
        const today = dataHelpers.getTodayDate();
        const todayAppointments = dataHelpers.filterAppointmentsByDate(appointments, today);
        
        return {
            todayTotal: todayAppointments.length,
            todayCompleted: dataHelpers.filterAppointmentsByStatus(todayAppointments, 'Completed').length,
            todayPending: dataHelpers.filterAppointmentsByStatus(todayAppointments, 'Pending').length,
            todayConfirmed: dataHelpers.filterAppointmentsByStatus(todayAppointments, 'Confirmed').length,
            totalAppointments: appointments.length
        };
    },
    
    // Format datetime for display
    formatDateTime: (dateTimeString) => {
        const date = new Date(dateTimeString);
        return {
            date: date.toLocaleDateString('vi-VN'),
            time: date.toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            }),
            dayOfWeek: date.toLocaleDateString('vi-VN', { weekday: 'long' })
        };
    },
    
    // Get status color
    getStatusColor: (status) => {
        switch(status?.toLowerCase()) {
            case 'completed': return '#10b981';
            case 'confirmed': return '#3b82f6';
            case 'pending': return '#f59e0b';
            case 'cancelled': return '#ef4444';
            default: return '#6b7280';
        }
    },
    
    // Get status text in Vietnamese
    getStatusText: (status) => {
        switch(status?.toLowerCase()) {
            case 'completed': return 'Hoàn thành';
            case 'confirmed': return 'Đã xác nhận';
            case 'pending': return 'Chờ xác nhận';
            case 'cancelled': return 'Đã hủy';
            default: return 'Không xác định';
        }
    }
};

// Error handling wrapper
export const handleApiError = (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
        // Server responded with error status
        return {
            success: false,
            message: `Lỗi server: ${error.response.status} - ${error.response.statusText}`,
            data: null
        };
    } else if (error.request) {
        // Request was made but no response received
        return {
            success: false,
            message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
            data: null
        };
    } else {
        // Something else happened
        return {
            success: false,
            message: `Lỗi không xác định: ${error.message}`,
            data: null
        };
    }
};

// Success response wrapper
export const handleApiSuccess = (response) => {
    return {
        success: true,
        message: 'Thành công',
        data: response.data
    };
};

// Simplified export functions for components
export const getDoctors = () => apiService.getDoctors().then(handleApiSuccess).catch(handleApiError);
export const getPatients = () => apiService.getPatients().then(handleApiSuccess).catch(handleApiError);
export const getAppointments = () => apiService.getAppointments().then(handleApiSuccess).catch(handleApiError);
export const getDiagnosis = () => apiService.getDiagnosis().then(handleApiSuccess).catch(handleApiError);
export const updateAppointmentStatus = (id, status) => apiService.updateAppointmentStatus(id, status).then(handleApiSuccess).catch(handleApiError);
export const createAppointment = (appointmentData) => apiService.createAppointment(appointmentData).then(handleApiSuccess).catch(handleApiError);

// Patient-specific helper functions
export const getPatientAppointments = (appointments, patientId) => {
    return appointments
        .filter(appointment => appointment.patient_id === patientId)
        .sort((a, b) => new Date(b.appointment_datetime) - new Date(a.appointment_datetime));
};

export const getPatientDiagnosis = (diagnosis, patientId) => {
    // For diagnosis, we need to find matching through medicineRecord_id or patient relation
    // Since we don't have direct patient_id in diagnosis, we'll return all for now
    return diagnosis.slice(0, 5); // Return first 5 diagnosis as example
};

export const getPatientStats = (appointments, diagnosis, patientId) => {
    const patientAppointments = getPatientAppointments(appointments, patientId);
    const patientDiagnosis = getPatientDiagnosis(diagnosis, patientId);
    
    return {
        totalAppointments: patientAppointments.length,
        completedAppointments: patientAppointments.filter(apt => apt.status === 'Completed').length,
        pendingAppointments: patientAppointments.filter(apt => apt.status === 'Pending').length,
        confirmedAppointments: patientAppointments.filter(apt => apt.status === 'Confirmed').length,
        totalDiagnosis: patientDiagnosis.length
    };
};

export default api; 