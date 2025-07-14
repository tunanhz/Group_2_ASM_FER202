import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorHeader from './DoctorHeader';
import { 
    getServiceOrdersByDoctorId,
    getServiceOrderItems,
    getResultsOfParaclinicalServices,
    getMedicalServices,
    getPatients,
    getMedicineRecords,
    getDiagnosisByMedicineRecordId
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
    const [loading, setLoading] = useState(true);
    const [currentDoctorId] = useState('1'); // Mock - should come from auth

    useEffect(() => {
        fetchData();
    }, [currentDoctorId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            const [serviceOrdersRes, serviceOrderItemsRes, serviceResultsRes, medicalServicesRes, patientsRes, medicineRecordsRes] = await Promise.all([
                getServiceOrdersByDoctorId(currentDoctorId),
                getServiceOrderItems(),
                getResultsOfParaclinicalServices(),
                getMedicalServices(),
                getPatients(),
                getMedicineRecords()
            ]);

            if (serviceOrdersRes.success) {
                setServiceOrders(serviceOrdersRes.data);
            }

            if (serviceOrderItemsRes.success) {
                setServiceOrderItems(serviceOrderItemsRes.data);
            }

            if (serviceResultsRes.success) {
                setServiceResults(serviceResultsRes.data);
            }

            if (medicalServicesRes.success) {
                setMedicalServices(medicalServicesRes.data);
            }

            if (patientsRes.success) {
                setPatients(patientsRes.data);
            }

            if (medicineRecordsRes.success) {
                setMedicineRecords(medicineRecordsRes.data);
            }

            // Load diagnosis data for each service order
            const diagnosisPromises = serviceOrdersRes.success ? serviceOrdersRes.data.map(async (order) => {
                const diagnosisRes = await getDiagnosisByMedicineRecordId(order.medicineRecord_id);
                return {
                    serviceOrderId: order.id,
                    medicineRecordId: order.medicineRecord_id,
                    diagnosis: diagnosisRes.success ? diagnosisRes.data : []
                };
            }) : [];

            const diagnosisResults = await Promise.all(diagnosisPromises);
            setDiagnosisData(diagnosisResults);

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
                    <div className="col-md-4">
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
                    <div className="col-md-4">
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
                    <div className="col-md-4">
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
                                                <div>
                                                    <span className="badge bg-light text-dark">
                                                        {results.length} kết quả
                                                    </span>
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