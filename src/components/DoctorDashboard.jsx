import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorHeader from './DoctorHeader';
import { 
    getWaitlistByDoctorId, 
    getPatients, 
    getRooms,
    createExamResult,
    updateWaitlistStatus,
    createMedicineRecord,
    getExamResults,
    getExamResultsByDoctorId,
    getMedicineRecords,
    getServiceOrdersByDoctorId,
    getServiceOrderItems,
    getResultsOfParaclinicalServices,
    getMedicalServices,
    getDiagnosisByMedicineRecordId,
    createDiagnosis,
    getMedicines,
    createPrescription,
    createPrescriptionInvoice,
    createMedicineDetail
} from '../services/api';

const DoctorDashboard = () => {
    const navigate = useNavigate();
    
    const [waitlist, setWaitlist] = useState([]);
    const [patients, setPatients] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [examResults, setExamResults] = useState([]);
    const [medicineRecords, setMedicineRecords] = useState([]);
    const [serviceOrders, setServiceOrders] = useState([]);
    const [serviceOrderItems, setServiceOrderItems] = useState([]);
    const [serviceResults, setServiceResults] = useState([]);
    const [medicalServices, setMedicalServices] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [diagnosisData, setDiagnosisData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDoctorId, setCurrentDoctorId] = useState('1');
    
    // Exam Modal States
    const [showExamModal, setShowExamModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedWaitlistItem, setSelectedWaitlistItem] = useState(null);
    const [examForm, setExamForm] = useState({
        symptoms: '',
        preliminary_diagnosis: '',
        notes: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // Diagnosis Modal States
    const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
    const [selectedServiceOrder, setSelectedServiceOrder] = useState(null);
    const [diagnosisForm, setDiagnosisForm] = useState({
        conclusion: '',
        disease: '',
        treatment_plan: ''
    });
    const [diagnosisSubmitting, setDiagnosisSubmitting] = useState(false);
    
    // Prescription States
    const [selectedMedicines, setSelectedMedicines] = useState([]);
    const [currentModalStep, setCurrentModalStep] = useState(1);

    useEffect(() => {
        fetchDashboardData();
    }, [currentDoctorId]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            const [waitlistRes, patientsRes, roomsRes, examResultsRes, medicineRecordsRes, serviceOrdersRes, serviceOrderItemsRes, serviceResultsRes, medicalServicesRes, medicinesRes] = await Promise.all([
                getWaitlistByDoctorId(currentDoctorId),
                getPatients(),
                getRooms(),
                getExamResultsByDoctorId(currentDoctorId),
                getMedicineRecords(),
                getServiceOrdersByDoctorId(currentDoctorId),
                getServiceOrderItems(),
                getResultsOfParaclinicalServices(),
                getMedicalServices(),
                getMedicines()
            ]);

            if (waitlistRes.success) setWaitlist(waitlistRes.data);
            if (patientsRes.success) setPatients(patientsRes.data);
            if (roomsRes.success) setRooms(roomsRes.data);
            if (examResultsRes.success) setExamResults(examResultsRes.data);
            if (medicineRecordsRes.success) setMedicineRecords(medicineRecordsRes.data);
            if (serviceOrdersRes.success) setServiceOrders(serviceOrdersRes.data);
            if (serviceOrderItemsRes.success) setServiceOrderItems(serviceOrderItemsRes.data);
            if (serviceResultsRes.success) setServiceResults(serviceResultsRes.data);
            if (medicalServicesRes.success) setMedicalServices(medicalServicesRes.data);
            if (medicinesRes.success) setMedicines(medicinesRes.data);

            // Load diagnosis data
            if (serviceOrdersRes.success) {
                const diagnosisPromises = serviceOrdersRes.data.map(async (order) => {
                    const diagnosisRes = await getDiagnosisByMedicineRecordId(order.medicineRecord_id);
                    return {
                        serviceOrderId: order.id,
                        medicineRecordId: order.medicineRecord_id,
                        diagnosis: diagnosisRes.success ? diagnosisRes.data : []
                    };
                });
                const diagnosisResults = await Promise.all(diagnosisPromises);
                setDiagnosisData(diagnosisResults);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            alert('❌ Có lỗi xảy ra khi tải dữ liệu!');
        } finally {
            setLoading(false);
        }
    };

    // ====================================================================================
    // WORKFLOW FILTER FUNCTIONS - USING NEW LOGIC
    // ====================================================================================

    // STEP 1: Waiting for Examination (status=Waiting + visittype=Initial)
    const getWaitingForExam = () => {
        return waitlist.filter(item => 
            item.status === 'Waiting' && item.visittype === 'Initial'
        );
    };

    // STEP 2: Ready for Service Assignment (status=InProgress + visittype=Initial) 
    const getReadyForServiceAssignment = () => {
        return waitlist.filter(item => 
            item.status === 'InProgress' && item.visittype === 'Initial'
        );
    };

    // STEP 3: Services In Progress (status=Waiting + visittype=Result + no results yet)
    const getServicesInProgress = () => {
        return waitlist.filter(item => {
            if (item.status !== 'Waiting' || item.visittype !== 'Result') return false;
         
            // Find service order for this patient
            const serviceData = getServiceOrderData(item.patient_id);
            if (!serviceData || !serviceData.serviceOrder) return true; // Has visittype=Result but no service order yet
            
            // Check if all services have results
            const hasAllResults = checkServiceOrderHasAllResults(serviceData.serviceOrder);
            return !hasAllResults; // Show in step 3 if NOT all results are ready
        });
    };

    // STEP 4: Ready for Diagnosis (status=Waiting + visittype=Result + all results ready + no diagnosis)
    const getReadyForDiagnosis = () => {
        return waitlist.filter(item => {
            if (item.status !== 'Waiting' || item.visittype !== 'Result') return false;
            
            const serviceData = getServiceOrderData(item.patient_id);
            if (!serviceData || !serviceData.serviceOrder) return false;
            
            const hasAllResults = checkServiceOrderHasAllResults(serviceData.serviceOrder);
            const hasDiagnosis = checkServiceOrderHasDiagnosis(serviceData.serviceOrder.id);
            
            return hasAllResults && !hasDiagnosis;
        });
    };

    // STEP 5: Treatment Completed (status=Complete + visittype=Result)  
    const getTreatmentCompleted = () => {
        return waitlist.filter(item => 
            item.status === 'Complete' && item.visittype === 'Result'
        );
    };

    // ====================================================================================
    // CORE HELPER FUNCTIONS
    // ====================================================================================

    // Helper functions
    const getPatientInfo = (patientId) => patients.find(p => p.id === patientId) || {};
    const getRoomInfo = (roomId) => rooms.find(r => r.id === roomId) || {};
    const formatTime = (timeString) => new Date(timeString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const getServiceInfo = (serviceId) => medicalServices.find(s => s.id === serviceId) || {};

    // Helper function to get exam result data for a patient
    const getExamResultData = (patientId) => {
        // Find exam result for this patient created by current doctor
        const examResult = examResults.find(result => 
            result.patient_id === patientId && 
            result.doctor_id === currentDoctorId
        );
        
        if (!examResult) return null;
        
        // Get medicine record for this exam result
        const medicineRecord = medicineRecords.find(record => 
            record.id === examResult.medicineRecord_id
        );
        
        return { examResult, medicineRecord };
    };

    // Helper function to get service order data for a patient
    const getServiceOrderData = (patientId) => {
        // Find service orders for this patient created by current doctor
        const patientServiceOrders = serviceOrders.filter(order => 
            order.doctor_id === currentDoctorId
        );
        
        // Get all medicine records for this patient
        const patientMedicineRecords = medicineRecords.filter(record => 
            record.patient_id === patientId
        );
        
        // Find service order that matches patient's medicine records
        const serviceOrder = patientServiceOrders.find(order => 
            patientMedicineRecords.some(record => record.id === order.medicineRecord_id)
        );
        
        if (!serviceOrder) return null;
        
        const medicineRecord = patientMedicineRecords.find(record => 
            record.id === serviceOrder.medicineRecord_id
        );
        
        return { serviceOrder, medicineRecord };
    };

    // Check if service order has all results
    const checkServiceOrderHasAllResults = (serviceOrder) => {
        const orderItems = serviceOrderItems.filter(item => item.service_order_id === serviceOrder.id);
        if (orderItems.length === 0) return false;
        
        for (const item of orderItems) {
            const hasResult = serviceResults.some(result => 
                result.service_order_item_id === item.id && 
                result.result_description && 
                result.result_description.trim() !== ''
            );
            if (!hasResult) return false;
        }
        return true;
    };

    // Check if service order has diagnosis
    const checkServiceOrderHasDiagnosis = (serviceOrderId) => {
        const diagnosisEntry = diagnosisData.find(entry => entry.serviceOrderId === serviceOrderId);
        return diagnosisEntry && diagnosisEntry.diagnosis.length > 0;
    };

    // ====================================================================================
    // EVENT HANDLERS  
    // ====================================================================================

    // Handle examination
    const handleStartExam = (waitlistItem, actionType) => {
        const patient = getPatientInfo(waitlistItem.patient_id);
        
        if (actionType === 'assign') {
            navigate(`/service-assignment/${waitlistItem.patient_id}/${waitlistItem.id}`);
        } else if (actionType === 'view') {
            navigate(`/results/${waitlistItem.patient_id}`);
        } else {
            setSelectedWaitlistItem(waitlistItem);
            setSelectedPatient(patient);
            setShowExamModal(true);
            setExamForm({ symptoms: '', preliminary_diagnosis: '', notes: '' });
        }
    };

    // Handle exam form submission
    const handleExamSubmit = async (e) => {
        e.preventDefault();
        
        if (!examForm.symptoms.trim() || !examForm.preliminary_diagnosis.trim()) {
            alert('Vui lòng nhập đầy đủ triệu chứng và chẩn đoán sơ bộ!');
            return;
        }

        setSubmitting(true);

        try {
            // ALWAYS create NEW medicine record for each visit (support multiple visits)
            const newRecordRes = await createMedicineRecord({
                patient_id: selectedPatient.id
            });
            
            if (!newRecordRes.success) {
                throw new Error('Không thể tạo hồ sơ bệnh án mới');
            }

            // Create exam result
            const examData = {
                medicineRecord_id: newRecordRes.data.id,
                symptoms: examForm.symptoms,
                preliminary_diagnosis: examForm.preliminary_diagnosis,
                doctor_id: currentDoctorId,
                notes: examForm.notes || ''
            };

            const examResultRes = await createExamResult(examData);
            
            if (examResultRes.success) {
                // Update to InProgress (ready for service assignment)
                await updateWaitlistStatus(selectedWaitlistItem.id, 'InProgress');
                alert('✅ Đã hoàn thành khám lâm sàng!');
                setShowExamModal(false);
                fetchDashboardData();
            } else {
                throw new Error('Không thể lưu kết quả khám');
            }

        } catch (error) {
            console.error('Error saving exam result:', error);
            alert('❌ Có lỗi xảy ra khi lưu kết quả khám: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle diagnosis modal
    const handleOpenDiagnosisModal = (waitlistItem) => {
        const currentVisit = getServiceOrderData(waitlistItem.patient_id);
        if (!currentVisit || !currentVisit.serviceOrder) return;
        
        setSelectedServiceOrder(currentVisit.serviceOrder);
        setSelectedWaitlistItem(waitlistItem);
        setDiagnosisForm({ conclusion: '', disease: '', treatment_plan: '' });
        setSelectedMedicines([]);
        setCurrentModalStep(1);
        setShowDiagnosisModal(true);
    };

    // Medicine selection handlers
    const handleMedicineToggle = (medicineId) => {
        setSelectedMedicines(prev => {
            const existingIndex = prev.findIndex(item => item.medicineId === medicineId);
            if (existingIndex >= 0) {
                return prev.filter(item => item.medicineId !== medicineId);
            } else {
                return [...prev, { medicineId, quantity: 1, dosage: '1 viên x 3 lần/ngày' }];
            }
        });
    };

    const handleMedicineChange = (medicineId, field, value) => {
        setSelectedMedicines(prev => 
            prev.map(item => 
                item.medicineId === medicineId ? { ...item, [field]: value } : item
            )
        );
    };

    const getMedicinePrice = (medicine) => {
        return medicine.price && !isNaN(medicine.price) 
            ? new Intl.NumberFormat('vi-VN').format(medicine.price) + ' VNĐ'
            : 'Liên hệ';
    };

    // Handle diagnosis submission  
    const handleDiagnosisSubmit = async (e) => {
        e.preventDefault();
        
        if (!diagnosisForm.conclusion.trim() || !diagnosisForm.disease.trim() || !diagnosisForm.treatment_plan.trim()) {
            alert('Vui lòng nhập đầy đủ thông tin kết luận điều trị!');
            return;
        }

        setDiagnosisSubmitting(true);

        try {
            const diagnosisData = {
                doctor_id: currentDoctorId,
                medicineRecord_id: selectedServiceOrder.medicineRecord_id,
                conclusion: diagnosisForm.conclusion,
                disease: diagnosisForm.disease,
                treatment_plan: diagnosisForm.treatment_plan
            };

            const result = await createDiagnosis(diagnosisData);
            if (result.success) {
                await fetchDashboardData();
                setCurrentModalStep(2);
                alert('✅ Lưu kết luận điều trị thành công!');
            } else {
                throw new Error('Không thể lưu kết luận điều trị');
            }

        } catch (error) {
            console.error('Error creating diagnosis:', error);
            alert('❌ Có lỗi xảy ra khi lưu kết luận điều trị!');
        } finally {
            setDiagnosisSubmitting(false);
        }
    };

    // Handle prescription submission
    const handlePrescriptionSubmit = async () => {
        if (selectedMedicines.length === 0) {
            alert('Vui lòng chọn ít nhất một loại thuốc hoặc bỏ qua để hoàn thành!');
            return;
        }

        const invalidMedicines = selectedMedicines.filter(item => !item.quantity || !item.dosage);
        if (invalidMedicines.length > 0) {
            alert('Vui lòng nhập đầy đủ số lượng và liều dùng cho tất cả thuốc!');
            return;
        }

        setDiagnosisSubmitting(true);

        try {
            // Create prescription
            const prescriptionData = {
                medicineRecord_id: selectedServiceOrder.medicineRecord_id,
                doctor_id: currentDoctorId,
                prescription_date: new Date().toISOString().split('T')[0],
                status: 'Pending'
            };

            const prescriptionRes = await createPrescription(prescriptionData);
            if (!prescriptionRes.success) throw new Error('Không thể tạo đơn thuốc');

            // Create prescription invoice
            const invoiceData = {
                invoice_id: `INV${Date.now()}`,
                pharmacist_id: '1',
                prescription_id: prescriptionRes.data.id
            };

            const invoiceRes = await createPrescriptionInvoice(invoiceData);
            if (!invoiceRes.success) throw new Error('Không thể tạo hóa đơn thuốc');

            // Create medicine details
            for (const medicine of selectedMedicines) {
                const medicineDetailData = {
                    prescription_invoice_id: invoiceRes.data.id,
                    medicine_id: medicine.medicineId,
                    quantity: medicine.quantity.toString(),
                    dosage: medicine.dosage
                };
                await createMedicineDetail(medicineDetailData);
            }

            // Complete treatment
            await updateWaitlistStatus(selectedWaitlistItem.id, 'Complete');
            alert('✅ Hoàn thành toàn bộ quy trình điều trị!');
            setShowDiagnosisModal(false);
            await fetchDashboardData();

        } catch (error) {
            console.error('Error creating prescription:', error);
            alert('❌ Có lỗi xảy ra khi kê đơn thuốc: ' + error.message);
        } finally {
            setDiagnosisSubmitting(false);
        }
    };

    // Skip prescription
    const handleSkipPrescription = async () => {
        try {
            await updateWaitlistStatus(selectedWaitlistItem.id, 'Complete');
            alert('✅ Hoàn thành kết luận điều trị!');
            setShowDiagnosisModal(false);
            await fetchDashboardData();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('✅ Hoàn thành kết luận điều trị!');
            setShowDiagnosisModal(false);
            await fetchDashboardData();
        }
    };

    // ====================================================================================
    // RENDER COMPONENTS
    // ====================================================================================

    const renderWaitlistSection = (title, items, color, onAction, actionText, actionType) => (
        <div className="card border-0 shadow-sm mb-4">
            <div className={`card-header bg-${color} text-white`}>
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <i className="fas fa-clipboard-list me-2"></i>
                        {title}
                    </h5>
                    <span className="badge bg-light text-dark fs-6">
                        {items.length} bệnh nhân
                    </span>
                </div>
            </div>
            <div className="card-body p-0">
                {items.length === 0 ? (
                    <div className="text-center py-5">
                        <i className="fas fa-clipboard-list fs-1 text-muted mb-3"></i>
                        <h5 className="text-muted">Không có bệnh nhân nào</h5>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>STT</th>
                                    <th>Bệnh nhân</th>
                                    <th>Phòng</th>
                                    <th>Thời gian</th>
                                    <th>Trạng thái</th>
                                    {actionText && <th>Thao tác</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => {
                                    const patient = getPatientInfo(item.patient_id);
                                    const room = getRoomInfo(item.room_id);
                                    
                                    return (
                                        <tr key={item.id}>
                                            <td className="fw-bold text-primary">{index + 1}</td>
                                            <td>
                                                <div>
                                                    <div className="fw-semibold">{patient.full_name}</div>
                                                    <small className="text-muted">{patient.phone}</small>
                                                </div>
                                            </td>
                                            <td>{room.room_name}</td>
                                            <td>{formatTime(item.estimated_time)}</td>
                                            <td>
                                                <span className={`badge bg-${color}`}>
                                                    {item.status === 'Waiting' && item.visittype === 'Initial' && 'Chờ khám'}
                                                    {item.status === 'InProgress' && item.visittype === 'Initial' && 'Cần chỉ định'}
                                                    {item.status === 'Waiting' && item.visittype === 'Result' && 'Đang thực hiện'}
                                                    {item.status === 'Complete' && 'Hoàn thành'}
                                                </span>
                                            </td>
                                            {actionText && (
                                                <td>
                                                    <button
                                                        className={`btn btn-${color} btn-sm`}
                                                        onClick={() => onAction(item, actionType)}
                                                    >
                                                        <i className="fas fa-stethoscope me-1"></i>
                                                        {actionText}
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="container-fluid py-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <DoctorHeader />
            <div className="container-fluid py-4">
                {/* Dashboard Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold text-dark mb-1">
                            <i className="fas fa-chart-line text-primary me-2"></i>
                            Dashboard Bác Sĩ
                        </h2>
                        <p className="text-muted mb-0">Quản lý quy trình khám chữa bệnh</p>
                    </div>
                    <button 
                        className="btn btn-outline-primary"
                        onClick={fetchDashboardData}
                        disabled={loading}
                    >
                        <i className="fas fa-sync-alt me-2"></i>
                        Làm mới
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="row mb-4">
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <div className="text-info fs-1 mb-2">
                                    <i className="fas fa-clock"></i>
                                </div>
                                <h3 className="fw-bold text-info">{getWaitingForExam().length}</h3>
                                <p className="text-muted mb-0">Chờ khám</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <div className="text-warning fs-1 mb-2">
                                    <i className="fas fa-stethoscope"></i>
                                </div>
                                <h3 className="fw-bold text-warning">
                                    {getReadyForServiceAssignment().length + getServicesInProgress().length + getReadyForDiagnosis().length}
                                </h3>
                                <p className="text-muted mb-0">Đang điều trị</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <div className="text-success fs-1 mb-2">
                                    <i className="fas fa-check-double"></i>
                                </div>
                                <h3 className="fw-bold text-success">{getTreatmentCompleted().length}</h3>
                                <p className="text-muted mb-0">Đã hoàn thành</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <div className="text-primary fs-1 mb-2">
                                    <i className="fas fa-users"></i>
                                </div>
                                <h3 className="fw-bold text-primary">{waitlist.length}</h3>
                                <p className="text-muted mb-0">Tổng số</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Workflow Sections */}
                {renderWaitlistSection(
                    "1. Bệnh Nhân Chờ Khám Lâm Sàng", 
                    getWaitingForExam(), 
                    "info", 
                    handleStartExam, 
                    "Khám", 
                    "exam"
                )}

                {renderWaitlistSection(
                    "2. Đã Khám - Cần Chỉ Định Dịch Vụ", 
                    getReadyForServiceAssignment(), 
                    "warning", 
                    handleStartExam, 
                    "Chỉ định dịch vụ", 
                    "assign"
                )}

                {renderWaitlistSection(
                    "3. Đang Thực Hiện Dịch Vụ", 
                    getServicesInProgress(), 
                    "secondary", 
                    handleStartExam, 
                    "Xem", 
                    "view"
                )}

                {renderWaitlistSection(
                    "4. Có Kết Quả - Cần Kết Luận Điều Trị", 
                    getReadyForDiagnosis(), 
                    "danger", 
                    handleOpenDiagnosisModal, 
                    "Kết luận điều trị", 
                    "diagnosis"
                )}

                {renderWaitlistSection(
                    "5. Đã Hoàn Thành Điều Trị", 
                    getTreatmentCompleted(), 
                    "success", 
                    null, 
                    null, 
                    null
                )}

                {/* Exam Modal */}
                {showExamModal && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header bg-primary text-white">
                                    <h5 className="modal-title">
                                        <i className="fas fa-stethoscope me-2"></i>
                                        Khám Bệnh Lâm Sàng
                                    </h5>
                                    <button 
                                        type="button" 
                                        className="btn-close btn-close-white" 
                                        onClick={() => setShowExamModal(false)}
                                        disabled={submitting}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    {/* Patient Info */}
                                    <div className="alert alert-info">
                                        <h6 className="mb-2">
                                            <i className="fas fa-user me-2"></i>
                                            Thông tin bệnh nhân
                                        </h6>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <strong>Họ tên:</strong> {selectedPatient?.full_name}
                                            </div>
                                            <div className="col-md-6">
                                                <strong>Giới tính:</strong> {selectedPatient?.gender}
                                            </div>
                                            <div className="col-md-6">
                                                <strong>Ngày sinh:</strong> {selectedPatient?.dob}
                                            </div>
                                            <div className="col-md-6">
                                                <strong>Điện thoại:</strong> {selectedPatient?.phone}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Exam Form */}
                                    <form onSubmit={handleExamSubmit}>
                                        <div className="row">
                                            <div className="col-12 mb-3">
                                                <label className="form-label fw-semibold">
                                                    <i className="fas fa-thermometer-half me-2 text-danger"></i>
                                                    Triệu chứng <span className="text-danger">*</span>
                                                </label>
                                                <textarea
                                                    className="form-control"
                                                    rows="4"
                                                    placeholder="Mô tả các triệu chứng của bệnh nhân..."
                                                    value={examForm.symptoms}
                                                    onChange={(e) => setExamForm(prev => ({...prev, symptoms: e.target.value}))}
                                                    required
                                                    disabled={submitting}
                                                />
                                            </div>

                                            <div className="col-12 mb-3">
                                                <label className="form-label fw-semibold">
                                                    <i className="fas fa-diagnoses me-2 text-primary"></i>
                                                    Chẩn đoán sơ bộ <span className="text-danger">*</span>
                                                </label>
                                                <textarea
                                                    className="form-control"
                                                    rows="3"
                                                    placeholder="Nhập chẩn đoán sơ bộ..."
                                                    value={examForm.preliminary_diagnosis}
                                                    onChange={(e) => setExamForm(prev => ({...prev, preliminary_diagnosis: e.target.value}))}
                                                    required
                                                    disabled={submitting}
                                                />
                                            </div>

                                            <div className="col-12 mb-3">
                                                <label className="form-label fw-semibold">
                                                    <i className="fas fa-sticky-note me-2 text-warning"></i>
                                                    Ghi chú thêm
                                                </label>
                                                <textarea
                                                    className="form-control"
                                                    rows="2"
                                                    placeholder="Ghi chú thêm (tùy chọn)..."
                                                    value={examForm.notes}
                                                    onChange={(e) => setExamForm(prev => ({...prev, notes: e.target.value}))}
                                                    disabled={submitting}
                                                />
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <div className="modal-footer">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary" 
                                        onClick={() => setShowExamModal(false)}
                                        disabled={submitting}
                                    >
                                        <i className="fas fa-times me-2"></i>
                                        Hủy
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        onClick={handleExamSubmit}
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Đang lưu...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save me-2"></i>
                                                Lưu kết quả khám
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Diagnosis Modal */}
                {showDiagnosisModal && selectedServiceOrder && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                        <div className="modal-dialog modal-xl">
                            <div className="modal-content">
                                <div className="modal-header bg-warning text-dark">
                                    <h5 className="modal-title">
                                        <i className="fas fa-file-medical me-2"></i>
                                        {currentModalStep === 1 ? 'Kết Luận Điều Trị' : 'Kê Đơn Thuốc'}
                                    </h5>
                                    <div className="d-flex align-items-center">
                                        <span className={`badge me-2 ${currentModalStep === 1 ? 'bg-primary' : 'bg-secondary'}`}>
                                            1. Kết luận
                                        </span>
                                        <span className={`badge ${currentModalStep === 2 ? 'bg-primary' : 'bg-secondary'}`}>
                                            2. Kê đơn thuốc
                                        </span>
                                    </div>
                                    <button 
                                        type="button" 
                                        className="btn-close" 
                                        onClick={() => setShowDiagnosisModal(false)}
                                        disabled={diagnosisSubmitting}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    {/* Patient Info */}
                                    {(() => {
                                        const medicineRecord = medicineRecords.find(record => record.id === selectedServiceOrder.medicineRecord_id);
                                        const patient = medicineRecord ? getPatientInfo(medicineRecord.patient_id) : null;
                                        
                                        return (
                                            <div className="row mb-4">
                                                <div className="col-12">
                                                    <div className="card bg-light">
                                                        <div className="card-body">
                                                            <h6 className="fw-bold text-primary mb-3">
                                                                <i className="fas fa-user me-2"></i>
                                                                Thông tin bệnh nhân
                                                            </h6>
                                                            <div className="row">
                                                                <div className="col-md-4">
                                                                    <p><strong>Họ tên:</strong> {patient?.full_name || 'N/A'}</p>
                                                                    <p><strong>Điện thoại:</strong> {patient?.phone || 'N/A'}</p>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <p><strong>Ngày sinh:</strong> {patient?.dob || 'N/A'}</p>
                                                                    <p><strong>Giới tính:</strong> {patient?.gender || 'N/A'}</p>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <p><strong>Ngày chỉ định:</strong> {new Date(selectedServiceOrder.order_date).toLocaleDateString('vi-VN')}</p>
                                                                    <p><strong>Mã đơn:</strong> SO-{selectedServiceOrder.id}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Step 1: Service Results and Diagnosis Form */}
                                    {currentModalStep === 1 && (
                                        <>
                                            {/* Service Results */}
                                            <div className="row mb-4">
                                                <div className="col-12">
                                                    <h6 className="fw-bold text-success mb-3">
                                                        <i className="fas fa-clipboard-list me-2"></i>
                                                        Kết quả dịch vụ đã thực hiện
                                                    </h6>
                                            <div className="table-responsive">
                                                <table className="table table-bordered">
                                                    <thead className="table-success">
                                                        <tr>
                                                            <th>STT</th>
                                                            <th>Tên dịch vụ</th>
                                                            <th>Kết quả</th>
                                                            <th>Bác sĩ thực hiện</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {serviceOrderItems.filter(item => item.service_order_id === selectedServiceOrder.id).map((item, index) => {
                                                            const service = getServiceInfo(item.service_id);
                                                            const result = serviceResults.find(r => r.service_order_item_id === item.id);
                                                            
                                                            return (
                                                                <tr key={item.id}>
                                                                    <td>{index + 1}</td>
                                                                    <td>
                                                                        <strong>{service.name || 'Dịch vụ không xác định'}</strong>
                                                                        <br />
                                                                        <small className="text-muted">{service.description || ''}</small>
                                                                    </td>
                                                                    <td>
                                                                        {result ? (
                                                                            <div className="text-wrap" style={{maxWidth: '300px'}}>
                                                                                {result.result_description}
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-muted">Chưa có kết quả</span>
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        <span className="badge bg-primary">
                                                                            BS {item.doctor_id}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Diagnosis Form */}
                                    <form onSubmit={handleDiagnosisSubmit}>
                                        <div className="row">
                                            <div className="col-12">
                                                <h6 className="fw-bold text-warning mb-3">
                                                    <i className="fas fa-edit me-2"></i>
                                                    Nhập kết luận điều trị
                                                </h6>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">
                                                    <strong>Chẩn đoán bệnh:</strong>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={diagnosisForm.disease}
                                                    onChange={(e) => setDiagnosisForm({...diagnosisForm, disease: e.target.value})}
                                                    placeholder="Nhập tên bệnh..."
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">
                                                    <strong>Kế hoạch điều trị:</strong>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={diagnosisForm.treatment_plan}
                                                    onChange={(e) => setDiagnosisForm({...diagnosisForm, treatment_plan: e.target.value})}
                                                    placeholder="Nhập kế hoạch điều trị..."
                                                    required
                                                />
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label">
                                                    <strong>Kết luận chi tiết:</strong>
                                                </label>
                                                <textarea
                                                    className="form-control"
                                                    rows="4"
                                                    value={diagnosisForm.conclusion}
                                                    onChange={(e) => setDiagnosisForm({...diagnosisForm, conclusion: e.target.value})}
                                                    placeholder="Nhập kết luận chi tiết dựa trên kết quả các dịch vụ đã thực hiện..."
                                                    required
                                                ></textarea>
                                            </div>
                                        </div>
                                    </form>
                                        </>
                                    )}

                                    {/* Step 2: Prescription Form */}
                                    {currentModalStep === 2 && (
                                        <div className="row">
                                            <div className="col-12">
                                                <h6 className="fw-bold text-primary mb-3">
                                                    <i className="fas fa-pills me-2"></i>
                                                    Kê đơn thuốc điều trị
                                                </h6>
                                                
                                                {/* Selected Medicines Summary */}
                                                {selectedMedicines.length > 0 && (
                                                    <div className="alert alert-success">
                                                        <h6 className="mb-2">
                                                            <i className="fas fa-check-circle me-2"></i>
                                                            Thuốc đã chọn ({selectedMedicines.length})
                                                        </h6>
                                                        {selectedMedicines.map((item) => {
                                                            const medicine = medicines.find(m => m.id === item.medicineId);
                                                            return (
                                                                <div key={item.medicineId} className="d-flex justify-content-between align-items-center mb-2">
                                                                    <div>
                                                                        <strong>{medicine?.name}</strong>
                                                                        <br />
                                                                        <small className="text-muted">
                                                                            SL: {item.quantity} | Liều: {item.dosage}
                                                                        </small>
                                                                    </div>
                                                                    <span className="badge bg-primary">
                                                                        {getMedicinePrice(medicine)}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {/* Medicine Selection Table */}
                                                <div className="table-responsive" style={{maxHeight: '400px', overflowY: 'auto'}}>
                                                    <table className="table table-hover">
                                                        <thead className="table-light sticky-top">
                                                            <tr>
                                                                <th width="50">Chọn</th>
                                                                <th>Tên Thuốc</th>
                                                                <th>Thành Phần</th>
                                                                <th>Công Dụng</th>
                                                                <th>Giá</th>
                                                                <th>Số Lượng</th>
                                                                <th>Liều Dùng</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {medicines.map((medicine) => {
                                                                const isSelected = selectedMedicines.some(item => item.medicineId === medicine.id);
                                                                const selectedMedicine = selectedMedicines.find(item => item.medicineId === medicine.id);
                                                                
                                                                return (
                                                                    <tr key={medicine.id} className={isSelected ? 'table-warning' : ''}>
                                                                        <td>
                                                                            <input
                                                                                type="checkbox"
                                                                                className="form-check-input"
                                                                                checked={isSelected}
                                                                                onChange={() => handleMedicineToggle(medicine.id)}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <strong>{medicine.name}</strong>
                                                                        </td>
                                                                        <td>
                                                                            <small className="text-muted">{medicine.ingredient}</small>
                                                                        </td>
                                                                        <td>
                                                                            <small className="text-muted">{medicine.usage}</small>
                                                                        </td>
                                                                        <td>
                                                                            <span className="badge bg-info">
                                                                                {getMedicinePrice(medicine)}
                                                                            </span>
                                                                        </td>
                                                                        <td>
                                                                            {isSelected ? (
                                                                                <input
                                                                                    type="number"
                                                                                    className="form-control form-control-sm"
                                                                                    style={{width: '80px'}}
                                                                                    min="1"
                                                                                    value={selectedMedicine?.quantity || 1}
                                                                                    onChange={(e) => handleMedicineChange(medicine.id, 'quantity', parseInt(e.target.value))}
                                                                                />
                                                                            ) : (
                                                                                <span className="text-muted">--</span>
                                                                            )}
                                                                        </td>
                                                                        <td>
                                                                            {isSelected ? (
                                                                                <input
                                                                                    type="text"
                                                                                    className="form-control form-control-sm"
                                                                                    style={{width: '150px'}}
                                                                                    placeholder="1 viên x 3 lần/ngày"
                                                                                    value={selectedMedicine?.dosage || ''}
                                                                                    onChange={(e) => handleMedicineChange(medicine.id, 'dosage', e.target.value)}
                                                                                />
                                                                            ) : (
                                                                                <span className="text-muted">--</span>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    {currentModalStep === 1 ? (
                                        <>
                                            <button 
                                                type="button" 
                                                className="btn btn-secondary"
                                                onClick={() => setShowDiagnosisModal(false)}
                                                disabled={diagnosisSubmitting}
                                            >
                                                <i className="fas fa-times me-2"></i>
                                                Hủy
                                            </button>
                                            <button 
                                                type="button"
                                                className="btn btn-warning"
                                                onClick={handleDiagnosisSubmit}
                                                disabled={diagnosisSubmitting}
                                            >
                                                {diagnosisSubmitting ? (
                                                    <>
                                                        <div className="spinner-border spinner-border-sm me-2" role="status">
                                                            <span className="visually-hidden">Đang xử lý...</span>
                                                        </div>
                                                        Đang lưu...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-arrow-right me-2"></i>
                                                        Tiếp theo: Kê đơn thuốc
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button 
                                                type="button" 
                                                className="btn btn-secondary"
                                                onClick={() => setCurrentModalStep(1)}
                                                disabled={diagnosisSubmitting}
                                            >
                                                <i className="fas fa-arrow-left me-2"></i>
                                                Quay lại
                                            </button>
                                            <button 
                                                type="button" 
                                                className="btn btn-outline-success"
                                                onClick={handleSkipPrescription}
                                                disabled={diagnosisSubmitting}
                                            >
                                                <i className="fas fa-check me-2"></i>
                                                Bỏ qua - Hoàn thành
                                            </button>
                                            <button 
                                                type="button"
                                                className="btn btn-success"
                                                onClick={handlePrescriptionSubmit}
                                                disabled={diagnosisSubmitting || selectedMedicines.length === 0}
                                            >
                                                {diagnosisSubmitting ? (
                                                    <>
                                                        <div className="spinner-border spinner-border-sm me-2" role="status">
                                                            <span className="visually-hidden">Đang xử lý...</span>
                                                        </div>
                                                        Đang kê đơn...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-prescription-bottle me-2"></i>
                                                        Kê đơn thuốc ({selectedMedicines.length})
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default DoctorDashboard; 