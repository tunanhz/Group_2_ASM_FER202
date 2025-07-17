import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge, Spinner, Form, Modal } from 'react-bootstrap';
import { apiService, handleApiError, handleApiSuccess, createInvoice, createServiceInvoice } from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateInvoice = () => {
  const [waitlist, setWaitlist] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicalServices, setMedicalServices] = useState([]);
  const [serviceOrders, setServiceOrders] = useState([]);
  const [serviceOrderItems, setServiceOrderItems] = useState([]);
  const [medicineRecords, setMedicineRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescriptionInvoices, setPrescriptionInvoices] = useState([]);
  const [medicineDetails, setMedicineDetails] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ total_amount: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        waitlistRes,
        patientsRes,
        doctorsRes,
        servicesRes,
        serviceOrdersRes,
        serviceOrderItemsRes,
        medicineRecordsRes,
        prescriptionsRes,
        prescriptionInvoicesRes,
        medicineDetailsRes,
        medicinesRes,
        invoicesRes
      ] = await Promise.all([
        apiService.getWaitlist().catch(() => ({ data: [] })),
        apiService.getPatients().catch(() => ({ data: [] })),
        apiService.getDoctors().catch(() => ({ data: [] })),
        apiService.getMedicalServices().catch(() => ({ data: [] })),
        apiService.getServiceOrders().catch(() => ({ data: [] })),
        apiService.getServiceOrderItems().catch(() => ({ data: [] })),
        apiService.getMedicineRecords().catch(() => ({ data: [] })),
        apiService.getPrescriptions().catch(() => ({ data: [] })),
        apiService.getPrescriptionInvoices().catch(() => ({ data: [] })),
        apiService.getMedicineDetails().catch(() => ({ data: [] })),
        apiService.getMedicines().catch(() => ({ data: [] })),
        apiService.getInvoices().catch(() => ({ data: [] })),
      ]);

      setWaitlist(waitlistRes.data || []);
      setPatients(patientsRes.data || []);
      setDoctors(doctorsRes.data || []);
      setMedicalServices(servicesRes.data || []);
      setServiceOrders(serviceOrdersRes.data || []);
      setServiceOrderItems(serviceOrderItemsRes.data || []);
      setMedicineRecords(medicineRecordsRes.data || []);
      setPrescriptions(prescriptionsRes.data || []);
      setPrescriptionInvoices(prescriptionInvoicesRes.data || []);
      setMedicineDetails(medicineDetailsRes.data || []);
      setMedicines(medicinesRes.data || []);
      setInvoices(invoicesRes.data || []);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra trạng thái thanh toán của bệnh nhân
  const getPatientPaymentStatus = (patientId) => {
    const patientInvoices = invoices.filter(invoice => invoice.patient_id === patientId);
    
    if (patientInvoices.length ===0) {
      return { status: 'no_invoice', text: 'Chưa có hóa đơn', badge: 'warning' };
    }
    
    const hasPaidInvoice = patientInvoices.some(invoice => invoice.status === 'Paid');
    const hasPendingInvoice = patientInvoices.some(invoice => invoice.status === 'Pending');
    
    if (hasPaidInvoice) {
      return { status: 'paid', text: 'Đã thanh toán', badge: 'success' };
    } else if (hasPendingInvoice) {
      return { status: 'pending', text: 'Chờ thanh toán', badge: 'info' };    } else {
      return { status: 'cancelled', text: 'Đã hủy', badge: 'danger' };
    }
  };

  // Lọc bệnh nhân đã hoàn thành khám (status = Complete, visittype = Result) nhưng chưa thanh toán
  const getCompletedPatients = () => {
    // Lấy tất cả bệnh nhân đã hoàn thành khám
    const completedWaitlist = waitlist.filter(item => item.status === 'Complete' && item.visittype === 'Result');
    
    // Lọc ra những bệnh nhân chưa có invoice hoặc chưa thanh toán
    const patientsWithoutPayment = completedWaitlist.filter(waitlistItem => {
      const paymentStatus = getPatientPaymentStatus(waitlistItem.patient_id);
      // Chỉ hiển thị những bệnh nhân chưa có hóa đơn hoặc chưa thanh toán
      return paymentStatus.status === 'no_invoice' || paymentStatus.status === 'pending';
    });
    
    return patientsWithoutPayment;
  };

  const getPatientInfo = (patientId) => patients.find(p => p.id === patientId) || {};
  const getDoctorInfo = (doctorId) => doctors.find(d => d.id === doctorId) || {};
  const getServiceInfo = (serviceId) => medicalServices.find(s => s.id === serviceId) || {};
  const getMedicineInfo = (medicineId) => medicines.find(m => m.id === medicineId) || {};

  // Tìm medicine record của bệnh nhân
  const getPatientMedicineRecords = (patientId) => {
    return medicineRecords.filter(record => record.patient_id === patientId);
  };

  // Tính tổng tiền dịch vụ cho bệnh nhân
  const calculateServiceTotal = (patientId) => {
    let total = 0;

    // Lấy tất cả medicine records của bệnh nhân
    const patientMedicineRecords = getPatientMedicineRecords(patientId);

    // Tính tiền dịch vụ khám (từ ServiceOrder)
    patientMedicineRecords.forEach(medicineRecord => {
      // Tìm service order cho medicine record này
      const serviceOrder = serviceOrders.find(order => order.medicineRecord_id === medicineRecord.id);
      if (serviceOrder) {
        // Tìm các service order items
        const orderItems = serviceOrderItems.filter(item => item.service_order_id === serviceOrder.id);
        orderItems.forEach(item => {
          const service = getServiceInfo(item.service_id);
          if (service.price && !isNaN(service.price)) {
            total += parseFloat(service.price);
          }
        });
      }
    });

    // Tính tiền thuốc (từ Prescription và MedicineDetails)
    patientMedicineRecords.forEach(medicineRecord => {
      // Tìm prescription cho medicine record này
      const prescription = prescriptions.find(p => p.medicineRecord_id === medicineRecord.id);
      if (prescription) {
        // Tìm prescription invoice
        const prescriptionInvoice = prescriptionInvoices.find(pi => pi.prescription_id === prescription.id);
        if (prescriptionInvoice) {
          // Tìm medicine details
          const details = medicineDetails.filter(md => md.prescription_invoice_id === prescriptionInvoice.id);
          details.forEach(detail => {
            const medicine = getMedicineInfo(detail.medicine_id);
            if (medicine.price && !isNaN(medicine.price) && detail.quantity) {
              total += parseFloat(medicine.price) * parseInt(detail.quantity);
            }
          });
        }
      }
    });

    return total;
  };

  // Xử lý tạo invoice
  const handleCreateInvoice = (waitlistItem) => {
    setSelectedPatient(waitlistItem);
    const serviceTotal = calculateServiceTotal(waitlistItem.patient_id);
    setInvoiceForm({ total_amount: serviceTotal.toString(), notes: '' });
    setShowInvoiceModal(true);
  };

  // Xử lý submit invoice
  const handleSubmitInvoice = async () => {
    if (!selectedPatient) return;
    if (!invoiceForm.total_amount || parseFloat(invoiceForm.total_amount) <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ!');
      return;
    }
    setSubmitting(true);
    try {
      // Lấy medicine record đầu tiên của bệnh nhân để tạo invoice
      const patientMedicineRecords = getPatientMedicineRecords(selectedPatient.patient_id);
      if (patientMedicineRecords.length === 0) {
        throw new Error('Không tìm thấy hồ sơ bệnh án của bệnh nhân');
      }

      const medicineRecordId = patientMedicineRecords[0].id;

      // Tạo invoice chính
      const invoiceData = {
        patient_id: selectedPatient.patient_id,
        medicineRecord_id: medicineRecordId,
        issue_date: new Date().toISOString().split('T')[0],
        total_amount: invoiceForm.total_amount,
        status: 'Pending',
        notes: invoiceForm.notes || ''
      };

      const invoiceRes = await createInvoice(invoiceData);
      if (!invoiceRes.success) throw new Error('Không thể tạo hóa đơn chính');

      // Tạo service invoices cho từng dịch vụ
      patientMedicineRecords.forEach(medicineRecord => {
        const serviceOrder = serviceOrders.find(order => order.medicineRecord_id === medicineRecord.id);
        if (serviceOrder) {
          const orderItems = serviceOrderItems.filter(item => item.service_order_id === serviceOrder.id);
          orderItems.forEach(async (item) => {
            const service = getServiceInfo(item.service_id);
            const serviceInvoiceData = {
              invoice_id: invoiceRes.data.id,
              service_order_item_id: item.id,
              service_name: service.service_name || 'Dịch vụ khám',
              service_price: service.price || 0,
              quantity: 1,
              total_price: service.price || 0
            };
            await createServiceInvoice(serviceInvoiceData);
          });
        }
      });

      toast.success('Tạo hóa đơn thành công!');
      setShowInvoiceModal(false);
      setSelectedPatient(null);
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi tạo hóa đơn: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  const formatTime = (timeString) => new Date(timeString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');

  if (loading) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Đang tải dữ liệu...</p>
        </div>
      </Container>
    );
  }

  const completedPatients = getCompletedPatients();

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  <i className="fas fa-file-invoice me-2"></i>
                  Tạo Hóa Đơn Cho Bệnh Nhân Chưa Thanh Toán
                </h4>
                <Badge bg="light" text="dark">
                  {completedPatients.length} bệnh nhân cần tạo hóa đơn
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                <h6>
                  <i className="fas fa-info-circle me-2"></i>
                  Hướng dẫn sử dụng
                </h6>
                <p className="mb-0">
                  Danh sách này hiển thị các bệnh nhân đã hoàn thành quy trình khám và điều trị với bác sĩ nhưng chưa thanh toán. 
                  Receptionist có thể tạo hóa đơn thanh toán cho các dịch vụ đã sử dụng bao gồm cả dịch vụ khám và thuốc.
                </p>
              </Alert>
              {completedPatients.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">Không có bệnh nhân nào cần tạo hóa đơn</h5>
                  <p className="text-muted">Tất cả bệnh nhân đã hoàn thành khám đều đã có hóa đơn hoặc đã thanh toán.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>STT</th>
                        <th>Thông tin bệnh nhân</th>
                        <th>Bác sĩ khám</th>
                        <th>Thời gian hoàn thành</th>
                        <th>Tổng tiền dịch vụ</th>
                        <th>Trạng thái thanh toán</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedPatients.map((item, index) => {
                        const patient = getPatientInfo(item.patient_id);
                        const doctor = getDoctorInfo(item.doctor_id);
                        const serviceTotal = calculateServiceTotal(item.patient_id);
                        const paymentStatus = getPatientPaymentStatus(item.patient_id);
                        return (
                          <tr key={item.id}>
                            <td className="fw-bold text-primary">{index + 1}</td>
                            <td>
                              <div>
                                <div className="fw-semibold">{patient.full_name || 'Không rõ'}</div>
                                <small className="text-muted">{patient.phone || 'N/A'} | {patient.gender || 'N/A'}</small>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="fw-semibold">{doctor.full_name || 'Không rõ'}</div>
                                <small className="text-muted">{doctor.department || 'N/A'}</small>
                              </div>
                            </td>
                            <td>
                              <div>{formatDate(item.estimated_time)}</div>
                              <small className="text-muted">{formatTime(item.estimated_time)}</small>
                            </td>
                            <td>
                              <span className="fw-bold text-success">{formatCurrency(serviceTotal)}</span>
                            </td>
                            <td>
                              <Badge bg={paymentStatus.badge}>
                                <i className="fas fa-info-circle me-1"></i>
                                {paymentStatus.text}
                              </Badge>
                            </td>
                            <td>
                              <Button variant="outline-primary" size="sm" onClick={() => handleCreateInvoice(item)} disabled={serviceTotal <= 0}>
                                <i className="fas fa-file-invoice me-1"></i>
                                Tạo hóa đơn
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Modal tạo hóa đơn */}
      <Modal show={showInvoiceModal} onHide={() => setShowInvoiceModal(false)} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-file-invoice me-2"></i>
            Tạo Hóa Đơn Thanh Toán
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPatient && (
            <div>
              <Alert variant="info">
                <h6>Thông tin bệnh nhân:</h6>
                <p className="mb-1"><strong>Tên:</strong> {getPatientInfo(selectedPatient.patient_id).full_name}</p>
                <p className="mb-1"><strong>Số điện thoại:</strong> {getPatientInfo(selectedPatient.patient_id).phone}</p>
                <p className="mb-0"><strong>Bác sĩ khám:</strong> {getDoctorInfo(selectedPatient.doctor_id).full_name}</p>
              </Alert>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label><strong>Tổng tiền dịch vụ (VNĐ)</strong></Form.Label>
                  <Form.Control
                    type="number"
                    value={invoiceForm.total_amount}
                    onChange={e => setInvoiceForm({ ...invoiceForm, total_amount: e.target.value })}
                    placeholder="Nhập tổng tiền"
                    min="0"
                  />
                  <Form.Text className="text-muted">
                    Tổng tiền các dịch vụ đã sử dụng (bao gồm dịch vụ khám và thuốc): {formatCurrency(calculateServiceTotal(selectedPatient.patient_id))}
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label><strong>Ghi chú (tùy chọn)</strong></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows="3"
                    value={invoiceForm.notes}
                    onChange={e => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                    placeholder="Nhập ghi chú cho hóa đơn..."
                  />
                </Form.Group>
              </Form>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInvoiceModal(false)}>
            <i className="fas fa-times me-1"></i> Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmitInvoice} disabled={submitting}>
            {submitting ? (<><Spinner animation="border" size="sm" className="me-2" />Đang tạo...</>) : (<><i className="fas fa-save me-1"></i> Tạo hóa đơn</>)}
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer position="top-right" autoClose={3000} />
    </Container>
  );
};

export default CreateInvoice; 