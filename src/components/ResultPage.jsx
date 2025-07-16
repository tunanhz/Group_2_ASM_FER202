import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorHeader from './DoctorHeader';
import PDFExport from './PDFExport';
import { 
    getServiceOrders,
    getServiceOrderItems,
    getResultsOfParaclinicalServices,
    getMedicalServices,
    getPatients,
    getMedicineRecords,
    getDiagnosis,
    getPrescriptions,
    getMedicines
} from '../services/api';

const ResultPage = () => {
    const navigate = useNavigate();
    
    const [serviceOrders, setServiceOrders] = useState([]);
    const [serviceOrderItems, setServiceOrderItems] = useState([]);
    const [serviceResults, setServiceResults] = useState([]);
    const [medicalServices, setMedicalServices] = useState([]);
    const [patients, setPatients] = useState([]);
    const [medicineRecords, setMedicineRecords] = useState([]);
    const [diagnosisData, setDiagnosisData] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [medicineDetails, setMedicineDetails] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDoctorId] = useState('1'); // Mock - should come from auth

    useEffect(() => {
        fetchData();
    }, [currentDoctorId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            const [serviceOrdersData, serviceOrderItemsData, serviceResultsData, medicalServicesData, patientsData, medicineRecordsData, medicinesData] = await Promise.all([
                getServiceOrders(),
                getServiceOrderItems(),
                getResultsOfParaclinicalServices(),
                getMedicalServices(),
                getPatients(),
                getMedicineRecords(),
                getMedicines()
            ]);

            if (serviceOrdersData.success) {
                setServiceOrders(serviceOrdersData.data);
            }

            if (serviceOrderItemsData.success) {
                setServiceOrderItems(serviceOrderItemsData.data);
            }

            if (serviceResultsData.success) {
                setServiceResults(serviceResultsData.data);
            }

            if (medicalServicesData.success) {
                setMedicalServices(medicalServicesData.data);
            }

            if (patientsData.success) {
                setPatients(patientsData.data);
            }

            if (medicineRecordsData.success) {
                setMedicineRecords(medicineRecordsData.data);
            }

            if (medicinesData.success) {
                setMedicines(medicinesData.data);
            }

            // Load diagnosis data for each service order
            const diagnosisPromises = serviceOrdersData.success ? serviceOrdersData.data.map(async (order) => {
                const diagnosisRes = await getDiagnosis(order.medicineRecord_id);
                return {
                    serviceOrderId: order.id,
                    medicineRecordId: order.medicineRecord_id,
                    diagnosis: diagnosisRes.success ? diagnosisRes.data : []
                };
            }) : [];

            const diagnosisResults = await Promise.all(diagnosisPromises);
            setDiagnosisData(diagnosisResults);

            // Load prescriptions for each medicine record
            const prescriptionPromises = medicineRecordsData.success ? medicineRecordsData.data.map(async (record) => {
                const prescriptionRes = await getPrescriptions(record.id);
                return {
                    medicineRecordId: record.id,
                    prescriptions: prescriptionRes.success ? prescriptionRes.data : []
                };
            }) : [];

            const prescriptionResults = await Promise.all(prescriptionPromises);
            setPrescriptions(prescriptionResults);

            // Load prescription invoices and medicine details for all prescriptions
            const allPrescriptions = prescriptionResults.flatMap(result => result.prescriptions);
            const prescriptionInvoicePromises = allPrescriptions.map(async (prescription) => {
                // Assuming getPrescriptionInvoiceByPrescriptionId is replaced by getPrescriptionInvoice
                // For now, we'll just return a placeholder or remove if not directly used here
                // If getPrescriptionInvoiceByPrescriptionId is still needed, it needs to be re-added or replaced
                // For now, removing as per new_code
                return {
                    prescriptionId: prescription.id,
                    prescriptionInvoice: null // Placeholder, as getPrescriptionInvoiceByPrescriptionId is removed
                };
            });

            const prescriptionInvoiceResults = await Promise.all(prescriptionInvoicePromises);
            
            // Load medicine details for all prescription invoices
            const medicineDetailPromises = prescriptionInvoiceResults
                .filter(result => result.prescriptionInvoice && result.prescriptionInvoice.length > 0)
                .map(async (result) => {
                    // Assuming getMedicineDetailsByPrescriptionInvoiceId is replaced by getMedicineDetails
                    // For now, we'll just return a placeholder or remove if not directly used here
                    // If getMedicineDetailsByPrescriptionInvoiceId is still needed, it needs to be re-added or replaced
                    // For now, removing as per new_code
                    return {
                        prescriptionId: result.prescriptionId,
                        prescriptionInvoiceId: result.prescriptionInvoice.id, // Placeholder
                        medicineDetails: [] // Placeholder
                    };
                });

            const medicineDetailResults = await Promise.all(medicineDetailPromises);
            setMedicineDetails(medicineDetailResults);
            
            // Debug logging
            console.log('Prescription results:', prescriptionResults);
            console.log('Medicine detail results:', medicineDetailResults);

        } catch (error) {
            console.error('Error fetching data:', error);
            alert('❌ Có lỗi xảy ra khi tải dữ liệu: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const getPatientInfo = (medicineRecordId) => {
        const medicineRecord = medicineRecords.find(record => record.id === medicineRecordId);
        if (!medicineRecord) return null;
        
        return patients.find(patient => patient.id === medicineRecord.patient_id);
    };

    const getServiceOrderItemsForOrder = (serviceOrderId) => {
        return serviceOrderItems.filter(item => item.service_order_id === serviceOrderId);
    };

    const getServiceResultsForOrder = (serviceOrderId) => {
        const orderItems = getServiceOrderItemsForOrder(serviceOrderId);
        return serviceResults.filter(result => 
            orderItems.some(item => item.id === result.service_order_item_id)
        );
    };

    const getServiceInfo = (serviceId) => {
        return medicalServices.find(service => service.id === serviceId);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    // Get diagnosis for a service order
    const getDiagnosisForServiceOrder = (serviceOrderId) => {
        const diagnosisEntry = diagnosisData.find(entry => entry.serviceOrderId === serviceOrderId);
        return diagnosisEntry ? diagnosisEntry.diagnosis : [];
    };

    // Get prescriptions for a medicine record
    const getPrescriptionsForMedicineRecord = (medicineRecordId) => {
        const prescriptionEntry = prescriptions.find(entry => entry.medicineRecordId === medicineRecordId);
        return prescriptionEntry ? prescriptionEntry.prescriptions : [];
    };

    // Get medicine details for a prescription
    const getMedicineDetailsForPrescription = (prescriptionId) => {
        const medicineDetailEntry = medicineDetails.find(entry => entry.prescriptionId === prescriptionId);
        return medicineDetailEntry ? medicineDetailEntry.medicineDetails : [];
    };

    // Get medicine info by ID
    const getMedicineInfo = (medicineId) => {
        return medicines.find(medicine => medicine.id === medicineId);
    };

    // Filter service orders that are completed AND have diagnosis
    const completedServiceOrdersWithDiagnosis = serviceOrders.filter(order => {
        const orderItems = getServiceOrderItemsForOrder(order.id);
        const results = getServiceResultsForOrder(order.id);
        const diagnosis = getDiagnosisForServiceOrder(order.id);
        
        // Must have all results AND at least one diagnosis
        return orderItems.length > 0 && 
               results.length === orderItems.length && 
               diagnosis.length > 0;
    });

    if (loading) {
        return (
            <div className="container-fluid py-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-3">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <DoctorHeader />
            <div className="container-fluid py-4">
                {/* Page Header */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h2 className="mb-1">
                                    <i className="fas fa-file-medical-alt me-2 text-primary"></i>
                                    Kết Quả Dịch Vụ
                                </h2>
                                <p className="text-muted mb-0">Xem kết quả dịch vụ và kết luận điều trị</p>
                            </div>
                            <button 
                                className="btn btn-outline-primary"
                                onClick={fetchData}
                                disabled={loading}
                            >
                                <i className="fas fa-sync-alt me-2"></i>
                                Làm mới
                            </button>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="row mb-4">
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <div className="text-primary fs-1 mb-2">
                                    <i className="fas fa-clipboard-check"></i>
                                </div>
                                <h3 className="fw-bold text-primary">{completedServiceOrdersWithDiagnosis.length}</h3>
                                <p className="text-muted mb-0">Đơn có kết luận điều trị</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <div className="text-warning fs-1 mb-2">
                                    <i className="fas fa-users"></i>
                                </div>
                                <h3 className="fw-bold text-warning">
                                    {new Set(completedServiceOrdersWithDiagnosis.map(order => order.medicineRecord_id)).size}
                                </h3>
                                <p className="text-muted mb-0">Bệnh nhân</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <div className="text-success fs-1 mb-2">
                                    <i className="fas fa-pills"></i>
                                </div>
                                <h3 className="fw-bold text-success">
                                    {prescriptions.reduce((total, entry) => total + entry.prescriptions.length, 0)}
                                </h3>
                                <p className="text-muted mb-0">Đơn thuốc đã kê</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <div className="text-info fs-1 mb-2">
                                    <i className="fas fa-calendar-day"></i>
                                </div>
                                <h3 className="fw-bold text-info">
                                    {new Date().toLocaleDateString('vi-VN')}
                                </h3>
                                <p className="text-muted mb-0">Hôm nay</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Service Orders with Diagnosis */}
                {completedServiceOrdersWithDiagnosis.length === 0 ? (
                    <div className="row">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center py-5">
                                    <i className="fas fa-file-medical fa-3x text-muted mb-3"></i>
                                    <h5 className="text-muted">Chưa có đơn nào được kết luận điều trị</h5>
                                    <p className="text-muted">Các đơn dịch vụ đã được kết luận điều trị sẽ xuất hiện ở đây</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    completedServiceOrdersWithDiagnosis.map((serviceOrder) => {
                        const patient = getPatientInfo(serviceOrder.medicineRecord_id);
                        const orderItems = getServiceOrderItemsForOrder(serviceOrder.id);
                        const results = getServiceResultsForOrder(serviceOrder.id);
                        
                        return (
                            <div key={serviceOrder.id} className="row mb-4">
                                <div className="col-12">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-success text-white">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h5 className="mb-1">
                                                        <i className="fas fa-user me-2"></i>
                                                        {patient?.full_name || 'Bệnh nhân không xác định'}
                                                    </h5>
                                                    <small>
                                                        Ngày chỉ định: {formatDate(serviceOrder.order_date)}
                                                        {patient && (
                                                            <span className="ms-3">
                                                                <i className="fas fa-phone me-1"></i>
                                                                {patient.phone}
                                                            </span>
                                                        )}
                                                    </small>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <span className="badge bg-light text-dark me-3">
                                                        {results.length} kết quả
                                                    </span>
                                                    <PDFExport
                                                        patient={patient}
                                                        serviceOrder={serviceOrder}
                                                        serviceResults={results}
                                                        diagnosis={getDiagnosisForServiceOrder(serviceOrder.id)}
                                                        prescriptions={getPrescriptionsForMedicineRecord(serviceOrder.medicineRecord_id)}
                                                        medicineDetails={medicineDetails}
                                                        medicines={medicines}
                                                        medicalServices={medicalServices}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            {/* Diagnosis Section */}
                                            {(() => {
                                                const diagnosis = getDiagnosisForServiceOrder(serviceOrder.id);
                                                return diagnosis.length > 0 && (
                                                    <div className="mb-4">
                                                        <h6 className="mb-3">
                                                            <i className="fas fa-file-medical me-2 text-warning"></i>
                                                            Kết Luận Điều Trị
                                                        </h6>
                                                        {diagnosis.map((diag, index) => (
                                                            <div key={diag.id} className="alert alert-warning">
                                                                <div className="row">
                                                                    <div className="col-md-4">
                                                                        <strong>Chẩn đoán:</strong> {diag.disease}
                                                                    </div>
                                                                    <div className="col-md-8">
                                                                        <strong>Kế hoạch điều trị:</strong> {diag.treatment_plan}
                                                                    </div>
                                                                    <div className="col-12 mt-2">
                                                                        <strong>Kết luận:</strong> {diag.conclusion}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            })()}

                                            <h6 className="mb-3">
                                                <i className="fas fa-clipboard-list me-2"></i>
                                                Kết Quả Dịch Vụ
                                            </h6>
                                            <div className="table-responsive">
                                                <table className="table table-hover mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Dịch Vụ</th>
                                                            <th>Kết Quả</th>
                                                            <th>Thời Gian</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {results.map((result) => {
                                                            const orderItem = orderItems.find(item => item.id === result.service_order_item_id);
                                                            const service = getServiceInfo(orderItem?.service_id);
                                                            
                                                            return (
                                                                <tr key={result.id}>
                                                                    <td>
                                                                        <strong>{service?.name || 'Dịch vụ không xác định'}</strong>
                                                                        <br />
                                                                        <small className="text-muted">{service?.description}</small>
                                                                    </td>
                                                                    <td>
                                                                        <span className="text-wrap" style={{maxWidth: '300px', display: 'inline-block'}}>
                                                                            {result.result_description}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="badge bg-info">
                                                                            {formatDate(result.created_at)}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Prescription Section */}
                                            {(() => {
                                                const patientPrescriptions = getPrescriptionsForMedicineRecord(serviceOrder.medicineRecord_id);
                                                return patientPrescriptions.length > 0 && (
                                                    <div className="mt-4">
                                                        <h6 className="mb-3">
                                                            <i className="fas fa-pills me-2 text-success"></i>
                                                            Đơn Thuốc Đã Kê ({patientPrescriptions.length} đơn)
                                                        </h6>
                                                        {patientPrescriptions.map((prescription, prescriptionIndex) => {
                                                            const prescriptionMedicineDetails = getMedicineDetailsForPrescription(prescription.id);
                                                            
                                                            return (
                                                                <div key={prescription.id} className="card border-success mb-3">
                                                                    <div className="card-header bg-success text-white">
                                                                        <div className="d-flex justify-content-between align-items-center">
                                                                            <div>
                                                                                <strong>Đơn thuốc #{prescriptionIndex + 1}</strong>
                                                                              
                                                                            </div>
                                                                            <div className="text-end">
                                                                                <span className="badge bg-light text-dark mb-1">
                                                                                    {prescriptionMedicineDetails.length} loại thuốc
                                                                                </span>
                                                                                <br />
                                                                             
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="card-body">
                                                                        {prescriptionMedicineDetails.length > 0 ? (
                                                                            <div className="table-responsive">
                                                                                <table className="table table-sm mb-0">
                                                                                    <thead className="table-light">
                                                                                        <tr>
                                                                                            <th>STT</th>
                                                                                            <th>Tên Thuốc</th>
                                                                                            <th>Liều Lượng</th>
                                                                                            <th>Số Lượng</th>
                                                                                            <th>Ghi Chú</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {prescriptionMedicineDetails.map((medicineDetail, index) => {
                                                                                            const medicine = getMedicineInfo(medicineDetail.medicine_id);
                                                                                            return (
                                                                                                <tr key={medicineDetail.id}>
                                                                                                    <td>{index + 1}</td>
                                                                                                    <td>
                                                                                                        <strong>{medicine?.name || 'Thuốc không xác định'}</strong>
                                                                                                        <br />
                                                                                                        <small className="text-muted">{medicine?.description || ''}</small>
                                                                                                        <br />
                                                                                                        <small className="text-info">ID: {medicineDetail.medicine_id}</small>
                                                                                                    </td>
                                                                                                    <td>
                                                                                                        <span className="badge bg-primary">
                                                                                                            {medicineDetail.dosage || 'Không có'}
                                                                                                        </span>
                                                                                                    </td>
                                                                                                    <td>
                                                                                                        <span className="badge bg-info">
                                                                                                            {medicineDetail.quantity || '0'}
                                                                                                        </span>
                                                                                                    </td>
                                                                                                    <td>
                                                                                                        <small className="text-muted">
                                                                                                            {medicineDetail.notes || 'Không có ghi chú'}
                                                                                                        </small>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            );
                                                                                        })}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="text-center text-muted py-3">
                                                                                <i className="fas fa-exclamation-triangle me-2"></i>
                                                                                Chưa có thông tin thuốc chi tiết
                                                                                <br />
                                                                                <small>Prescription ID: {prescription.id}</small>
                                                                                <br />
                                                                                <small>Debug: {JSON.stringify(medicineDetails.filter(entry => entry.prescriptionId === prescription.id))}</small>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </>
    );
};

export default ResultPage; 