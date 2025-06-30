import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(to right, #e8f0fe, #ffffff)',
        height: '100vh',
        padding: '20px',
        fontFamily: 'Segoe UI, sans-serif'
    },
    form: {
        background: 'white',
        padding: '30px 40px',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0, 128, 255, 0.1)',
        width: '100%',
        maxWidth: '500px'
    },
    label: {
        display: 'block',
        marginTop: '15px',
        marginBottom: '5px',
        fontWeight: 500
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #90caf9',
        borderRadius: '6px',
        fontSize: '15px'
    },
    button: {
        marginTop: '25px',
        width: '100%',
        padding: '12px',
        fontSize: '16px',
        backgroundColor: '#1976d2',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background 0.3s ease'
    },
    buttonHover: {
        backgroundColor: '#0d47a1'
    },
    error: {
        color: 'red',
        fontSize: '0.85rem',
        marginTop: '4px',
        display: 'block'
    }
};

const RegisterPatient = () => {
    const navigate = useNavigate();
    const [account, setAccount] = useState({ username: "", password: "", email: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [patient, setPatient] = useState({
        full_name: "",
        dob: "",
        gender: "Nam",
        phone: "",
        address: "",
    });
    const [errors, setErrors] = useState({});

    const handleAccountChange = (e) => {
        const { name, value } = e.target;
        setAccount({ ...account, [name]: value });
        validateField(name, value);
    };

    const handlePatientChange = (e) => {
        const { name, value } = e.target;
        setPatient({ ...patient, [name]: value });
        validateField(name, value);
    };

    const validateField = (name, value) => {
        let message = "";
        switch (name) {
            case "username":
                if (!value.trim()) message = "Vui lòng nhập tên đăng nhập";
                break;
            case "password":
                if (!value || value.length < 6) message = "Mật khẩu tối thiểu 6 ký tự";
                else if (value.includes(" ")) message = "Mật khẩu không được chứa dấu cách";
                break;
            case "email":
                if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) message = "Email không hợp lệ";
                break;
            case "full_name":
                if (!value.trim()) message = "Vui lòng nhập họ tên";
                else if (value.length < 2 || value.length > 50) message = "Họ tên phải từ 2 đến 50 ký tự";
                else if (!/^[A-Za-zÀ-ỹ\s]+$/.test(value)) message = "Họ tên chỉ được chứa chữ cái và dấu cách";
                else if (!/^[A-Za-zÀ-ỹ]/.test(value)) message = "Ký tự đầu tiên của họ tên phải là chữ cái";
                else if (/(.)\1\1/.test(value)) message = "Họ tên không được chứa 3 ký tự giống nhau liên tiếp";
                break;
            case "address":
                if (!value.trim()) message = "Vui lòng nhập địa chỉ";
                else if (value.length < 2 || value.length > 50) message = "Địa chỉ phải từ 2 đến 50 ký tự";
                else if (!/^[A-Za-zÀ-ỹ0-9\s,./-]+$/.test(value)) message = "Địa chỉ chỉ được chứa chữ, số và dấu cách";
                else if (!/^[A-Za-zÀ-ỹ0-9]/.test(value)) message = "Ký tự đầu tiên của địa chỉ phải là chữ hoặc số";
                else if (/(.)\1\1/.test(value)) message = "Địa chỉ không được chứa 3 ký tự giống nhau liên tiếp";
                break;
            case "dob":
                if (!value) message = "Vui lòng chọn ngày sinh";
                else if (new Date(value) > new Date()) message = "Ngày sinh không được lớn hơn ngày hiện tại";
                break;
            case "phone":
                if (!/^0[0-9]{9}$/.test(value)) message = "Số điện thoại không hợp lệ (bắt đầu bằng 0, đủ 10 số)";
                break;
            default:
                break;
        }
        setErrors((prev) => ({ ...prev, [name]: message }));
    };

    const validate = () => {
        const allFields = { ...account, ...patient };
        Object.entries(allFields).forEach(([name, value]) => validateField(name, value));
        return Object.values(errors).every((err) => !err);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            const res = await fetch("http://localhost:9999/AccountPatient");
            const accounts = await res.json();
            const maxId = accounts.reduce((max, acc) => Math.max(max, acc.id || 0), 0);
            const newId = maxId + 1;

            const accRes = await fetch("http://localhost:9999/AccountPatient", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: newId, ...account, img: "default.png", status: "Enable" })
            });
            if (!accRes.ok) throw new Error("Tạo tài khoản thất bại");

            const patientRes = await fetch("http://localhost:9999/Patient", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...patient, id: newId })
            });
            if (!patientRes.ok) throw new Error("Lưu thông tin bệnh nhân thất bại");

            alert("Đăng ký thành công!");
            navigate("/login");
        } catch (err) {
            console.error("Đăng ký lỗi:", err);
            alert("Đăng ký thất bại! " + err.message);
        }
    };

    return (
        <div style={styles.container}>
            <form style={styles.form} onSubmit={handleSubmit}>
                <h2 style={{ textAlign: "center", color: "#1565c0", marginBottom: "25px" }}>Đăng ký tài khoản bệnh nhân</h2>

                {[
                    { label: "Tên đăng nhập", name: "username", type: "text", onChange: handleAccountChange, value: account.username, error: errors.username },
                    { label: "Mật khẩu", name: "password", type: showPassword ? "text" : "password", onChange: handleAccountChange, value: account.password, isPassword: true, error: errors.password },
                    { label: "Email", name: "email", type: "email", onChange: handleAccountChange, value: account.email, error: errors.email },
                    { label: "Họ và tên", name: "full_name", type: "text", onChange: handlePatientChange, value: patient.full_name, error: errors.full_name },
                    { label: "Ngày sinh", name: "dob", type: "date", onChange: handlePatientChange, value: patient.dob, error: errors.dob },
                    { label: "Số điện thoại", name: "phone", type: "text", onChange: handlePatientChange, value: patient.phone, error: errors.phone },
                    { label: "Địa chỉ", name: "address", type: "text", onChange: handlePatientChange, value: patient.address, error: errors.address },
                ].map((field, idx) => (
                    <div key={idx}>
                        <label style={styles.label}>{field.label}</label>
                        <div style={{ position: "relative" }}>
                            <input
                                style={styles.input}
                                type={field.type}
                                name={field.name}
                                value={field.value}
                                onChange={field.onChange}
                                required
                            />
                            {field.isPassword && (
                                <i
                                    className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}
                                    onClick={() => setShowPassword(!showPassword)}
                                ></i>
                            )}
                        </div>
                        {field.error && <span style={styles.error}>{field.error}</span>}
                    </div>
                ))}

                <label style={styles.label}>Giới tính</label>
                <select name="gender" value={patient.gender} onChange={handlePatientChange} style={styles.input}>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                </select>

                <button type="submit" style={styles.button}>Tạo tài khoản</button>
            </form>
        </div>
    );
};

export default RegisterPatient;
