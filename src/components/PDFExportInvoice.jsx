import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PDFExportInvoice = ({ invoice, patient, formatCurrency, formatDate }) => {
    const generatePDF = async () => {
        try {
            const contentDiv = document.createElement('div');
            contentDiv.style.width = '600px';
            contentDiv.style.padding = '24px';
            contentDiv.style.fontFamily = 'Arial, sans-serif';
            contentDiv.style.fontSize = '13px';
            contentDiv.style.backgroundColor = 'white';
            contentDiv.style.color = 'black';

            contentDiv.innerHTML = `
                <div style="text-align:center; margin-bottom:24px;">
                    <h2 style="margin:0; color:#2c3e50;">PHÒNG KHÁM Y TẾ</h2>
                    <h3 style="margin:8px 0 0 0; color:#2980b9;">HÓA ĐƠN THANH TOÁN</h3>
                    <p style="margin:4px 0; color:#888;">Ngày xuất: ${formatDate(invoice.issue_date)}</p>
                </div>
                <div style="margin-bottom:18px;">
                    <table style="width:100%; border-collapse:collapse;">
                        <tr>
                            <td style="font-weight:bold; padding:4px;">Mã hóa đơn:</td>
                            <td style="padding:4px;">${invoice.id}</td>
                        </tr>
                        <tr>
                            <td style="font-weight:bold; padding:4px;">Bệnh nhân:</td>
                            <td style="padding:4px;">${patient?.full_name || invoice.patientName}</td>
                        </tr>
                        <tr>
                            <td style="font-weight:bold; padding:4px;">Số điện thoại:</td>
                            <td style="padding:4px;">${patient?.phone || invoice.patientPhone}</td>
                        </tr>
                        <tr>
                            <td style="font-weight:bold; padding:4px;">Ngày tạo:</td>
                            <td style="padding:4px;">${formatDate(invoice.issue_date)}</td>
                        </tr>
                        <tr>
                            <td style="font-weight:bold; padding:4px;">Trạng thái:</td>
                            <td style="padding:4px;">${invoice.status}</td>
                        </tr>
                    </table>
                </div>
                <div style="margin-bottom:18px;">
                    <table style="width:100%; border-collapse:collapse;">
                        <tr>
                            <td style="font-weight:bold; padding:4px;">Tổng tiền:</td>
                            <td style="padding:4px; color:#e74c3c; font-size:16px; font-weight:bold;">${formatCurrency(invoice.total_amount)}</td>
                        </tr>
                    </table>
                </div>
                <div style="margin-top:32px; text-align:center; color:#888; font-size:12px;">
                    <p>Báo cáo được tạo tự động bởi hệ thống</p>
                    <p>Thời gian: ${new Date().toLocaleString('vi-VN')}</p>
                </div>
            `;

            document.body.appendChild(contentDiv);
            const canvas = await html2canvas(contentDiv, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });
            document.body.removeChild(contentDiv);

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            const fileName = `hoa_don_${invoice.id}_${patient?.full_name?.replace(/\s+/g, '_') || 'benh_nhan'}.pdf`;
            pdf.save(fileName);
        } catch (error) {
            alert('❌ Có lỗi khi xuất PDF: ' + error.message);
        }
    };

    return (
        <button
            onClick={generatePDF}
            className="btn btn-danger"
            style={{ marginLeft: '10px' }}
            title="Xuất hóa đơn PDF"
        >
            <i className="fas fa-file-invoice me-2"></i>
            Xuất hóa đơn PDF
        </button>
    );
};

export default PDFExportInvoice; 