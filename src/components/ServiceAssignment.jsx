import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DoctorHeader from './DoctorHeader';
import { getMedicalServices, getPatients, getDoctors, addMedicineRecord, addServiceOrder, addServiceOrderItem, updateWaitlist, addInvoice, addServiceInvoice } from '../services/api';

const ServiceAssignment = () => {
    const { patientId, waitlistId } = useParams();
    const navigate = useNavigate();
    
    const [patient, setPatient] = useState(null);
    const [medicalServices, setMedicalServices] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [currentDoctorId] = useState('1'); // Mock - should come from auth

    useEffect(() => {
        fetchData();
    }, [patientId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [patientsData, servicesData, doctorsData] = await Promise.all([
                getPatients(),
                getMedicalServices(),
                getDoctors()
            ]);

            if (patientsData.success) {
                const foundPatient = patientsData.data.find(p => p.id === patientId);
                setPatient(foundPatient);
            }

            if (servicesData.success) {
                setMedicalServices(servicesData.data);
            }

            if (doctorsData.success) {
                setDoctors(doctorsData.data);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            alert('❌ Có lỗi xảy ra khi tải dữ liệu: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleServiceToggle = (serviceId, doctorId = '') => {
        setSelectedServices(prev => {
            const existingIndex = prev.findIndex(item => item.serviceId === serviceId);
            
            if (existingIndex >= 0) {
                // Remove if already selected
                return prev.filter(item => item.serviceId !== serviceId);
            } else {
                // Add new service
                return [...prev, { serviceId, doctorId }];
            }
        });
    };

    const handleDoctorChange = (serviceId, doctorId) => {
        setSelectedServices(prev => 
            prev.map(item => 
                item.serviceId === serviceId 
                    ? { ...item, doctorId }
                    : item
            )
        );
    };

    const handleSubmit = async () => {
        if (selectedServices.length === 0) {
            alert('Vui lòng chọn ít nhất một dịch vụ!');
            return;
        }

        const invalidServices = selectedServices.filter(item => !item.doctorId);
        if (invalidServices.length > 0) {
            alert('Vui lòng chọn bác sĩ cho tất cả dịch vụ!');
            return;
        }

        setSubmitting(true);

        try {
            // ALWAYS create NEW medicine record for service assignment
            // Luôn tạo MedicineRecord mới cho việc chỉ định dịch vụ
            console.log('🔄 Tạo MedicineRecord mới cho chỉ định dịch vụ...');
            const newRecordRes = await addMedicineRecord({
                patient_id: patientId
            });
            
            if (!newRecordRes.success) {
                throw new Error('Không thể tạo hồ sơ bệnh án mới');
            }

            const medicineRecordId = newRecordRes.data.id;
            console.log('✅ Đã tạo MedicineRecord mới:', medicineRecordId);

            // Create service order
            const serviceOrderData = {
                doctor_id: currentDoctorId,
                order_date: new Date().toISOString().split('T')[0],
                medicineRecord_id: medicineRecordId
            };

            const serviceOrderRes = await addServiceOrder(serviceOrderData);
            if (!serviceOrderRes.success) {
                throw new Error('Không thể tạo đơn chỉ định');
            }

            const serviceOrderId = serviceOrderRes.data.id;

            // Create service order items
            for (const service of selectedServices) {
                const itemData = {
                    service_order_id: serviceOrderId,
                    service_id: service.serviceId,
                    doctor_id: service.doctorId
                };

                const itemRes = await addServiceOrderItem(itemData);
                if (!itemRes.success) {
                    console.error('Failed to create service item:', service);
                }
            }

            // After service assignment: status=Waiting, visitType=Result (waiting for service results)
            if (waitlistId) {
                await updateWaitlist(waitlistId, 'Waiting', 'Result');
            }

            alert('✅ Chỉ định dịch vụ thành công!');
            navigate('/doctor-dashboard');

        } catch (error) {
            console.error('Error creating service assignment:', error);
            alert('❌ Có lỗi xảy ra khi chỉ định dịch vụ: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const getServicePrice = (service) => {
        return service.price && !isNaN(service.price) 
            ? new Intl.NumberFormat('vi-VN').format(service.price) + ' VNĐ'
            : 'Liên hệ';
    };

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
                                <i className="fas fa-clipboard-list me-2 text-primary"></i>
                                Chỉ Định Dịch Vụ Y Tế
                            </h2>
                            <p className="text-muted mb-0">Chọn và phân công dịch vụ cho bệnh nhân</p>
                        </div>
                        <button 
                            className="btn btn-outline-secondary"
                            onClick={() => navigate('/doctor-dashboard')}
                        >
                            <i className="fas fa-arrow-left me-2"></i>
                            Quay lại
                        </button>
                    </div>
                </div>
            </div>

            {/* Patient Info */}
            {patient && (
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-info text-white">
                                <h5 className="mb-0">
                                    <i className="fas fa-user me-2"></i>
                                    Thông Tin Bệnh Nhân
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <strong>Họ tên:</strong> {patient.full_name}
                                    </div>
                                    <div className="col-md-6">
                                        <strong>Giới tính:</strong> {patient.gender}
                                    </div>
                                    <div className="col-md-6">
                                        <strong>Ngày sinh:</strong> {patient.dob}
                                    </div>
                                    <div className="col-md-6">
                                        <strong>Điện thoại:</strong> {patient.phone}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Selected Services Summary */}
            {selectedServices.length > 0 && (
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-success text-white">
                                <h5 className="mb-0">
                                    <i className="fas fa-check-circle me-2"></i>
                                    Dịch Vụ Đã Chọn ({selectedServices.length})
                                </h5>
                            </div>
                            <div className="card-body">
                                {selectedServices.map((item, index) => {
                                    const service = medicalServices.find(s => s.id === item.serviceId);
                                    const doctor = doctors.find(d => d.id === item.doctorId);
                                    return (
                                        <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                                            <div>
                                                <strong>{service?.name}</strong>
                                                <br />
                                                <small className="text-muted">
                                                    Bác sĩ: {doctor?.full_name || 'Chưa chọn'}
                                                </small>
                                            </div>
                                            <span className="badge bg-primary">
                                                {getServicePrice(service)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Medical Services List */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">
                                <i className="fas fa-stethoscope me-2"></i>
                                Danh Sách Dịch Vụ Y Tế
                            </h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th width="50">Chọn</th>
                                            <th>Tên Dịch Vụ</th>
                                            <th>Mô Tả</th>
                                            <th>Giá</th>
                                            <th>Bác Sĩ Thực Hiện</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {medicalServices.map((service) => {
                                            const isSelected = selectedServices.some(item => item.serviceId === service.id);
                                            const selectedService = selectedServices.find(item => item.serviceId === service.id);
                                            
                                            return (
                                                <tr key={service.id} className={isSelected ? 'table-primary' : ''}>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            checked={isSelected}
                                                            onChange={() => handleServiceToggle(service.id)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <strong>{service.name}</strong>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted">{service.description}</span>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-info">
                                                            {getServicePrice(service)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {isSelected ? (
                                                            <select
                                                                className="form-select form-select-sm"
                                                                value={selectedService?.doctorId || ''}
                                                                onChange={(e) => handleDoctorChange(service.id, e.target.value)}
                                                            >
                                                                <option value="">-- Chọn bác sĩ --</option>
                                                                {doctors.map(doctor => (
                                                                    <option key={doctor.id} value={doctor.id}>
                                                                        {doctor.full_name} - {doctor.specialization}
                                                                    </option>
                                                                ))}
                                                            </select>
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
                </div>
            </div>

            {/* Action Buttons */}
            <div className="row">
                <div className="col-12">
                    <div className="d-flex justify-content-end gap-3">
                        <button 
                            className="btn btn-outline-secondary"
                            onClick={() => navigate('/doctor-dashboard')}
                            disabled={submitting}
                        >
                            <i className="fas fa-times me-2"></i>
                            Hủy bỏ
                        </button>
                        <button 
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={submitting || selectedServices.length === 0}
                        >
                            {submitting ? (
                                <span>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Đang xử lý...
                                </span>
                            ) : (
                                <span>
                                    <i className="fas fa-save me-2"></i>
                                    Chỉ Định Dịch Vụ ({selectedServices.length})
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default ServiceAssignment; 