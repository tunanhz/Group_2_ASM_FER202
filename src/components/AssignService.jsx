import React, { useState, useEffect } from 'react';
import DoctorHeader from './DoctorHeader';
import SimplePDFExport from './SimplePDFExport';
import { 
    getServiceOrderItemsByDoctorId,
    getMedicalServices,
    getServiceOrders,
    getPatients,
    getMedicineRecords,
    getResultsOfParaclinicalServices,
    getResultByServiceOrderItemId,
    createParaclinicalResult
} from '../services/api';

const AssignService = () => {
    const [assignedServices, setAssignedServices] = useState([]);
    const [medicalServices, setMedicalServices] = useState([]);
    const [serviceOrders, setServiceOrders] = useState([]);
    const [patients, setPatients] = useState([]);
    const [medicineRecords, setMedicineRecords] = useState([]);
    const [serviceResults, setServiceResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDoctorId] = useState('1'); // Mock - should come from auth
    
    // Result Modal States
    const [showResultModal, setShowResultModal] = useState(false);
    const [selectedServiceItem, setSelectedServiceItem] = useState(null);
    const [resultForm, setResultForm] = useState({
        result_description: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, [currentDoctorId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            const [servicesRes, medicalServicesRes, serviceOrdersRes, patientsRes, medicineRecordsRes, resultsRes] = await Promise.all([
                getServiceOrderItemsByDoctorId(currentDoctorId),
                getMedicalServices(),
                getServiceOrders(),
                getPatients(),
                getMedicineRecords(),
                getResultsOfParaclinicalServices()
            ]);

            if (servicesRes.success) {
                setAssignedServices(servicesRes.data);
            }

            if (medicalServicesRes.success) {
                setMedicalServices(medicalServicesRes.data);
            }

            if (serviceOrdersRes.success) {
                setServiceOrders(serviceOrdersRes.data);
            }

            if (patientsRes.success) {
                setPatients(patientsRes.data);
            }

            if (medicineRecordsRes.success) {
                setMedicineRecords(medicineRecordsRes.data);
            }

            if (resultsRes.success) {
                setServiceResults(resultsRes.data);
            }

        } catch (error) {
            console.error('Error fetching assigned services:', error);
            alert('❌ Có lỗi xảy ra khi tải dữ liệu: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const getServiceInfo = (serviceId) => {
        return medicalServices.find(service => service.id === serviceId);
    };

    const getServiceOrderInfo = (serviceOrderId) => {
        return serviceOrders.find(order => order.id === serviceOrderId);
    };

    const getPatientInfo = (medicineRecordId) => {
        const medicineRecord = medicineRecords.find(record => record.id === medicineRecordId);
        if (!medicineRecord) return null;
        
        return patients.find(patient => patient.id === medicineRecord.patient_id);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getServicePrice = (service) => {
        return service?.price && !isNaN(service.price) 
            ? new Intl.NumberFormat('vi-VN').format(service.price) + ' VNĐ'
            : 'Liên hệ';
    };

    // Check if service has result
    const hasServiceResult = (serviceOrderItemId) => {
        return serviceResults.some(result => result.service_order_item_id === serviceOrderItemId);
    };

    // Get service result
    const getServiceResult = (serviceOrderItemId) => {
        return serviceResults.find(result => result.service_order_item_id === serviceOrderItemId);
    };

    // Handle start service
    const handleStartService = (serviceItem) => {
        setSelectedServiceItem(serviceItem);
        setShowResultModal(true);
        setResultForm({
            result_description: ''
        });
    };

    // Handle result form submission
    const handleResultSubmit = async (e) => {
        e.preventDefault();
        
        if (!resultForm.result_description.trim()) {
            alert('Vui lòng nhập kết quả dịch vụ!');
            return;
        }

        setSubmitting(true);

        try {
            const resultData = {
                service_order_item_id: selectedServiceItem.id,
                result_description: resultForm.result_description,
                created_at: new Date().toISOString()
            };

            const resultRes = await createParaclinicalResult(resultData);
            
            if (resultRes.success) {
                alert('✅ Đã lưu kết quả dịch vụ thành công!');
                setShowResultModal(false);
                fetchData(); // Refresh data
            } else {
                throw new Error('Không thể lưu kết quả dịch vụ');
            }

        } catch (error) {
            console.error('Error saving service result:', error);
            alert('❌ Có lỗi xảy ra khi lưu kết quả: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const groupedServices = assignedServices.reduce((groups, service) => {
        const serviceOrder = getServiceOrderInfo(service.service_order_id);
        const patient = getPatientInfo(serviceOrder?.medicineRecord_id);
        const patientKey = patient ? `${patient.id}_${patient.full_name}` : 'unknown';
        
        if (!groups[patientKey]) {
            groups[patientKey] = {
                patient,
                serviceOrder,
                services: []
            };
        }
        
        groups[patientKey].services.push(service);
        return groups;
    }, {});

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
                                    <i className="fas fa-tasks me-2 text-primary"></i>
                                    Dịch Vụ Được Phân Công
                            </h2>
                            <p className="text-muted mb-0">Danh sách dịch vụ được giao cho bác sĩ</p>
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
                                <i className="fas fa-clipboard-list"></i>
                            </div>
                            <h3 className="fw-bold text-primary">{assignedServices.length}</h3>
                            <p className="text-muted mb-0">Tổng dịch vụ</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center">
                            <div className="text-success fs-1 mb-2">
                                <i className="fas fa-users"></i>
                            </div>
                            <h3 className="fw-bold text-success">{Object.keys(groupedServices).length}</h3>
                            <p className="text-muted mb-0">Bệnh nhân</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center">
                            <div className="text-warning fs-1 mb-2">
                                <i className="fas fa-clock"></i>
                            </div>
                            <h3 className="fw-bold text-warning">
                                {serviceOrders.filter(order => order.doctor_id === currentDoctorId).length}
                            </h3>
                            <p className="text-muted mb-0">Đơn chỉ định</p>
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

            {/* Assigned Services by Patient */}
            {Object.keys(groupedServices).length === 0 ? (
                <div className="row">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center py-5">
                                <i className="fas fa-clipboard fa-3x text-muted mb-3"></i>
                                <h5 className="text-muted">Chưa có dịch vụ nào được phân công</h5>
                                <p className="text-muted">Các dịch vụ được phân công sẽ xuất hiện ở đây</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                Object.entries(groupedServices).map(([patientKey, group]) => (
                    <div key={patientKey} className="row mb-4">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-primary text-white">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5 className="mb-1">
                                                <i className="fas fa-user me-2"></i>
                                                {group.patient?.full_name || 'Bệnh nhân không xác định'}
                                            </h5>
                                            <small>
                                                Ngày chỉ định: {formatDate(group.serviceOrder?.order_date)}
                                                {group.patient && (
                                                    <span className="ms-3">
                                                        <i className="fas fa-phone me-1"></i>
                                                        {group.patient.phone}
                                                    </span>
                                                )}
                                            </small>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <span className="badge bg-light text-dark me-3">
                                                {group.services.length} dịch vụ
                                            </span>
                                            <SimplePDFExport
                                                patient={group.patient}
                                                serviceOrder={group.serviceOrder}
                                                serviceResults={group.services.map(serviceItem => {
                                                    const result = serviceResults.find(r => r.service_order_item_id === serviceItem.id);
                                                    return {
                                                        ...result,
                                                        service_id: serviceItem.service_id
                                                    };
                                                }).filter(result => result.id)}
                                                medicalServices={medicalServices}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Dịch Vụ</th>
                                                    <th>Mô Tả</th>
                                                    <th>Giá</th>
                                                    <th>Trạng Thái</th>
                                                    <th>Thao Tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {group.services.map((serviceItem) => {
                                                    const service = getServiceInfo(serviceItem.service_id);
                                                    return (
                                                        <tr key={serviceItem.id}>
                                                            <td>
                                                                <strong>{service?.name || 'Dịch vụ không xác định'}</strong>
                                                            </td>
                                                            <td>
                                                                <span className="text-muted">
                                                                    {service?.description || 'Không có mô tả'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className="badge bg-info">
                                                                    {service ? getServicePrice(service) : 'N/A'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                {hasServiceResult(serviceItem.id) ? (
                                                                    <span className="badge bg-success">
                                                                        Đã hoàn thành
                                                                    </span>
                                                                ) : (
                                                                    <span className="badge bg-warning">
                                                                        Chờ thực hiện
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                {hasServiceResult(serviceItem.id) ? (
                                                                    <button
                                                                        className="btn btn-outline-success btn-sm me-2"
                                                                        title="Xem kết quả"
                                                                        onClick={() => {
                                                                            const result = getServiceResult(serviceItem.id);
                                                                            alert(`Kết quả: ${result?.result_description}`);
                                                                        }}
                                                                    >
                                                                        <i className="fas fa-check-circle me-1"></i>
                                                                        Xem kết quả
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        className="btn btn-primary btn-sm me-2"
                                                                        title="Bắt đầu thực hiện"
                                                                        onClick={() => handleStartService(serviceItem)}
                                                                    >
                                                                        <i className="fas fa-play me-1"></i>
                                                                        Thực hiện
                                                                    </button>
                                                                )}
                                                                <button
                                                                    className="btn btn-outline-secondary btn-sm"
                                                                    title="Xem chi tiết"
                                                                >
                                                                    <i className="fas fa-eye"></i>
                                                                </button>
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
                                 ))
             )}

             {/* Result Modal */}
             {showResultModal && (
                 <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                     <div className="modal-dialog modal-lg">
                         <div className="modal-content">
                             <div className="modal-header bg-primary text-white">
                                 <h5 className="modal-title">
                                     <i className="fas fa-clipboard-check me-2"></i>
                                     Nhập Kết Quả Dịch Vụ
                                 </h5>
                                 <button 
                                     type="button" 
                                     className="btn-close btn-close-white" 
                                     onClick={() => setShowResultModal(false)}
                                     disabled={submitting}
                                 ></button>
                             </div>
                             <div className="modal-body">
                                 {/* Service Info */}
                                 <div className="alert alert-info">
                                     <h6 className="mb-2">
                                         <i className="fas fa-info-circle me-2"></i>
                                         Thông tin dịch vụ
                                     </h6>
                                     <div className="row">
                                         <div className="col-md-6">
                                             <strong>Tên dịch vụ:</strong> {getServiceInfo(selectedServiceItem?.service_id)?.name}
                                         </div>
                                         <div className="col-md-6">
                                             <strong>Mô tả:</strong> {getServiceInfo(selectedServiceItem?.service_id)?.description}
                                         </div>
                                     </div>
                                 </div>

                                 {/* Result Form */}
                                 <form onSubmit={handleResultSubmit}>
                                     <div className="mb-3">
                                         <label htmlFor="result_description" className="form-label">
                                             <strong>Kết quả dịch vụ <span className="text-danger">*</span></strong>
                                         </label>
                                         <textarea
                                             id="result_description"
                                             className="form-control"
                                             rows="6"
                                             placeholder="Nhập kết quả chi tiết của dịch vụ..."
                                             value={resultForm.result_description}
                                             onChange={(e) => setResultForm(prev => ({...prev, result_description: e.target.value}))}
                                             required
                                             disabled={submitting}
                                         ></textarea>
                                         <div className="form-text">
                                             Ghi rõ kết quả, chỉ số đo được, nhận xét và kết luận
                                         </div>
                                     </div>
                                 </form>
                             </div>
                             <div className="modal-footer">
                                 <button 
                                     type="button" 
                                     className="btn btn-secondary"
                                     onClick={() => setShowResultModal(false)}
                                     disabled={submitting}
                                 >
                                     <i className="fas fa-times me-2"></i>
                                     Hủy bỏ
                                 </button>
                                 <button 
                                     type="button" 
                                     className="btn btn-primary"
                                     onClick={handleResultSubmit}
                                     disabled={submitting || !resultForm.result_description.trim()}
                                 >
                                     {submitting ? (
                                         <span>
                                             <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                             Đang lưu...
                                         </span>
                                     ) : (
                                         <span>
                                             <i className="fas fa-save me-2"></i>
                                             Lưu kết quả
                                         </span>
                                     )}
                                 </button>
                             </div>
                         </div>
                     </div>
                 </div>
             )}
         </div>
         </>
     );
 };
 
 export default AssignService; 