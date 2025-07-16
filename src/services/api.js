import axios from 'axios';

const BIN_ID = '687804bbc7f29633ab29e938';
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
const API_KEY = '$2a$10$eoMup44jxUPqEc6cZyCuUuTxGevIzxtr3W6Ap7BHzZsIU2ywXCJ4G';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY,
    }
});

// Lấy toàn bộ database (object lớn)
export const getDatabase = async () => {
    try {
        const res = await api.get('/latest');
        // Nếu có metadata, chỉ lấy record
        return res.data.record || res.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Ghi đè toàn bộ database (object lớn)
export const updateDatabase = async (newData) => {
    try {
        const res = await api.put('', newData);
        return res.data.record || res.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Helper: Lấy bảng con từ database
export const getTable = (db, tableName) => db[tableName] || [];

// Helper: Thêm bản ghi vào bảng con
export const addRecord = (db, tableName, record) => {
    const table = db[tableName] || [];
    db[tableName] = [...table, record];
    return db;
};

// Helper: Sửa bản ghi trong bảng con (theo id)
export const updateRecord = (db, tableName, id, newRecord) => {
    const table = db[tableName] || [];
    db[tableName] = table.map(item => item.id === id ? { ...item, ...newRecord } : item);
    return db;
};

// Helper: Xóa bản ghi trong bảng con (theo id)
export const deleteRecord = (db, tableName, id) => {
    const table = db[tableName] || [];
    db[tableName] = table.filter(item => item.id !== id);
    return db;
};

// Ví dụ: các hàm thao tác với Doctor
export const getDoctors = async () => {
    const db = await getDatabase();
    return getTable(db, 'Doctor');
};
export const addDoctor = async (doctor) => {
    const db = await getDatabase();
    addRecord(db, 'Doctor', doctor);
    await updateDatabase(db);
};
export const updateDoctor = async (id, doctorData) => {
    const db = await getDatabase();
    updateRecord(db, 'Doctor', id, doctorData);
    await updateDatabase(db);
};
export const deleteDoctor = async (id) => {
    const db = await getDatabase();
    deleteRecord(db, 'Doctor', id);
    await updateDatabase(db);
};

// Tương tự cho Patient
export const getPatients = async () => {
    const db = await getDatabase();
    return getTable(db, 'Patient');
};
export const addPatient = async (patient) => {
    const db = await getDatabase();
    addRecord(db, 'Patient', patient);
    await updateDatabase(db);
};
export const updatePatient = async (id, patientData) => {
    const db = await getDatabase();
    updateRecord(db, 'Patient', id, patientData);
    await updateDatabase(db);
};
export const deletePatient = async (id) => {
    const db = await getDatabase();
    deleteRecord(db, 'Patient', id);
    await updateDatabase(db);
};

// Tương tự cho Appointment
export const getAppointments = async () => {
    const db = await getDatabase();
    return getTable(db, 'Appointment');
};
export const addAppointment = async (appointment) => {
    const db = await getDatabase();
    addRecord(db, 'Appointment', appointment);
    await updateDatabase(db);
};
export const updateAppointment = async (id, appointmentData) => {
    const db = await getDatabase();
    updateRecord(db, 'Appointment', id, appointmentData);
    await updateDatabase(db);
};
export const deleteAppointment = async (id) => {
    const db = await getDatabase();
    deleteRecord(db, 'Appointment', id);
    await updateDatabase(db);
};

// Medicine
export const getMedicines = async () => {
    const db = await getDatabase();
    return getTable(db, 'Medicine');
};
export const addMedicine = async (medicine) => {
    const db = await getDatabase();
    addRecord(db, 'Medicine', medicine);
    await updateDatabase(db);
};
export const updateMedicine = async (id, medicineData) => {
    const db = await getDatabase();
    updateRecord(db, 'Medicine', id, medicineData);
    await updateDatabase(db);
};
export const deleteMedicine = async (id) => {
    const db = await getDatabase();
    deleteRecord(db, 'Medicine', id);
    await updateDatabase(db);
};

// Invoice
export const getInvoices = async () => {
    const db = await getDatabase();
    return getTable(db, 'Invoice');
};
export const addInvoice = async (invoice) => {
    const db = await getDatabase();
    addRecord(db, 'Invoice', invoice);
    await updateDatabase(db);
};
export const updateInvoice = async (id, invoiceData) => {
    const db = await getDatabase();
    updateRecord(db, 'Invoice', id, invoiceData);
    await updateDatabase(db);
};
export const deleteInvoice = async (id) => {
    const db = await getDatabase();
    deleteRecord(db, 'Invoice', id);
    await updateDatabase(db);
};

// MedicineRecords
export const getMedicineRecords = async () => {
    const db = await getDatabase();
    return getTable(db, 'MedicineRecords');
};
export const addMedicineRecord = async (record) => {
    const db = await getDatabase();
    addRecord(db, 'MedicineRecords', record);
    await updateDatabase(db);
};
export const updateMedicineRecord = async (id, recordData) => {
    const db = await getDatabase();
    updateRecord(db, 'MedicineRecords', id, recordData);
    await updateDatabase(db);
};
export const deleteMedicineRecord = async (id) => {
    const db = await getDatabase();
    deleteRecord(db, 'MedicineRecords', id);
    await updateDatabase(db);
};

// ServiceOrder
export const getServiceOrders = async () => {
    const db = await getDatabase();
    return getTable(db, 'ServiceOrder');
};
export const addServiceOrder = async (order) => {
    const db = await getDatabase();
    addRecord(db, 'ServiceOrder', order);
    await updateDatabase(db);
};
export const updateServiceOrder = async (id, orderData) => {
    const db = await getDatabase();
    updateRecord(db, 'ServiceOrder', id, orderData);
    await updateDatabase(db);
};
export const deleteServiceOrder = async (id) => {
    const db = await getDatabase();
    deleteRecord(db, 'ServiceOrder', id);
    await updateDatabase(db);
};

// ServiceOrderItem
export const getServiceOrderItems = async () => {
    const db = await getDatabase();
    return getTable(db, 'ServiceOrderItem');
};
export const addServiceOrderItem = async (item) => {
    const db = await getDatabase();
    addRecord(db, 'ServiceOrderItem', item);
    await updateDatabase(db);
};
export const updateServiceOrderItem = async (id, itemData) => {
    const db = await getDatabase();
    updateRecord(db, 'ServiceOrderItem', id, itemData);
    await updateDatabase(db);
};
export const deleteServiceOrderItem = async (id) => {
    const db = await getDatabase();
    deleteRecord(db, 'ServiceOrderItem', id);
    await updateDatabase(db);
};

// ServiceInvoice
export const getServiceInvoices = async () => {
    const db = await getDatabase();
    return getTable(db, 'ServiceInvoice');
};
export const addServiceInvoice = async (invoice) => {
    const db = await getDatabase();
    addRecord(db, 'ServiceInvoice', invoice);
    await updateDatabase(db);
};
export const updateServiceInvoice = async (id, invoiceData) => {
    const db = await getDatabase();
    updateRecord(db, 'ServiceInvoice', id, invoiceData);
    await updateDatabase(db);
};
export const deleteServiceInvoice = async (id) => {
    const db = await getDatabase();
    deleteRecord(db, 'ServiceInvoice', id);
    await updateDatabase(db);
};

// Payment
export const getPayments = async () => {
    const db = await getDatabase();
    return getTable(db, 'Payment');
};
export const addPayment = async (payment) => {
    const db = await getDatabase();
    addRecord(db, 'Payment', payment);
    await updateDatabase(db);
};
export const updatePayment = async (id, paymentData) => {
    const db = await getDatabase();
    updateRecord(db, 'Payment', id, paymentData);
    await updateDatabase(db);
};
export const deletePayment = async (id) => {
    const db = await getDatabase();
    deleteRecord(db, 'Payment', id);
    await updateDatabase(db);
};

// Waitlist
export const getWaitlist = async () => {
    const db = await getDatabase();
    return getTable(db, 'Waitlist');
};
export const addWaitlist = async (waitlist) => {
    const db = await getDatabase();
    addRecord(db, 'Waitlist', waitlist);
    await updateDatabase(db);
};
export const updateWaitlist = async (id, waitlistData) => {
    const db = await getDatabase();
    updateRecord(db, 'Waitlist', id, waitlistData);
    await updateDatabase(db);
};
export const deleteWaitlist = async (id) => {
    const db = await getDatabase();
    deleteRecord(db, 'Waitlist', id);
    await updateDatabase(db);
};

// Receptionist
export const getReceptionists = async () => {
    const db = await getDatabase();
    return getTable(db, 'Receptionist');
};
export const addReceptionist = async (receptionist) => {
    const db = await getDatabase();
    addRecord(db, 'Receptionist', receptionist);
    await updateDatabase(db);
};
export const updateReceptionist = async (id, receptionistData) => {
    const db = await getDatabase();
    updateRecord(db, 'Receptionist', id, receptionistData);
    await updateDatabase(db);
};
export const deleteReceptionist = async (id) => {
    const db = await getDatabase();
    deleteRecord(db, 'Receptionist', id);
    await updateDatabase(db);
};

// AccountPatient
export const getAccountPatients = async () => {
    const db = await getDatabase();
    return getTable(db, 'AccountPatient');
};
export const addAccountPatient = async (account) => {
    const db = await getDatabase();
    addRecord(db, 'AccountPatient', account);
    await updateDatabase(db);
};
export const updateAccountPatient = async (id, accountData) => {
    const db = await getDatabase();
    updateRecord(db, 'AccountPatient', id, accountData);
    await updateDatabase(db);
};
export const deleteAccountPatient = async (id) => {
    const db = await getDatabase();
    deleteRecord(db, 'AccountPatient', id);
    await updateDatabase(db);
};

// AccountStaff
export const getAccountStaff = async () => {
    const db = await getDatabase();
    return getTable(db, 'AccountStaff');
};
export const addAccountStaff = async (account) => {
    const db = await getDatabase();
    addRecord(db, 'AccountStaff', account);
    await updateDatabase(db);
};
export const updateAccountStaff = async (id, accountData) => {
    const db = await getDatabase();
    updateRecord(db, 'AccountStaff', id, accountData);
    await updateDatabase(db);
};
export const deleteAccountStaff = async (id) => {
    const db = await getDatabase();
    deleteRecord(db, 'AccountStaff', id);
    await updateDatabase(db);
};

// Room
export const getRooms = async () => {
    const db = await getDatabase();
    return getTable(db, 'Room');
};
export const addRoom = async (room) => {
    const db = await getDatabase();
    addRecord(db, 'Room', room);
    await updateDatabase(db);
};
export const updateRoom = async (id, roomData) => {
    const db = await getDatabase();
    updateRecord(db, 'Room', id, roomData);
    await updateDatabase(db);
};
export const deleteRoom = async (id) => {
    const db = await getDatabase();
    deleteRecord(db, 'Room', id);
    await updateDatabase(db);
};

// Distributor
export const getDistributors = async () => {
    const db = await getDatabase();
    return getTable(db, 'Distributor');
};
export const addDistributor = async (distributor) => {
    const db = await getDatabase();
    addRecord(db, 'Distributor', distributor);
    await updateDatabase(db);
};
export const updateDistributor = async (id, distributorData) => {
    const db = await getDatabase();
    updateRecord(db, 'Distributor', id, distributorData);
    await updateDatabase(db);
};
export const deleteDistributor = async (id) => {
    const db = await getDatabase();
    deleteRecord(db, 'Distributor', id);
    await updateDatabase(db);
};

// ImportInfo
export const getImportInfo = async () => {
    const db = await getDatabase();
    return getTable(db, 'ImportInfo');
};
export const addImportInfo = async (importInfo) => {
    const db = await getDatabase();
    addRecord(db, 'ImportInfo', importInfo);
    await updateDatabase(db);
};
export const updateImportInfo = async (id, importInfoData) => {
    const db = await getDatabase();
    updateRecord(db, 'ImportInfo', id, importInfoData);
    await updateDatabase(db);
};
export const deleteImportInfo = async (id) => {
    const db = await getDatabase();
    deleteRecord(db, 'ImportInfo', id);
    await updateDatabase(db);
};

// Medicines (chi tiết đơn thuốc)
export const getMedicinesDetail = async () => {
    const db = await getDatabase();
    return getTable(db, 'Medicines');
};
export const addMedicineDetail = async (medicineDetail) => {
    const db = await getDatabase();
    addRecord(db, 'Medicines', medicineDetail);
    await updateDatabase(db);
};
export const updateMedicineDetail = async (id, medicineDetailData) => {
    const db = await getDatabase();
    updateRecord(db, 'Medicines', id, medicineDetailData);
    await updateDatabase(db);
};
export const deleteMedicineDetail = async (id) => {
    const db = await getDatabase();
    deleteRecord(db, 'Medicines', id);
    await updateDatabase(db);
};

// Diagnosis
export const getDiagnosis = async () => {
    const db = await getDatabase();
    return getTable(db, 'Diagnosis');
};
export const addDiagnosis = async (diagnosis) => {
    const db = await getDatabase();
    addRecord(db, 'Diagnosis', diagnosis);
    await updateDatabase(db);
};
export const updateDiagnosis = async (id, diagnosisData) => {
    const db = await getDatabase();
    updateRecord(db, 'Diagnosis', id, diagnosisData);
    await updateDatabase(db);
};
export const deleteDiagnosis = async (id) => {
    const db = await getDatabase();
    deleteRecord(db, 'Diagnosis', id);
    await updateDatabase(db);
};

// Prescription
export const getPrescriptions = async () => {
    const db = await getDatabase();
    return getTable(db, 'Prescription');
};
export const addPrescription = async (prescription) => {
    const db = await getDatabase();
    addRecord(db, 'Prescription', prescription);
    await updateDatabase(db);
};
export const updatePrescription = async (id, prescriptionData) => {
    const db = await getDatabase();
    updateRecord(db, 'Prescription', id, prescriptionData);
    await updateDatabase(db);
};
export const deletePrescription = async (id) => {
    const db = await getDatabase();
    deleteRecord(db, 'Prescription', id);
    await updateDatabase(db);
};

// PDFExport (nếu cần lưu log xuất PDF)
export const getPDFExports = async () => {
    const db = await getDatabase();
    return getTable(db, 'PDFExport');
};
export const addPDFExport = async (pdfExport) => {
    const db = await getDatabase();
    addRecord(db, 'PDFExport', pdfExport);
    await updateDatabase(db);
};
export const updatePDFExport = async (id, pdfExportData) => {
    const db = await getDatabase();
    updateRecord(db, 'PDFExport', id, pdfExportData);
    await updateDatabase(db);
};
export const deletePDFExport = async (id) => {
    const db = await getDatabase();
    deleteRecord(db, 'PDFExport', id);
    await updateDatabase(db);
};

// SystemLog_Staff
export const getSystemLogStaff = async () => {
    const db = await getDatabase();
    return getTable(db, 'SystemLog_Staff');
};
export const addSystemLogStaff = async (log) => {
    const db = await getDatabase();
    addRecord(db, 'SystemLog_Staff', log);
    await updateDatabase(db);
};
export const updateSystemLogStaff = async (id, logData) => {
    const db = await getDatabase();
    updateRecord(db, 'SystemLog_Staff', id, logData);
    await updateDatabase(db);
};
export const deleteSystemLogStaff = async (id) => {
    const db = await getDatabase();
    deleteRecord(db, 'SystemLog_Staff', id);
    await updateDatabase(db);
};

// SystemLog_Patient
export const getSystemLogPatient = async () => {
    const db = await getDatabase();
    return getTable(db, 'SystemLog_Patient');
};
export const addSystemLogPatient = async (log) => {
    const db = await getDatabase();
    addRecord(db, 'SystemLog_Patient', log);
    await updateDatabase(db);
};
export const updateSystemLogPatient = async (id, logData) => {
    const db = await getDatabase();
    updateRecord(db, 'SystemLog_Patient', id, logData);
    await updateDatabase(db);
};
export const deleteSystemLogPatient = async (id) => {
    const db = await getDatabase();
    deleteRecord(db, 'SystemLog_Patient', id);
    await updateDatabase(db);
};

// SystemLog_Pharmacist
export const getSystemLogPharmacist = async () => {
    const db = await getDatabase();
    return getTable(db, 'SystemLog_Pharmacist');
};
export const addSystemLogPharmacist = async (log) => {
    const db = await getDatabase();
    addRecord(db, 'SystemLog_Pharmacist', log);
    await updateDatabase(db);
};
export const updateSystemLogPharmacist = async (id, logData) => {
    const db = await getDatabase();
    updateRecord(db, 'SystemLog_Pharmacist', id, logData);
    await updateDatabase(db);
};
export const deleteSystemLogPharmacist = async (id) => {
    const db = await getDatabase();
    deleteRecord(db, 'SystemLog_Pharmacist', id);
    await updateDatabase(db);
};
// Bạn có thể mở rộng tương tự cho các bảng khác: Medicine, Invoice, ...
// Nếu cần hàm helper nào đặc biệt, hãy yêu cầu thêm! 

// MedicalService
export const getMedicalServices = async () => {
    const db = await getDatabase();
    return getTable(db, 'MedicalService');
};
export const addMedicalService = async (service) => {
    const db = await getDatabase();
    addRecord(db, 'MedicalService', service);
    await updateDatabase(db);
};
export const updateMedicalService = async (id, serviceData) => {
    const db = await getDatabase();
    updateRecord(db, 'MedicalService', id, serviceData);
    await updateDatabase(db);
};
export const deleteMedicalService = async (id) => {
    const db = await getDatabase();
    deleteRecord(db, 'MedicalService', id);
    await updateDatabase(db);
};

// ParaclinicalResult (add this table to your JSON if not present)
export const getResultsOfParaclinicalServices = async () => {
    const db = await getDatabase();
    return getTable(db, 'ParaclinicalResult');
};
export const addParaclinicalResult = async (result) => {
    const db = await getDatabase();
    addRecord(db, 'ParaclinicalResult', result);
    await updateDatabase(db);
};

// ExamResult (add this table to your JSON if not present)
export const getExamResultsByDoctorId = async (doctorId) => {
    const results = await getResultsOfParaclinicalServices();
    return results.filter(r => r.doctorId === doctorId);
};
export const createExamResult = addParaclinicalResult;

// ServiceOrder filtered by doctorId
export const getServiceOrdersByDoctorId = async (doctorId) => {
    const orders = await getServiceOrders();
    return orders.filter(o => o.doctorId === doctorId);
};

// Waitlist filtered by doctorId
export const getWaitlistByDoctorId = async (doctorId) => {
    const waitlist = await getWaitlist();
    return waitlist.filter(w => w.doctorId === doctorId);
};

// Diagnosis filtered by medicineRecordId
export const getDiagnosisByMedicineRecordId = async (medicineRecordId) => {
    const diagnosis = await getDiagnosis();
    return diagnosis.filter(d => d.medicineRecordId === medicineRecordId);
};

// updateWaitlistStatus
export const updateWaitlistStatus = async (id, status) => {
    const db = await getDatabase();
    updateRecord(db, 'Waitlist', id, { status });
    await updateDatabase(db);
};

// createX aliases
export const createDiagnosis = addDiagnosis;
export const createPrescription = addPrescription;
export const createMedicineRecord = addMedicineRecord;
export const createMedicineDetail = addMedicineDetail;
export const createPrescriptionInvoice = addInvoice;

// Nurses
export const getNurses = async () => {
    const db = await getDatabase();
    return getTable(db, 'Nurse');
};
export const addNurse = async (nurse) => {
    const db = await getDatabase();
    addRecord(db, 'Nurse', nurse);
    await updateDatabase(db);
};
export const updateNurse = async (id, nurseData) => {
    const db = await getDatabase();
    updateRecord(db, 'Nurse', id, nurseData);
    await updateDatabase(db);
};
export const deleteNurse = async (id) => {
    const db = await getDatabase();
    deleteRecord(db, 'Nurse', id);
    await updateDatabase(db);
};

// AccountPharmacist (add this table to your JSON if not present)
export const getAccountPharmacist = async () => {
    const db = await getDatabase();
    return getTable(db, 'AccountPharmacist');
};

// PatientDashboard helpers
export const getPatientAppointments = async (patientId) => {
    const appointments = await getAppointments();
    return appointments.filter(a => a.patientId === patientId);
};
export const getPatientDiagnosis = async (patientId) => {
    const diagnosis = await getDiagnosis();
    return diagnosis.filter(d => d.patientId === patientId);
};
export const getPatientStats = async (patientId) => {
    // Example: return stats object, customize as needed
    const appointments = await getPatientAppointments(patientId);
    const diagnosis = await getPatientDiagnosis(patientId);
    return {
        appointmentCount: appointments.length,
        diagnosisCount: diagnosis.length,
    };
}; 