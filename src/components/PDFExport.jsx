import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PDFExport = ({ 
    patient, 
    serviceOrder, 
    serviceResults, 
    diagnosis, 
    prescriptions, 
    medicineDetails, 
    medicines,
    medicalServices 
}) => {
    
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getServiceInfo = (serviceId) => {
        return medicalServices.find(service => String(service.id) === String(serviceId));
    };

    const getMedicineInfo = (medicineId) => {
        return medicines.find(medicine => medicine.id === medicineId);
    };

    const getMedicineDetailsForPrescription = (prescriptionId) => {
        const medicineDetailEntry = medicineDetails.find(entry => entry.prescriptionId === prescriptionId);
        return medicineDetailEntry ? medicineDetailEntry.medicineDetails : [];
    };

    const generatePDF = async () => {
        try {
            // Create a temporary div to render the content
            const contentDiv = document.createElement('div');
            contentDiv.style.width = '800px';
            contentDiv.style.padding = '20px';
            contentDiv.style.fontFamily = 'Arial, sans-serif';
            contentDiv.style.fontSize = '12px';
            contentDiv.style.lineHeight = '1.4';
            contentDiv.style.backgroundColor = 'white';
            contentDiv.style.color = 'black';

            // Generate HTML content
            contentDiv.innerHTML = `
                <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
                    <h1 style="color: #2c3e50; margin: 0; font-size: 24px;">PHÒNG KHÁM Y TẾ</h1>
                    <h2 style="color: #34495e; margin: 10px 0; font-size: 20px;">KẾT QUẢ KHÁM BỆNH</h2>
                    <p style="margin: 5px 0; color: #7f8c8d;">Ngày xuất báo cáo: ${formatDate(new Date())}</p>
                </div>

                <div style="margin-bottom: 25px;">
                    <h3 style="color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 15px;">
                        THÔNG TIN BỆNH NHÂN
                    </h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 150px; font-weight: bold; padding: 5px;">Họ và tên:</td>
                            <td style="padding: 5px;">${patient?.full_name || 'Không có thông tin'}</td>
                            <td style="width: 150px; font-weight: bold; padding: 5px;">Số điện thoại:</td>
                            <td style="padding: 5px;">${patient?.phone || 'Không có thông tin'}</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold; padding: 5px;">Ngày khám:</td>
                            <td style="padding: 5px;">${formatDate(serviceOrder?.order_date)}</td>
                            <td style="font-weight: bold; padding: 5px;">Mã hồ sơ:</td>
                            <td style="padding: 5px;">${serviceOrder?.medicineRecord_id || 'N/A'}</td>
                        </tr>
                    </table>
                </div>

                ${diagnosis && diagnosis.length > 0 ? `
                <div style="margin-bottom: 25px;">
                    <h3 style="color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 15px;">
                        KẾT LUẬN ĐIỀU TRỊ
                    </h3>
                    ${diagnosis.map((diag, index) => `
                        <div style="background-color: #f8f9fa; border-left: 4px solid #f39c12; padding: 15px; margin-bottom: 15px;">
                            <h4 style="margin: 0 0 10px 0; color: #e67e22;">Kết luận #${index + 1}</h4>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="width: 120px; font-weight: bold; padding: 5px;">Chẩn đoán:</td>
                                    <td style="padding: 5px;">${diag.disease}</td>
                                </tr>
                                <tr>
                                    <td style="font-weight: bold; padding: 5px;">Kế hoạch điều trị:</td>
                                    <td style="padding: 5px;">${diag.treatment_plan}</td>
                                </tr>
                                <tr>
                                    <td style="font-weight: bold; padding: 5px;">Kết luận:</td>
                                    <td style="padding: 5px;">${diag.conclusion}</td>
                                </tr>
                            </table>
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                ${serviceResults && serviceResults.length > 0 ? `
                <div style="margin-bottom: 25px;">
                    <h3 style="color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 15px;">
                        KẾT QUẢ DỊCH VỤ
                    </h3>
                    <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
                        <thead>
                            <tr style="background-color: #f8f9fa;">
                                <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">STT</th>
                                <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Dịch Vụ</th>
                                <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Kết Quả</th>
                                <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Thời Gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${serviceResults.map((result, index) => {
                                const service = getServiceInfo(result.service_id);
                                return `
                                    <tr>
                                        <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
                                        <td style="border: 1px solid #ddd; padding: 8px;">
                                            <strong>${service?.name || 'Dịch vụ không xác định'}</strong><br>
                                            <small style="color: #666;">${service?.description || ''}</small>
                                        </td>
                                        <td style="border: 1px solid #ddd; padding: 8px;">${result.result_description}</td>
                                        <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(result.created_at)}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                ` : ''}

                ${prescriptions && prescriptions.length > 0 ? `
                <div style="margin-bottom: 25px;">
                    <h3 style="color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 15px;">
                        ĐƠN THUỐC ĐÃ KÊ (${prescriptions.length} đơn)
                    </h3>
                    ${prescriptions.map((prescription, prescriptionIndex) => {
                        const prescriptionMedicineDetails = getMedicineDetailsForPrescription(prescription.id);
                        return `
                            <div style="border: 2px solid #27ae60; margin-bottom: 20px; border-radius: 5px;">
                                <div style="background-color: #27ae60; color: white; padding: 10px;">
                                    <h4 style="margin: 0;">Đơn thuốc #${prescriptionIndex + 1}</h4>
                                    <p style="margin: 5px 0;">Ngày kê: ${formatDate(prescription.created_at)}</p>
                                    ${prescription.doctor_id ? `<p style="margin: 5px 0;">Bác sĩ kê: BS ${prescription.doctor_id}</p>` : ''}
                                </div>
                                <div style="padding: 15px;">
                                    ${prescriptionMedicineDetails.length > 0 ? `
                                        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
                                            <thead>
                                                <tr style="background-color: #f8f9fa;">
                                                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">STT</th>
                                                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Tên Thuốc</th>
                                                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Liều Lượng</th>
                                                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Số Lượng</th>
                                                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Ghi Chú</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${prescriptionMedicineDetails.map((medicineDetail, index) => {
                                                    const medicine = getMedicineInfo(medicineDetail.medicine_id);
                                                    return `
                                                        <tr>
                                                            <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
                                                            <td style="border: 1px solid #ddd; padding: 8px;">
                                                                <strong>${medicine?.name || 'Thuốc không xác định'}</strong><br>
                                                                <small style="color: #666;">${medicine?.description || ''}</small>
                                                            </td>
                                                            <td style="border: 1px solid #ddd; padding: 8px;">${medicineDetail.dosage || 'Không có'}</td>
                                                            <td style="border: 1px solid #ddd; padding: 8px;">${medicineDetail.quantity || '0'}</td>
                                                            <td style="border: 1px solid #ddd; padding: 8px;">${medicineDetail.notes || 'Không có ghi chú'}</td>
                                                        </tr>
                                                    `;
                                                }).join('')}
                                            </tbody>
                                        </table>
                                    ` : `
                                        <p style="text-align: center; color: #666; font-style: italic;">
                                            Chưa có thông tin thuốc chi tiết
                                        </p>
                                    `}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                ` : ''}

                <div style="margin-top: 40px; text-align: center; border-top: 1px solid #ddd; padding-top: 20px;">
                    <p style="margin: 5px 0; color: #7f8c8d;">Báo cáo được tạo tự động bởi hệ thống</p>
                    <p style="margin: 5px 0; color: #7f8c8d;">Thời gian: ${new Date().toLocaleString('vi-VN')}</p>
                </div>
            `;

            // Add to document temporarily
            document.body.appendChild(contentDiv);

            // Convert to canvas
            const canvas = await html2canvas(contentDiv, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });

            // Remove temporary div
            document.body.removeChild(contentDiv);

            // Create PDF
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

            // Save PDF
            const fileName = `ket_qua_kham_${patient?.full_name?.replace(/\s+/g, '_') || 'benh_nhan'}_${formatDate(new Date()).replace(/\//g, '-')}.pdf`;
            pdf.save(fileName);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('❌ Có lỗi xảy ra khi tạo PDF: ' + error.message);
        }
    };

    return (
        <button
            onClick={generatePDF}
            className="btn btn-success"
            style={{ marginLeft: '10px' }}
            title="Xuất PDF kết quả khám bệnh"
        >
            <i className="fas fa-file-pdf me-2"></i>
            Xuất PDF
        </button>
    );
};

export default PDFExport; 