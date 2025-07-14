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
    
    // Waitlist related APIs
    getWaitlist: () => api.get('/Waitlist'),
    getWaitlistByDoctorId: (doctorId) => api.get(`/Waitlist?doctor_id=${doctorId}`),
    updateWaitlistStatus: (id, status) => api.patch(`/Waitlist/${id}`, { status }),
    updateWaitlistStatusAndVisitType: (id, status, visittype) => api.patch(`/Waitlist/${id}`, { status, visittype }),
    
    // ExamResult related APIs
    getExamResults: () => api.get('/ExamResult'),
    getExamResultsByDoctorId: (doctorId) => api.get(`/ExamResult?doctor_id=${doctorId}`),
    getExamResultByMedicineRecordId: (medicineRecordId) => api.get(`/ExamResult?medicineRecord_id=${medicineRecordId}`),
    createExamResult: (examData) => api.post('/ExamResult', examData),
    updateExamResult: (id, examData) => api.patch(`/ExamResult/${id}`, examData),
    
    // Medicine Records related APIs
    getMedicineRecords: () => api.get('/MedicineRecords'),
    getMedicineRecordByPatientId: (patientId) => api.get(`/MedicineRecords?patient_id=${patientId}`),
    createMedicineRecord: (recordData) => api.post('/MedicineRecords', recordData),
    
    // Room related APIs
    getRooms: () => api.get('/Room'),
    getRoomById: (id) => api.get(`/Room/${id}`),

    // Medical Service related APIs
    getMedicalServices: () => api.get('/ListOfMedicalService'),
    getMedicalServiceById: (id) => api.get(`/ListOfMedicalService/${id}`),

    // Service Order related APIs
    getServiceOrders: () => api.get('/ServiceOrder'),
    getServiceOrdersByDoctorId: (doctorId) => api.get(`/ServiceOrder?doctor_id=${doctorId}`),
    createServiceOrder: (orderData) => api.post('/ServiceOrder', orderData),

    // Service Order Item related APIs
    getServiceOrderItems: () => api.get('/ServiceOrderItem'),
    getServiceOrderItemsByDoctorId: (doctorId) => api.get(`/ServiceOrderItem?doctor_id=${doctorId}`),
    getServiceOrderItemsByOrderId: (orderId) => api.get(`/ServiceOrderItem?service_order_id=${orderId}`),
    createServiceOrderItem: (itemData) => api.post('/ServiceOrderItem', itemData),

    // Results Of Paraclinical Services related APIs
    getResultsOfParaclinicalServices: () => api.get('/ResultsOfParaclinicalServices'),
    getResultByServiceOrderItemId: (serviceOrderItemId) => api.get(`/ResultsOfParaclinicalServices?service_order_item_id=${serviceOrderItemId}`),
    createParaclinicalResult: (resultData) => api.post('/ResultsOfParaclinicalServices', resultData),

    // Medicine related APIs
    getMedicines: () => api.get('/Medicine'),
    getMedicineById: (id) => api.get(`/Medicine/${id}`),

    // Prescription related APIs
    getPrescriptions: () => api.get('/Prescription'),
    getPrescriptionsByDoctorId: (doctorId) => api.get(`/Prescription?doctor_id=${doctorId}`),
    getPrescriptionsByMedicineRecordId: (medicineRecordId) => api.get(`/Prescription?medicineRecord_id=${medicineRecordId}`),
    createPrescription: (prescriptionData) => api.post('/Prescription', prescriptionData),
    updatePrescription: (id, prescriptionData) => api.patch(`/Prescription/${id}`, prescriptionData),

    // Medicine Details (Medicines table) related APIs
    getMedicineDetails: () => api.get('/Medicines'),
    getMedicineDetailsByPrescriptionInvoiceId: (prescriptionInvoiceId) => api.get(`/Medicines?prescription_invoice_id=${prescriptionInvoiceId}`),
    createMedicineDetail: (medicineDetailData) => api.post('/Medicines', medicineDetailData),

    // Prescription Invoice related APIs
    getPrescriptionInvoices: () => api.get('/PrescriptionInvoice'),
    getPrescriptionInvoiceByPrescriptionId: (prescriptionId) => api.get(`/PrescriptionInvoice?prescription_id=${prescriptionId}`),
    createPrescriptionInvoice: (invoiceData) => api.post('/PrescriptionInvoice', invoiceData),
    
    // Invoice related APIs
    getInvoices: () => api.get('/Invoice'),
    getInvoiceById: (id) => api.get(`/Invoice/${id}`),
    getInvoicesByPatientId: (patientId) => api.get(`/Invoice?patient_id=${patientId}`),
    getInvoicesByMedicineRecordId: (medicineRecordId) => api.get(`/Invoice?medicineRecord_id=${medicineRecordId}`),
    createInvoice: (invoiceData) => api.post('/Invoice', invoiceData),
    updateInvoice: (id, invoiceData) => api.patch(`/Invoice/${id}`, invoiceData),
    updateInvoiceStatus: (invoiceId, status) => api.patch(`/Invoice/${invoiceId}`, { status }),

    // Service Invoice related APIs
    getServiceInvoices: () => api.get('/ServiceInvoice'),
    getServiceInvoiceById: (id) => api.get(`/ServiceInvoice/${id}`),
    getServiceInvoicesByInvoiceId: (invoiceId) => api.get(`/ServiceInvoice?invoice_id=${invoiceId}`),
    getServiceInvoicesByServiceOrderItemId: (serviceOrderItemId) => api.get(`/ServiceInvoice?service_order_item_id=${serviceOrderItemId}`),
    createServiceInvoice: (serviceInvoiceData) => api.post('/ServiceInvoice', serviceInvoiceData),
    updateServiceInvoice: (id, serviceInvoiceData) => api.patch(`/ServiceInvoice/${id}`, serviceInvoiceData),

    // Payment related APIs
    getPayments: () => api.get('/Payment'),
    getPaymentById: (id) => api.get(`/Payment/${id}`),
    getPaymentsByInvoiceId: (invoiceId) => api.get(`/Payment?invoice_id=${invoiceId}`),
    createPayment: (paymentData) => api.post('/Payment', paymentData),
    updatePayment: (id, paymentData) => api.patch(`/Payment/${id}`, paymentData),
    
    // Diagnosis related APIs
    getDiagnosis: () => api.get('/Diagnosis'),
    getDiagnosisByPatientId: (patientId) => api.get(`/Diagnosis?patient_id=${patientId}`),
    getDiagnosisByMedicineRecordId: (medicineRecordId) => api.get(`/Diagnosis?medicineRecord_id=${medicineRecordId}`),
    createDiagnosis: (diagnosisData) => api.post('/Diagnosis', diagnosisData),
    
    // Prescription related APIs
    getPrescriptions: () => api.get('/Prescription'),
    getPrescriptionsByDoctorId: (doctorId) => api.get(`/Prescription?doctor_id=${doctorId}`),
    
    // Receptionist related APIs
    getReceptionists: () => api.get('/Receptionist'),
    getReceptionistById: (id) => api.get(`/Receptionist/${id}`),
    
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
            case 'paid': return '#10b981';
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
    },

    // Get status text in Vietnamese for invoices
    getStatusTextInvoice: (status) => {
        switch(status?.toLowerCase()) {
            case 'paid': return 'Đã Thanh Toán';
            case 'pending': return 'Chờ thanh toán';
            case 'cancelled': return 'Đã hủy';
            default: return 'Không xác định';
        }
    },

    // Get shift text in Vietnamese
    getShift: (shift) => {
        switch(shift?.toLowerCase()) {
            case 'morning': return 'Buổi sáng';
            case 'afternoon': return 'Buổi chiều';
            case 'evening': return 'Buổi tối';
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
export const getDiagnosisByMedicineRecordId = (medicineRecordId) => apiService.getDiagnosisByMedicineRecordId(medicineRecordId).then(handleApiSuccess).catch(handleApiError);
export const createDiagnosis = (diagnosisData) => apiService.createDiagnosis(diagnosisData).then(handleApiSuccess).catch(handleApiError);
export const updateAppointmentStatus = (id, status) => apiService.updateAppointmentStatus(id, status).then(handleApiSuccess).catch(handleApiError);
export const createAppointment = (appointmentData) => apiService.createAppointment(appointmentData).then(handleApiSuccess).catch(handleApiError);

// Waitlist simplified functions
export const getWaitlist = () => apiService.getWaitlist().then(handleApiSuccess).catch(handleApiError);
export const getWaitlistByDoctorId = (doctorId) => apiService.getWaitlistByDoctorId(doctorId).then(handleApiSuccess).catch(handleApiError);
export const updateWaitlistStatus = (id, status) => apiService.updateWaitlistStatus(id, status).then(handleApiSuccess).catch(handleApiError);
export const updateWaitlistStatusAndVisitType = (id, status, visittype) => apiService.updateWaitlistStatusAndVisitType(id, status, visittype).then(handleApiSuccess).catch(handleApiError);

// ExamResult simplified functions
export const getExamResults = () => apiService.getExamResults().then(handleApiSuccess).catch(handleApiError);
export const getExamResultsByDoctorId = (doctorId) => apiService.getExamResultsByDoctorId(doctorId).then(handleApiSuccess).catch(handleApiError);
export const getExamResultByMedicineRecordId = (medicineRecordId) => apiService.getExamResultByMedicineRecordId(medicineRecordId).then(handleApiSuccess).catch(handleApiError);
export const createExamResult = (examData) => apiService.createExamResult(examData).then(handleApiSuccess).catch(handleApiError);

// Medicine Records simplified functions
export const getMedicineRecords = () => apiService.getMedicineRecords().then(handleApiSuccess).catch(handleApiError);
export const getMedicineRecordByPatientId = (patientId) => apiService.getMedicineRecordByPatientId(patientId).then(handleApiSuccess).catch(handleApiError);
export const createMedicineRecord = (recordData) => apiService.createMedicineRecord(recordData).then(handleApiSuccess).catch(handleApiError);

// Room simplified functions
export const getRooms = () => apiService.getRooms().then(handleApiSuccess).catch(handleApiError);

// Medical Service simplified functions
export const getMedicalServices = () => apiService.getMedicalServices().then(handleApiSuccess).catch(handleApiError);
export const getMedicalServiceById = (id) => apiService.getMedicalServiceById(id).then(handleApiSuccess).catch(handleApiError);

// Service Order simplified functions
export const getServiceOrders = () => apiService.getServiceOrders().then(handleApiSuccess).catch(handleApiError);
export const getServiceOrdersByDoctorId = (doctorId) => apiService.getServiceOrdersByDoctorId(doctorId).then(handleApiSuccess).catch(handleApiError);
export const createServiceOrder = (orderData) => apiService.createServiceOrder(orderData).then(handleApiSuccess).catch(handleApiError);

// Service Order Item simplified functions
export const getServiceOrderItems = () => apiService.getServiceOrderItems().then(handleApiSuccess).catch(handleApiError);
export const getServiceOrderItemsByDoctorId = (doctorId) => apiService.getServiceOrderItemsByDoctorId(doctorId).then(handleApiSuccess).catch(handleApiError);
export const getServiceOrderItemsByOrderId = (orderId) => apiService.getServiceOrderItemsByOrderId(orderId).then(handleApiSuccess).catch(handleApiError);
export const createServiceOrderItem = (itemData) => apiService.createServiceOrderItem(itemData).then(handleApiSuccess).catch(handleApiError);

// Results Of Paraclinical Services simplified functions
export const getResultsOfParaclinicalServices = () => apiService.getResultsOfParaclinicalServices().then(handleApiSuccess).catch(handleApiError);
export const getResultByServiceOrderItemId = (serviceOrderItemId) => apiService.getResultByServiceOrderItemId(serviceOrderItemId).then(handleApiSuccess).catch(handleApiError);
export const createParaclinicalResult = (resultData) => apiService.createParaclinicalResult(resultData).then(handleApiSuccess).catch(handleApiError);

// Medicine simplified functions
export const getMedicines = () => apiService.getMedicines().then(handleApiSuccess).catch(handleApiError);
export const getMedicineById = (id) => apiService.getMedicineById(id).then(handleApiSuccess).catch(handleApiError);

// Prescription simplified functions
export const getPrescriptions = () => apiService.getPrescriptions().then(handleApiSuccess).catch(handleApiError);
export const getPrescriptionsByDoctorId = (doctorId) => apiService.getPrescriptionsByDoctorId(doctorId).then(handleApiSuccess).catch(handleApiError);
export const getPrescriptionsByMedicineRecordId = (medicineRecordId) => apiService.getPrescriptionsByMedicineRecordId(medicineRecordId).then(handleApiSuccess).catch(handleApiError);
export const createPrescription = (prescriptionData) => apiService.createPrescription(prescriptionData).then(handleApiSuccess).catch(handleApiError);
export const updatePrescription = (id, prescriptionData) => apiService.updatePrescription(id, prescriptionData).then(handleApiSuccess).catch(handleApiError);

// Medicine Details simplified functions
export const getMedicineDetails = () => apiService.getMedicineDetails().then(handleApiSuccess).catch(handleApiError);
export const getMedicineDetailsByPrescriptionInvoiceId = (prescriptionInvoiceId) => apiService.getMedicineDetailsByPrescriptionInvoiceId(prescriptionInvoiceId).then(handleApiSuccess).catch(handleApiError);
export const createMedicineDetail = (medicineDetailData) => apiService.createMedicineDetail(medicineDetailData).then(handleApiSuccess).catch(handleApiError);

// Prescription Invoice simplified functions
export const getPrescriptionInvoices = () => apiService.getPrescriptionInvoices().then(handleApiSuccess).catch(handleApiError);
export const getPrescriptionInvoiceByPrescriptionId = (prescriptionId) => apiService.getPrescriptionInvoiceByPrescriptionId(prescriptionId).then(handleApiSuccess).catch(handleApiError);
export const createPrescriptionInvoice = (invoiceData) => apiService.createPrescriptionInvoice(invoiceData).then(handleApiSuccess).catch(handleApiError);

// Invoice simplified functions
export const getInvoices = () => apiService.getInvoices().then(handleApiSuccess).catch(handleApiError);
export const getInvoiceById = (id) => apiService.getInvoiceById(id).then(handleApiSuccess).catch(handleApiError);
export const getInvoicesByPatientId = (patientId) => apiService.getInvoicesByPatientId(patientId).then(handleApiSuccess).catch(handleApiError);
export const getInvoicesByMedicineRecordId = (medicineRecordId) => apiService.getInvoicesByMedicineRecordId(medicineRecordId).then(handleApiSuccess).catch(handleApiError);
export const createInvoice = (invoiceData) => apiService.createInvoice(invoiceData).then(handleApiSuccess).catch(handleApiError);
export const updateInvoice = (id, invoiceData) => apiService.updateInvoice(id, invoiceData).then(handleApiSuccess).catch(handleApiError);

// Service Invoice simplified functions
export const getServiceInvoices = () => apiService.getServiceInvoices().then(handleApiSuccess).catch(handleApiError);
export const getServiceInvoiceById = (id) => apiService.getServiceInvoiceById(id).then(handleApiSuccess).catch(handleApiError);
export const getServiceInvoicesByInvoiceId = (invoiceId) => apiService.getServiceInvoicesByInvoiceId(invoiceId).then(handleApiSuccess).catch(handleApiError);
export const getServiceInvoicesByServiceOrderItemId = (serviceOrderItemId) => apiService.getServiceInvoicesByServiceOrderItemId(serviceOrderItemId).then(handleApiSuccess).catch(handleApiError);
export const createServiceInvoice = (serviceInvoiceData) => apiService.createServiceInvoice(serviceInvoiceData).then(handleApiSuccess).catch(handleApiError);
export const updateServiceInvoice = (id, serviceInvoiceData) => apiService.updateServiceInvoice(id, serviceInvoiceData).then(handleApiSuccess).catch(handleApiError);

// Payment simplified functions
export const getPayments = () => apiService.getPayments().then(handleApiSuccess).catch(handleApiError);
export const getPaymentById = (id) => apiService.getPaymentById(id).then(handleApiSuccess).catch(handleApiError);
export const getPaymentsByInvoiceId = (invoiceId) => apiService.getPaymentsByInvoiceId(invoiceId).then(handleApiSuccess).catch(handleApiError);
export const createPayment = (paymentData) => apiService.createPayment(paymentData).then(handleApiSuccess).catch(handleApiError);
export const updatePayment = (id, paymentData) => apiService.updatePayment(id, paymentData).then(handleApiSuccess).catch(handleApiError);

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