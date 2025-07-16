import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Modal } from "react-bootstrap";
import EditPatient from "./editInforPatient";
import EditDoctor from "./editInforDoctor";
import EditNurse from "./editInforNurse";
import EditReceptionist from "./editInforReceptionist";
import { useLocation } from 'react-router-dom';
import { getAccountPatients, getAccountStaff, addAccountStaff, updateAccountStaff, deleteAccountStaff } from '../services/api';

const AccountList = () => {
  const [accounts, setAccounts] = useState({ patients: [], staff: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterType, setFilterType] = useState("all"); // "all", "patient", "staff"
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "view" | "edit" | "add"
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [addForm, setAddForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Doctor',
  });
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState(null);

  useEffect(() => {
    fetchAccounts();
    const header = document.querySelector('.header-class');
    const footer = document.querySelector('.footer-class');
    if (header) header.style.display = 'none';
    if (footer) footer.style.display = 'none';
    return () => {
      if (header) header.style.display = '';
      if (footer) footer.style.display = '';
    };
  }, []);

  const fetchAccounts = async () => {
    try {
      const [patients, staff] = await Promise.all([
        getAccountPatients(),
        getAccountStaff()
      ]);
      setAccounts({ patients, staff });
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAccounts = () => {
    let filteredPatients = accounts.patients;
    let filteredStaff = accounts.staff;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredPatients = filteredPatients.filter(account =>
        (account.email && account.email.toLowerCase().includes(term)) ||
        (account.username && account.username.toLowerCase().includes(term))
      );
      filteredStaff = filteredStaff.filter(account =>
        (account.email && account.email.toLowerCase().includes(term)) ||
        (account.username && account.username.toLowerCase().includes(term)) ||
        (account.role && account.role.toLowerCase().includes(term))
      );
    }

    // Filter by type
    if (filterType === "patient") {
      return { patients: filteredPatients, staff: [] };
    } else if (filterType === "staff") {
      return { patients: [], staff: filteredStaff };
    }

    return { patients: filteredPatients, staff: filteredStaff };
  };

  const getStatusBadge = (status) => {
    return (
      <Badge bg={status === "Enable" ? "success" : "danger"}>
        {status === "Enable" ? "Hoạt động" : "Vô hiệu"}
      </Badge>
    );
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      "Doctor": "primary",
      "Nurse": "info",
      "Receptionist": "warning",
      "AdminSys": "danger",
      "AdminBusiness": "secondary"
    };
    return (
      <Badge bg={roleColors[role] || "secondary"}>
        {role}
      </Badge>
    );
  };

  const handleView = (account, role) => {
    setSelectedAccount(account);
    setSelectedRole(role);
    setModalType("view");
    setShowModal(true);
  };

  const handleEdit = (account, role) => {
    setSelectedAccount(account);
    setSelectedRole(role);
    setModalType("edit");
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedAccount(null);
    setSelectedRole("");
    setModalType("add");
    setShowModal(true);
  };

  const handleDelete = (account, role) => {
    setDeleteTarget({ account, role });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAccountStaff(deleteTarget.account.id);
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchAccounts();
    }
  };

  const handleToggleStatus = async (account, role) => {
    setStatusLoadingId(account.id);
    try {
      await updateAccountStaff(account.id, { status: account.status === "Enable" ? "Disable" : "Enable" });
      fetchAccounts();
    } catch (error) {
      console.error("Error toggling status:", error);
    } finally {
      setStatusLoadingId(null);
    }
  };

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);
    try {
      // Validate
      if (!addForm.username || !addForm.email || !addForm.password) {
        setAddError('Vui lòng nhập đầy đủ thông tin.');
        setAddLoading(false);
        return;
      }
      await addAccountStaff(addForm);
      setShowModal(false);
      setAddForm({ username: '', email: '', password: '', role: 'Doctor' });
      fetchAccounts();
    } catch (err) {
      setAddError('Lỗi: ' + err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAccount(null);
    setSelectedRole("");
    setModalType("");
  };

  const filteredAccounts = getFilteredAccounts();

  // Pagination logic
  const getPaginatedData = (data) => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return data.slice(startIdx, startIdx + rowsPerPage);
  };
  const totalPatients = filteredAccounts.patients.length;
  const totalStaff = filteredAccounts.staff.length;
  const totalRows = totalPatients + totalStaff;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-info text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                <i className="fas fa-users me-2"></i>
                Danh sách Tài khoản Hệ thống
              </h4>
              <div>
                <Button variant="outline-light" className="me-2" onClick={() => window.location.href = "/dashboard"}>
                  <i className="fas fa-arrow-left me-2"></i>Quay về Dashboard
                </Button>
                <Button variant="primary" onClick={handleAdd}>
                  <i className="fas fa-user-plus me-2"></i>Thêm tài khoản mới
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {/* Filters */}
              <Row className="mb-4">
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="fas fa-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Tìm kiếm theo email, username hoặc role..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') setSearchTerm(searchInput); }}
                    />
                  </InputGroup>
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">Tất cả tài khoản</option>
                    <option value="patient">Chỉ bệnh nhân</option>
                    <option value="staff">Chỉ nhân viên</option>
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => {
                      setSearchInput("");
                      setSearchTerm("");
                      setFilterType("all");
                    }}
                  >
                    <i className="fas fa-refresh me-1"></i>
                    Làm mới
                  </Button>
                </Col>
              </Row>

              {/* Patient Accounts */}
              {getPaginatedData(filteredAccounts.patients).length > 0 && (
                <div className="mb-4">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-user me-2"></i>
                    Tài khoản Bệnh nhân ({totalPatients})
                  </h5>
                  <Table striped bordered hover responsive>
                    <thead className="table-dark">
                      <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedData(filteredAccounts.patients).map((patient) => (
                        <tr key={patient.id}>
                          <td>{patient.id}</td>
                          <td>{patient.username}</td>
                          <td>{patient.email}</td>
                          <td>{getStatusBadge(patient.status)}</td>
                          <td>
                            <Button size="sm" variant="outline-primary" className="me-1" onClick={() => handleView(patient, "patient")}> <i className="fas fa-eye"></i> </Button>
                            <Button size="sm" variant="outline-warning" className="me-1" onClick={() => handleEdit(patient, "patient")}> <i className="fas fa-edit"></i> </Button>
                            <Button size="sm" variant="outline-danger" className="me-1" onClick={() => handleDelete(patient, "patient")}> <i className="fas fa-trash"></i> </Button>
                            <Button size="sm" variant={patient.status === "Enable" ? "outline-secondary" : "outline-success"} disabled={statusLoadingId === patient.id} onClick={() => handleToggleStatus(patient, "patient")}> 
                              {statusLoadingId === patient.id ? (
                                <span className="spinner-border spinner-border-sm"></span>
                              ) : patient.status === "Enable" ? (
                                <><i className="fas fa-user-slash"></i> Vô hiệu hóa</>
                              ) : (
                                <><i className="fas fa-user-check"></i> Kích hoạt</>
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {/* Staff Accounts */}
              {getPaginatedData(filteredAccounts.staff).length > 0 && (
                <div className="mb-4">
                  <h5 className="text-success mb-3">
                    <i className="fas fa-user-md me-2"></i>
                    Tài khoản Nhân viên ({totalStaff})
                  </h5>
                  <Table striped bordered hover responsive>
                    <thead className="table-dark">
                      <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedData(filteredAccounts.staff).map((staff) => (
                        <tr key={staff.id}>
                          <td>{staff.id}</td>
                          <td>{staff.username}</td>
                          <td>{staff.email}</td>
                          <td>{getRoleBadge(staff.role)}</td>
                          <td>{getStatusBadge(staff.status)}</td>
                          <td>
                            <Button size="sm" variant="outline-primary" className="me-1" onClick={() => handleView(staff, staff.role)}> <i className="fas fa-eye"></i> </Button>
                            <Button size="sm" variant="outline-warning" className="me-1" onClick={() => handleEdit(staff, staff.role)}> <i className="fas fa-edit"></i> </Button>
                            <Button size="sm" variant="outline-danger" className="me-1" onClick={() => handleDelete(staff, staff.role)}> <i className="fas fa-trash"></i> </Button>
                            <Button size="sm" variant={staff.status === "Enable" ? "outline-secondary" : "outline-success"} disabled={statusLoadingId === staff.id} onClick={() => handleToggleStatus(staff, staff.role)}>
                              {statusLoadingId === staff.id ? (
                                <span className="spinner-border spinner-border-sm"></span>
                              ) : staff.status === "Enable" ? (
                                <><i className="fas fa-user-slash"></i> Vô hiệu hóa</>
                              ) : (
                                <><i className="fas fa-user-check"></i> Kích hoạt</>
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {/* Pagination controls */}
              {totalRows > 0 && (
                <div className="d-flex justify-content-between align-items-center my-3">
                  <div>
                    <Form.Select value={rowsPerPage} onChange={handleRowsPerPageChange} style={{ width: 120, display: 'inline-block' }}>
                      <option value={5}>5 dòng/trang</option>
                      <option value={10}>10 dòng/trang</option>
                      <option value={20}>20 dòng/trang</option>
                      <option value={50}>50 dòng/trang</option>
                    </Form.Select>
                  </div>
                  <div>
                    <Button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} variant="outline-primary" className="me-2">&lt;</Button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <Button key={i+1} variant={currentPage === i+1 ? "primary" : "outline-primary"} className="me-1" onClick={() => handlePageChange(i+1)}>{i+1}</Button>
                    ))}
                    <Button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} variant="outline-primary">&gt;</Button>
                  </div>
                  <div>
                    Trang {currentPage} / {totalPages} (Tổng: {totalRows} tài khoản)
                  </div>
                </div>
              )}

              {/* No results */}
              {filteredAccounts.patients.length === 0 && filteredAccounts.staff.length === 0 && (
                <div className="text-center py-5">
                  <i className="fas fa-search fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">Không tìm thấy tài khoản nào</h5>
                  <p className="text-muted">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
                </div>
              )}

              {/* Summary */}
              <div className="mt-4">
                <Row>
                  <Col md={3}>
                    <Card className="text-center bg-primary text-white">
                      <Card.Body>
                        <h4>{accounts.patients.length}</h4>
                        <p className="mb-0">Tổng bệnh nhân</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center bg-success text-white">
                      <Card.Body>
                        <h4>{accounts.staff.length}</h4>
                        <p className="mb-0">Tổng nhân viên</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center bg-info text-white">
                      <Card.Body>
                        <h4>{accounts.patients.filter(p => p.status === "Enable").length}</h4>
                        <p className="mb-0">Bệnh nhân hoạt động</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center bg-warning text-white">
                      <Card.Body>
                        <h4>{accounts.staff.filter(s => s.status === "Enable").length}</h4>
                        <p className="mb-0">Nhân viên hoạt động</p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal xem/sửa/thêm tài khoản */}
      <Modal show={showModal} onHide={closeModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "view" && "Xem chi tiết tài khoản"}
            {modalType === "edit" && "Chỉnh sửa tài khoản"}
            {modalType === "add" && "Thêm tài khoản mới"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Render form phù hợp theo loại tài khoản */}
          {modalType === "add" && (
            <Form onSubmit={handleAddSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tên Người Dùng</Form.Label>
                    <Form.Control name="username" value={addForm.username} onChange={handleAddInputChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control name="email" type="email" value={addForm.email} onChange={handleAddInputChange} required />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Mật khẩu</Form.Label>
                    <Form.Control name="password" type="password" value={addForm.password} onChange={handleAddInputChange} required />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Vai trò</Form.Label>
                    <Form.Select name="role" value={addForm.role} onChange={handleAddInputChange}>
                      <option value="Doctor">Bác sĩ</option>
                      <option value="Nurse">Y tá</option>
                      <option value="Receptionist">Lễ tân</option>
                      {/* <option value="AdminSys">AdminSys</option>
                      <option value="AdminBusiness">AdminBusiness</option> */}
                    </Form.Select>
                  </Form.Group>
                </Col>
                {/* Bỏ trường trạng thái */}
              </Row>
              {addError && <div className="alert alert-danger">{addError}</div>}
              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={closeModal} className="me-2">Hủy</Button>
                <Button variant="primary" type="submit" disabled={addLoading}>
                  {addLoading ? 'Đang thêm...' : 'Thêm tài khoản'}
                </Button>
              </div>
            </Form>
          )}
          {/* Các modal khác giữ nguyên */}
          {modalType !== "add" && selectedRole === "patient" && (
            <EditPatient patientId={selectedAccount?.id} onSave={closeModal} onCancel={closeModal} />
          )}
          {modalType !== "add" && selectedRole === "Doctor" && (
            <EditDoctor doctorId={selectedAccount?.id} onSave={closeModal} onCancel={closeModal} />
          )}
          {modalType !== "add" && selectedRole === "Nurse" && (
            <EditNurse nurseId={selectedAccount?.id} onSave={closeModal} onCancel={closeModal} />
          )}
          {modalType !== "add" && selectedRole === "Receptionist" && (
            <EditReceptionist receptionistId={selectedAccount?.id} onSave={closeModal} onCancel={closeModal} />
          )}
        </Modal.Body>
      </Modal>

      {/* Modal xác nhận xóa */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa tài khoản</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn xóa tài khoản <strong>{deleteTarget?.account?.username}</strong> không?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AccountList; 