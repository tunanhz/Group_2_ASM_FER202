import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Alert, Badge, Spinner } from "react-bootstrap";
import { apiService, dataHelpers, getSystemLogs } from "../services/api";



const Dashboard = () => {
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalPatients: 0,
    totalNurses: 0,
    totalReceptionists: 0,
    totalPharmacists: 0,
    totalAdminSys: 0,
    activeUsers: 0,
    disabledUsers: 0
  });
  const [systemLogs, setSystemLogs] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    version: "v1.0.0",
    status: "Hoạt động bình thường",
    uptime: "15 ngày 8 giờ",
    memoryUsage: "65%",
    cpuUsage: "23%",
    lastBackup: "2024-01-15 02:00:00",
    nextBackup: "2024-01-16 02:00:00"
  });

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const userInfo = localStorage.getItem("user");
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
    
    // Load dữ liệu thực từ database
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setDataLoading(true);
      
      // Load tất cả dữ liệu cần thiết
      const [
        patientsResponse,
        doctorsResponse,
        accountStaffResponse,
        systemLogsResponse
      ] = await Promise.all([
        apiService.getPatients(),
        apiService.getDoctors(),
        apiService.getAccountStaff(),
        getSystemLogs()
      ]);

      // Xử lý dữ liệu
      const patients = patientsResponse.data || [];
      const doctors = doctorsResponse.data || [];
      const accountStaff = accountStaffResponse.data || [];
      const logs = systemLogsResponse.data || [];

      // Lọc các loại nhân viên từ AccountStaff
      const nurses = accountStaff.filter(staff => staff.role === "Nurse");
      const receptionists = accountStaff.filter(staff => staff.role === "Receptionist");
      const pharmacists = accountStaff.filter(staff => staff.role === "Pharmacist");
      const adminSys = accountStaff.filter(staff => staff.role === "AdminSys");
      
      // Tính toán trạng thái tài khoản
      const activeUsers = accountStaff.filter(staff => staff.status === "Enable").length;
      const disabledUsers = accountStaff.filter(staff => staff.status === "Disable").length;

      setStats({
        totalUsers: patients.length + accountStaff.length,
        totalDoctors: doctors.length,
        totalPatients: patients.length,
        totalNurses: nurses.length,
        totalReceptionists: receptionists.length,
        totalPharmacists: pharmacists.length,
        totalAdminSys: adminSys.length,
        activeUsers: activeUsers,
        disabledUsers: disabledUsers
      });

      // Lấy 10 log gần nhất
      //const recentLogs = logs.slice(0, 10);
      setSystemLogs(logs);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const getLogLevelColor = (level) => {
    switch(level) {
      case "ERROR": return "danger";
      case "WARNING": return "warning";
      case "INFO": return "info";
      case "SUCCESS": return "success";
      default: return "secondary";
    }
  };

  const getLogLevelIcon = (level) => {
    switch(level) {
      case "ERROR": return "fas fa-exclamation-triangle";
      case "WARNING": return "fas fa-exclamation-circle";
      case "INFO": return "fas fa-info-circle";
      case "SUCCESS": return "fas fa-check-circle";
      default: return "fas fa-circle";
    }
  };

  const getUserTypeBadge = (userType) => {
    switch(userType) {
      case "Staff": return <Badge bg="primary" className="ms-1">Staff</Badge>;
      case "Patient": return <Badge bg="success" className="ms-1">Patient</Badge>;
      case "Pharmacist": return <Badge bg="warning" className="ms-1">Pharmacist</Badge>;
      default: return <Badge bg="secondary" className="ms-1">{userType}</Badge>;
    }
  };

  if (loading) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          <Alert.Heading>Không có quyền truy cập!</Alert.Heading>
          <p>Vui lòng đăng nhập để tiếp tục.</p>
          <Button variant="primary" onClick={() => window.location.href = "/"}>
            Đăng nhập
          </Button>
        </Alert>
      </Container>
    );
  }

  // Kiểm tra quyền AdminSys
  if (user.role !== "AdminSys") {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Không có quyền truy cập!</Alert.Heading>
          <p>Chỉ Admin Hệ thống mới có quyền truy cập vào trang này.</p>
          <Button variant="primary" onClick={() => window.location.href = "/"}>
            Về trang chủ
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-danger text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  <i className="fas fa-shield-alt me-2"></i>
                  Admin Hệ thống Dashboard
                </h4>
                <div className="d-flex align-items-center">
                  <Badge bg="success" className="me-3">
                    <i className="fas fa-circle me-1"></i>
                    Online
                  </Badge>
                  <Button variant="outline-light" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-1"></i>
                    Đăng xuất
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <Alert variant="danger">
                <h5>
                  <i className="fas fa-user-shield me-2"></i>
                  Chào mừng Admin Hệ thống {user.username}!
                </h5>
                <p className="mb-0">
                  <strong>Email:</strong> {user.email} | 
                  <strong> Vai trò:</strong> 
                  <Badge bg="danger" className="ms-2">
                    Admin Hệ thống
                  </Badge> | 
                  <strong> Đăng nhập lúc:</strong> {new Date(user.loginTime || Date.now()).toLocaleString('vi-VN')}
                </p>
              </Alert>

              {dataLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <p className="mt-2">Đang tải dữ liệu hệ thống...</p>
                </div>
              ) : (
                <>
                  {/* Thống kê tài khoản */}
                  <Row className="mt-4">
                    <Col md={3} className="mb-3">
                      <Card className="text-center border-primary">
                        <Card.Body>
                          <i className="fas fa-users fa-2x text-primary mb-2"></i>
                          <h4 className="text-primary">{stats.totalUsers}</h4>
                          <p className="text-muted mb-0">Tổng tài khoản</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Card className="text-center border-success">
                        <Card.Body>
                          <i className="fas fa-user-check fa-2x text-success mb-2"></i>
                          <h4 className="text-success">{stats.activeUsers}</h4>
                          <p className="text-muted mb-0">Tài khoản hoạt động</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Card className="text-center border-danger">
                        <Card.Body>
                          <i className="fas fa-user-times fa-2x text-danger mb-2"></i>
                          <h4 className="text-danger">{stats.disabledUsers}</h4>
                          <p className="text-muted mb-0">Tài khoản bị khóa</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Card className="text-center border-info">
                        <Card.Body>
                          <i className="fas fa-user-shield fa-2x text-info mb-2"></i>
                          <h4 className="text-info">{stats.totalAdminSys}</h4>
                          <p className="text-muted mb-0">Admin Hệ thống</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {/* Thống kê chi tiết theo vai trò */}
                  <Row className="mt-3">
                    <Col md={2} className="mb-3">
                      <Card className="text-center border-success">
                        <Card.Body>
                          <i className="fas fa-user-md fa-2x text-success mb-2"></i>
                          <h5 className="text-success">{stats.totalDoctors}</h5>
                          <p className="text-muted mb-0">Bác sĩ</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={2} className="mb-3">
                      <Card className="text-center border-info">
                        <Card.Body>
                          <i className="fas fa-user-nurse fa-2x text-info mb-2"></i>
                          <h5 className="text-info">{stats.totalNurses}</h5>
                          <p className="text-muted mb-0">Y tá</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={2} className="mb-3">
                      <Card className="text-center border-warning">
                        <Card.Body>
                          <i className="fas fa-user-tie fa-2x text-warning mb-2"></i>
                          <h5 className="text-warning">{stats.totalReceptionists}</h5>
                          <p className="text-muted mb-0">Lễ tân</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={2} className="mb-3">
                      <Card className="text-center border-primary">
                        <Card.Body>
                          <i className="fas fa-pills fa-2x text-primary mb-2"></i>
                          <h5 className="text-primary">{stats.totalPharmacists}</h5>
                          <p className="text-muted mb-0">Dược sĩ</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={2} className="mb-3">
                      <Card className="text-center border-secondary">
                        <Card.Body>
                          <i className="fas fa-user-injured fa-2x text-secondary mb-2"></i>
                          <h5 className="text-secondary">{stats.totalPatients}</h5>
                          <p className="text-muted mb-0">Bệnh nhân</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={2} className="mb-3">
                      <Card className="text-center border-dark">
                        <Card.Body>
                          <i className="fas fa-percentage fa-2x text-dark mb-2"></i>
                          <h5 className="text-dark">
                            {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                          </h5>
                          <p className="text-muted mb-0">Tỷ lệ hoạt động</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {/* Chức năng chính */}
                  <Row className="mt-4">
                    <Col md={6} className="mb-3">
                      <Card className="text-center h-100 border-primary">
                        <Card.Body>
                          <i className="fas fa-users-cog fa-4x text-primary mb-3"></i>
                          <h4>Quản lý tài khoản</h4>
                          <p className="text-muted">Thêm, sửa, xóa và quản lý tất cả tài khoản trong hệ thống</p>
                          <Button 
                            variant="outline-primary" 
                            size="lg"
                            onClick={() => window.location.href = "/accounts"}
                          >
                            <i className="fas fa-cog me-2"></i>
                            Quản lý tài khoản
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Card className="text-center h-100 border-info">
                        <Card.Body>
                          <i className="fas fa-history fa-4x text-info mb-3"></i>
                          <h4>Lịch sử hệ thống</h4>
                          <p className="text-muted">Xem và theo dõi tất cả hoạt động trong hệ thống</p>
                          <Button 
                            variant="outline-info" 
                            size="lg"
                            onClick={() => window.location.href = "/system-logs"}
                          >
                            <i className="fas fa-history me-2"></i>
                            Xem lịch sử
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {/* Lịch sử hệ thống gần đây */}
                  <Row className="mt-4">
                    <Col md={8}>
                      <Card>
                        <Card.Header className="bg-light">
                          <h6 className="mb-0">
                            <i className="fas fa-history me-2"></i>
                            Lịch sử hệ thống gần đây (Từ Database)
                          </h6>
                        </Card.Header>
                        <Card.Body style={{maxHeight: '400px', overflowY: 'auto'}}>
                          {systemLogs.length > 0 ? (
                            <div>
                              {(showAllLogs ? systemLogs : systemLogs.slice(0, 10)).map((log) => (
                                <div key={log.id} className="d-flex align-items-start mb-3 p-2 border-bottom">
                                  <div className="me-3">
                                    <i className={`${getLogLevelIcon(log.level)} text-${getLogLevelColor(log.level)}`}></i>
                                  </div>
                                  <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-start">
                                      <div>
                                        <strong>{log.message}</strong>
                                        <br />
                                        <small className="text-muted">
                                          <i className={`${dataHelpers.getActionIcon(log.action)} me-1`}></i>
                                          {log.action} | User: {log.user}
                                          {getUserTypeBadge(log.userType)}
                                        </small>
                                      </div>
                                      <Badge bg={getLogLevelColor(log.level)} className="ms-2">
                                        {log.level}
                                      </Badge>
                                    </div>
                                    <small className="text-muted">
                                      {new Date(log.timestamp).toLocaleString('vi-VN')}
                                    </small>
                                  </div>
                                </div>
                              ))}

                              {/* Nút Xem thêm/Thu gọn */}
                              {systemLogs.length > 10 && (
                                <div className="text-center mt-3">
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => setShowAllLogs(!showAllLogs)}
                                  >
                                    {showAllLogs ? "Thu gọn" : "Xem thêm"}
                                  </Button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-muted">Không có lịch sử nào</p>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={4}>
                      <Card>
                        <Card.Header className="bg-light">
                          <h6 className="mb-0">
                            <i className="fas fa-info-circle me-2"></i>
                            Thông tin tài khoản Admin
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          <p><strong>ID:</strong> {user.id}</p>
                          <p><strong>Username:</strong> {user.username}</p>
                          <p><strong>Email:</strong> {user.email}</p>
                          <p><strong>Vai trò:</strong> 
                            <Badge bg="danger" className="ms-2">
                              Admin Hệ thống
                            </Badge>
                          </p>
                          <p><strong>Trạng thái:</strong> 
                            <Badge bg={user.status === "Enable" ? "success" : "danger"} className="ms-2">
                              {user.status === "Enable" ? "Hoạt động" : "Vô hiệu"}
                            </Badge>
                          </p>
                        </Card.Body>
                      </Card>

                      <Card className="mt-3">
                        <Card.Header className="bg-light">
                          <h6 className="mb-0">
                            <i className="fas fa-server me-2"></i>
                            Trạng thái hệ thống
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          <p><strong>Phiên bản:</strong> {systemStatus.version}</p>
                          <p><strong>Trạng thái:</strong> 
                            <Badge bg="success" className="ms-2">{systemStatus.status}</Badge>
                          </p>
                          <p><strong>Thời gian hoạt động:</strong> {systemStatus.uptime}</p>
                          <p><strong>Bộ nhớ sử dụng:</strong> {systemStatus.memoryUsage}</p>
                          <p><strong>CPU:</strong> {systemStatus.cpuUsage}</p>
                          <hr />
                          <p><strong>Sao lưu cuối:</strong> {systemStatus.lastBackup}</p>
                          <p><strong>Sao lưu tiếp theo:</strong> {systemStatus.nextBackup}</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard; 