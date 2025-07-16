import React, { useState, useEffect } from 'react';
import { getInvoices, getPatients } from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import PDFExportInvoice from './PDFExportInvoice';

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [qrInvoice, setQRInvoice] = useState(null);

    useEffect(() => {
        fetchInvoicesData();
    }, []);

    useEffect(() => {
        console.log('Modal state:', { showDetailModal, selectedInvoice, showQRModal, qrInvoice });
    }, [showDetailModal, selectedInvoice, showQRModal, qrInvoice]);

    const fetchInvoicesData = async () => {
        setLoading(true);
        setError(null);

        try {
            const [invoicesData, patientsData] = await Promise.all([
                getInvoices(),
                getPatients()
            ]);

            if (invoicesData.length === 0) {
                setError('Không có dữ liệu hóa đơn. Vui lòng thêm dữ liệu.');
                setLoading(false);
                return;
            }

            const processedInvoices = invoicesData.map(invoice => {
                const patient = patientsData.find(p => p.id === invoice.patient_id);
                const validIssueDate = invoice.issue_date && typeof invoice.issue_date === 'string'
                    ? invoice.issue_date
                    : new Date().toISOString();
                if (!invoice.issue_date) {
                    console.warn(`Invoice ${invoice.id} has invalid issue_date: ${invoice.issue_date}`);
                }
                return {
                    ...invoice,
                    patientName: patient ? patient.full_name : 'Không xác định',
                    patientPhone: patient ? patient.phone : 'N/A',
                    patientGender: patient ? patient.gender : 'N/A',
                    issue_date: validIssueDate
                };
            });

            setInvoices(processedInvoices);
            setPatients(patientsData);
        } catch (err) {
            setError('Không thể tải dữ liệu hóa đơn. Vui lòng kiểm tra kết nối hoặc dữ liệu server.');
            console.error('Failed to fetch invoices data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleContactPatient = (phone) => {
        if (phone && phone !== 'N/A') {
            window.location.href = `tel:${phone}`;
            toast.info(`Đang gọi tới ${phone}`);
        } else {
            toast.error('Số điện thoại không khả dụng!');
        }
    };

    const handleViewDetails = (invoice) => {
        console.log('Opening details modal for invoice:', invoice);
        setSelectedInvoice({ ...invoice });
        setShowDetailModal(true);
    };

    const handleShowQR = (invoice) => {
        console.log('Opening QR modal for invoice:', invoice);
        setQRInvoice({ ...invoice });
        setShowQRModal(true);
    };

    const formatDate = (dateString) => {
        if (!dateString || typeof dateString !== 'string') {
            return 'Không xác định';
        }
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    };

    const getGenderIcon = (gender) => {
        return gender === 'Nam' ? 'fas fa-mars text-primary' : 'fas fa-venus text-danger';
    };

    const filteredInvoices = invoices.filter(invoice => {
        const matchesStatus = filterStatus ? invoice.status === filterStatus : true;
        const invoiceDate = invoice.issue_date && typeof invoice.issue_date === 'string'
            ? invoice.issue_date.split('T')[0]
            : '';
        const matchesDate =
            (!startDate || (invoiceDate && invoiceDate >= startDate)) &&
            (!endDate || (invoiceDate && invoiceDate <= endDate));
        const matchesSearch = searchQuery
            ? invoice.patientName.toLowerCase().includes(searchQuery.toLowerCase())
            : true;
        return matchesStatus && matchesDate && matchesSearch;
    });

    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const paginatedInvoices = filteredInvoices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #22c1c3 0%, #fdbb2d 100%)'
            }}>
                <div className="text-center text-white">
                    <div className="spinner-border mb-4" style={{ width: '4rem', height: '4rem' }} role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <h3 className="mb-3">🚀 Đang tải dữ liệu hóa đơn...</h3>
                    <p className="mb-0">Vui lòng chờ trong giây lát</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative" style={{
            background: 'linear-gradient(135deg, #22c1c3 0%, #fdbb2d 100%)'
        }}>
            <ToastContainer />
            <div className="absolute inset-0" style={{
                background: `
                    radial-gradient(circle at 20% 20%, rgba(34, 193, 195, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(253, 187, 45, 0.3) 0%, transparent 50%)
                `,
                animation: 'floating 6s ease-in-out infinite'
            }}></div>

            <div className="container-fluid py-4 relative z-10">
                <div className="row mb-5">
                    <div className="col-12">
                        <div className="card border-0 rounded-4" style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <div className="card-body p-5">
                                <div className="row align-items-center">
                                    <div className="col-md-8">
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="rounded-circle me-4 flex items-center justify-center" style={{
                                                width: '80px',
                                                height: '80px',
                                                background: 'linear-gradient(135deg, #22c1c3, #fdbb2d)',
                                                boxShadow: '0 10px 20px rgba(34, 193, 195, 0.4)'
                                            }}>
                                                <i className="fas fa-file-invoice text-white text-2xl"></i>
                                            </div>
                                            <div>
                                                <h1 className="text-2xl font-bold mb-2 text-white" style={{
                                                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                                                }}>
                                                    🧾 Quản lý hóa đơn
                                                </h1>
                                               
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                className="btn btn-light btn-sm rounded-full px-4"
                                                onClick={fetchInvoicesData}
                                                disabled={loading}
                                                style={{ boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
                                                aria-label="Làm mới dữ liệu"
                                            >
                                                <i className="fas fa-sync-alt mr-2"></i>
                                                Làm mới dữ liệu
                                            </button>
                                            <Link to="/receptionist-dashboard" className="btn btn-outline-light btn-sm rounded-full px-4" aria-label="Quay lại Dashboard">
                                                <i className="fas fa-arrow-left mr-2"></i>
                                                Quay lại Dashboard
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="alert alert-danger rounded-4" role="alert">
                                {error}
                            </div>
                        </div>
                    </div>
                )}

                <div className="row mb-4">
                    <div className="col-lg-12">
                        <div className="card border-0 rounded-4 mb-4" style={{
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                        }}>
                            <div className="card-body p-4">
                                <div className="row gap-y-3">
                                    <div className="col-md-3">
                                        <label className="font-bold">Trạng thái</label>
                                        <select
                                            className="form-select rounded-full"
                                            value={filterStatus}
                                            onChange={(e) => {
                                                setFilterStatus(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <option value="">Tất cả</option>
                                            <option value="Paid">Đã thanh toán</option>
                                            <option value="Pending">Chờ thanh toán</option>
                                            <option value="Cancelled">Đã hủy</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="font-bold">Từ ngày</label>
                                        <input
                                            type="date"
                                            className="form-control rounded-full"
                                            value={startDate}
                                            onChange={(e) => {
                                                setStartDate(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="font-bold">Đến ngày</label>
                                        <input
                                            type="date"
                                            className="form-control rounded-full"
                                            value={endDate}
                                            onChange={(e) => {
                                                setEndDate(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="font-bold">Tìm kiếm</label>
                                        <input
                                            type="text"
                                            className="form-control rounded-full"
                                            placeholder="Tìm theo tên bệnh nhân"
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 mb-4">
                        <div className="card border-0 rounded-4" style={{
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                        }}>
                            <div className="card-header bg-transparent border-0 p-4">
                                <div className="flex justify-between items-center">
                                    <h5 className="font-bold mb-0 flex items-center" style={{ color: '#1f2937' }}>
                                        <div className="rounded-full mr-3 flex items-center justify-center" style={{
                                            width: '45px',
                                            height: '45px',
                                            background: 'linear-gradient(135deg, #22c1c3, #fdbb2d)'
                                        }}>
                                            <i className="fas fa-file-invoice text-white"></i>
                                        </div>
                                        Tất cả hóa đơn
                                        <span className="badge bg-primary rounded-full ml-3">{filteredInvoices.length}</span>
                                    </h5>
                                    <button className="btn btn-primary rounded-full px-4" style={{
                                        background: 'linear-gradient(135deg, #22c1c3, #fdbb2d)',
                                        border: 'none',
                                        boxShadow: '0 10px 20px rgba(34, 193, 195, 0.3)'
                                    }}>
                                        <i className="fas fa-plus mr-2"></i>Thêm hóa đơn
                                    </button>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                {filteredInvoices.length === 0 ? (
                                    <div className="text-center py-5">
                                        <div className="mb-4">
                                            <i className="fas fa-file-times text-gray-500 text-4xl"></i>
                                        </div>
                                        <h5 className="text-gray-500 mb-3">Không có hóa đơn nào</h5>
                                        <p className="text-gray-500">Hãy thêm hóa đơn mới hoặc thay đổi bộ lọc! 🌟</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="table-responsive">
                                            <table className="table table-hover mb-0">
                                                <thead style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' }}>
                                                    <tr>
                                                        <th className="border-0 px-4 py-3 font-bold">ID</th>
                                                        <th className="border-0 px-4 py-3 font-bold">👤 Bệnh nhân</th>
                                                        <th className="border-0 px-4 py-3 font-bold">💰 Số tiền</th>
                                                        <th className="border-0 px-4 py-3 font-bold">📊 Trạng thái</th>
                                                        <th className="border-0 px-4 py-3 font-bold">📅 Ngày tạo</th>
                                                        <th className="border-0 px-4 py-3 font-bold">⚡ Thao tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paginatedInvoices.map((invoice, index) => (
                                                        <tr key={invoice.id} style={{
                                                            transition: 'all 0.3s ease',
                                                            animation: `slideInUp 0.5s ease-out ${index * 0.1}s both`
                                                        }}>
                                                            <td className="px-4 py-4">{invoice.id}</td>
                                                            <td className="px-4 py-4">
                                                                <div className="flex items-center">
                                                                    <div className="rounded-circle me-3 d-flex align-items-center justify-content-center" style={{
                                                                        width: '50px',
                                                                        height: '50px',
                                                                        background: 'linear-gradient(135deg, #f093fb, #f5576c)'
                                                                    }}>
                                                                        <i className={getGenderIcon(invoice.patientGender) || 'fas fa-user text-white'}></i>
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold mb-1">{invoice.patientName}</div>
                                                                        <div className="flex items-center gap-2">
                                                                            <small className="text-gray-500">ID: {invoice.patient_id}</small>
                                                                            <span className="badge bg-light text-dark rounded-full text-sm">
                                                                                {invoice.patientGender}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 font-bold">{formatCurrency(invoice.total_amount)}</td>
                                                            <td className="px-4 py-4">
                                                                <span className="badge rounded-full px-3 py-2 font-bold" style={{
                                                                    background: `linear-gradient(135deg, ${dataHelpers.getStatusColor(invoice.status)}, ${dataHelpers.getStatusColor(invoice.status)}dd)`,
                                                                    color: 'white',
                                                                    fontSize: '0.8rem',
                                                                    boxShadow: `0 5px 15px ${dataHelpers.getStatusColor(invoice.status)}40`
                                                                }}>
                                                                    {dataHelpers.getStatusTextInvoice(invoice.status)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4">{formatDate(invoice.issue_date)}</td>
                                                            <td className="px-4 py-4">
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        className="btn btn-outline-primary btn-sm rounded-full"
                                                                        title="Xem chi tiết"
                                                                        onClick={() => handleViewDetails(invoice)}
                                                                        style={{ transition: 'all 0.3s ease' }}
                                                                        aria-label="Xem chi tiết hóa đơn"
                                                                    >
                                                                        <i className="fas fa-eye"></i>
                                                                    </button>
                                                                    {invoice.status === 'Pending' && (
                                                                        <button
                                                                            className="btn btn-outline-success btn-sm rounded-full"
                                                                            title="Thanh toán"
                                                                            onClick={() => handleShowQR(invoice)}
                                                                            style={{ transition: 'all 0.3s ease' }}
                                                                            aria-label="Thanh toán hóa đơn"
                                                                        >
                                                                            <i className="fas fa-qrcode"></i>
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        className="btn btn-outline-info btn-sm rounded-full"
                                                                        title="Liên hệ"
                                                                        onClick={() => handleContactPatient(invoice.patientPhone)}
                                                                        disabled={invoice.patientPhone === 'N/A'}
                                                                        style={{ transition: 'all 0.3s ease' }}
                                                                        aria-label="Liên hệ bệnh nhân"
                                                                    >
                                                                        <i className="fas fa-phone"></i>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="d-flex justify-content-center mt-3 mb-3">
                                            <button
                                                className="btn btn-outline-primary mr-2"
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage(currentPage - 1)}
                                                aria-label="Trang trước"
                                            >
                                                Trang trước
                                            </button>
                                            <span className="align-self-center">
                                                Trang {currentPage} / {totalPages}
                                            </span>
                                            <button
                                                className="btn btn-outline-primary ml-2"
                                                disabled={currentPage >= totalPages}
                                                onClick={() => setCurrentPage(currentPage + 1)}
                                                aria-label="Trang sau"
                                            >
                                                Trang sau
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {showDetailModal && selectedInvoice && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(10px)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}>
                        <div style={{
                            width: '100%',
                            maxWidth: '600px',
                            background: 'white',
                            borderRadius: '15px',
                            padding: '20px',
                            position: 'relative'
                        }}>
                            <button
                                onClick={() => {
                                    console.log('Closing details modal');
                                    setShowDetailModal(false);
                                    setSelectedInvoice(null);
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    background: 'red',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '30px',
                                    height: '30px',
                                    cursor: 'pointer'
                                }}
                                aria-label="Đóng modal chi tiết"
                            >
                                ✕
                            </button>
                            <h3>Chi tiết hóa đơn</h3>
                            <p><strong>ID:</strong> {selectedInvoice.id}</p>
                            <p><strong>Bệnh nhân:</strong> {selectedInvoice.patientName}</p>
                            <p><strong>Mã đơn thuốc:</strong> {selectedInvoice.medicineRecord_id}</p>
                            <p><strong>Số tiền:</strong> {formatCurrency(selectedInvoice.total_amount)}</p>
                            <p><strong>Trạng thái:</strong> {dataHelpers.getStatusTextInvoice(selectedInvoice.status)}</p>
                            <p><strong>Ngày tạo:</strong> {formatDate(selectedInvoice.issue_date)}</p>
                            <p><strong>Số điện thoại:</strong> {selectedInvoice.patientPhone}</p>
                            <div className="d-flex justify-content-end">
                                <PDFExportInvoice
                                    invoice={selectedInvoice}
                                    patient={patients.find(p => p.id === selectedInvoice.patient_id)}
                                    formatCurrency={formatCurrency}
                                    formatDate={formatDate}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {showQRModal && qrInvoice && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.9)',
                        backdropFilter: 'blur(12px)',
                        zIndex: 10000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}>
                        <div style={{
                            width: '100%',
                            maxWidth: '500px',
                            background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                            borderRadius: '20px',
                            padding: '30px',
                            boxShadow: '0 15px 30px rgba(0,0,0,0.2)',
                            position: 'relative',
                            animation: 'fadeInUp 0.3s ease-out'
                        }}>
                            <button
                                onClick={() => {
                                    console.log('Closing QR modal');
                                    setShowQRModal(false);
                                    setQRInvoice(null);
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '15px',
                                    right: '15px',
                                    background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem',
                                    boxShadow: '0 5px 15px rgba(255, 107, 107, 0.4)',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'scale(1.1)';
                                    e.target.style.boxShadow = '0 8px 20px rgba(255, 107, 107, 0.6)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'scale(1)';
                                    e.target.style.boxShadow = '0 5px 15px rgba(255, 107, 107, 0.4)';
                                }}
                                aria-label="Đóng modal QR"
                            >
                                ✕
                            </button>
                            <h3 className="text-2xl font-bold mb-6 text-gray-800 d-flex justify-content-center" style={{
                                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                                fontFamily: '"Inter", sans-serif'
                            }}>
                                Thanh toán hóa đơn
                            </h3>
                            <div className="space-y-4 mb-6">
                                <p className="text-lg d-flex justify-content-center"><strong className="text-gray-700">ID hóa đơn:</strong> {qrInvoice.id}</p>
                                <p className="text-lg d-flex justify-content-center"><strong className="text-gray-700">Số tiền:</strong> <span className="text-green-600 font-semibold">{formatCurrency(qrInvoice.total_amount)}</span></p>
                                <p className="text-gray-600 text-base d-flex justify-content-center">Quét mã QR dưới đây để thanh toán:</p>
                            </div>
                            <div className="d-flex justify-content-center">
                                <img
                                    src={`https://img.vietqr.io/image/970422-0981546618-compact2.png?amount=${qrInvoice.total_amount}&addInfo=Thanh%20to%C3%A1n%20h%C3%B3a%20%C4%91%C6%A1n%20${qrInvoice.id}`}
                                    alt="QR Code Thanh toán"
                                    style={{
                                        maxWidth: '250px',
                                        width: '100%',
                                        borderRadius: '10px',
                                        border: '2px solid #22c1c3',
                                        boxShadow: '0 5px 15px rgba(34, 193, 195, 0.3)',
                                        padding: '10px',
                                        background: 'white'
                                    }}
                                />
                            </div>
                            <div className="d-flex justify-content-center mt-6">
                                <button
                                    className="btn btn-success rounded-full px-4 py-2 mt-3"
                                    onClick={async () => {
                                        try {
                                            const response = await apiService.updateInvoiceStatus(qrInvoice.id, 'Paid');
                                            handleApiSuccess(response);
                                            setInvoices(prevInvoices =>
                                                prevInvoices.map(invoice =>
                                                    invoice.id === qrInvoice.id ? { ...invoice, status: 'Paid' } : invoice
                                                )
                                            );
                                            toast.success('Xác nhận thanh toán thành công!');
                                            setShowQRModal(false);
                                            setQRInvoice(null);
                                        } catch (err) {
                                            const errorResult = handleApiError(err);
                                            toast.error(errorResult.message || 'Không thể xác nhận thanh toán. Vui lòng thử lại.');
                                            console.error('Failed to update invoice status:', err);
                                        }
                                    }}
                                    style={{
                                        background: 'linear-gradient(135deg, #22c1c3, #fdbb2d)',
                                        border: 'none',
                                        boxShadow: '0 5px 15px rgba(34, 193, 195, 0.3)',
                                        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'scale(1.05)';
                                        e.target.style.boxShadow = '0 8px 20px rgba(34, 193, 195, 0.5)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'scale(1)';
                                        e.target.style.boxShadow = '0 5px 15px rgba(34, 193, 195, 0.3)';
                                    }}
                                    aria-label="Xác nhận thanh toán hóa đơn"
                                >
                                    <i className="fas fa-check-circle mr-2 mb-3"></i>
                                    Đã xác nhận thanh toán
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <style jsx>{`
                    @keyframes floating {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        33% { transform: translateY(-10px) rotate(1deg); }
                        66% { transform: translateY(5px) rotate(-1deg); }
                    }
                    
                    @keyframes slideInUp {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    .btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 10px 20px rgba(0,0,0,0.2) !important;
                    }
                    
                    .card:hover {
                        transform: translateY(-5px);
                    }
                    
                    tr:hover {
                        background: linear-gradient(135deg, #f8fafc, #f1f5f9) !important;
                        transform: scale(1.01);
                    }
                `}</style>
            </div>
        </div>
    );
};

export default Invoices;