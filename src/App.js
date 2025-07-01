import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Components
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Login from './components/Login';
import RegisterPatient from './components/RegisterPatient';
import ForgetPassword from './components/ForgetPassword';
import EditInforDoctor from './components/editInforDoctor';
import EditInforNurse from './components/editInforNurse';
import EditInforPatient from './components/editInforPatient';
import EditInforReceptionist from './components/editInforReceptionist';
import DoctorDashboard from './components/DoctorDashboard';
import PatientDashboard from './components/PatientDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Header - Always visible */}
        <Header />
        
        {/* Main Content with Routes */}
        <main className="main-content" style={{minHeight: '80vh'}}>
          <Routes>
            {/* Home Page */}
            <Route path="/" element={<Home />} />
            
            {/* Authentication Pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterPatient />} />
            <Route path="/forgot-password" element={<ForgetPassword />} />
            
            {/* Edit Information Pages */}
            <Route path="/edit/doctor" element={<EditInforDoctor />} />
            <Route path="/edit/doctor/:id" element={<EditInforDoctor />} />
            
            <Route path="/edit/nurse" element={<EditInforNurse />} />
            <Route path="/edit/nurse/:id" element={<EditInforNurse />} />
            
            <Route path="/edit/patient" element={<EditInforPatient />} />
            <Route path="/edit/patient/:id" element={<EditInforPatient />} />
            
            <Route path="/edit/receptionist" element={<EditInforReceptionist />} />
            <Route path="/edit/receptionist/:id" element={<EditInforReceptionist />} />
            
            {/* Management Pages */}
            <Route path="/doctors" element={<DoctorsList />} />
            <Route path="/nurses" element={<NursesList />} />
            <Route path="/patients" element={<PatientsList />} />
            <Route path="/receptionists" element={<ReceptionistsList />} />
            
            {/* Other Pages */}
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/appointment" element={<BookAppointment />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/appointments" element={<MyAppointments />} />
            
            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        {/* Footer - Always visible */}
        <Footer />
      </div>
    </Router>
  );
}

// Placeholder components for pages that don't exist yet
const DoctorsList = () => (
  <div className="container py-5">
    <h2 className="text-center mb-4">Doctors List</h2>
    <p className="text-center text-muted">This page will show list of all doctors.</p>
    <div className="text-center">
      <a href="/edit/doctor" className="btn btn-primary">Add New Doctor</a>
    </div>
  </div>
);

const NursesList = () => (
  <div className="container py-5">
    <h2 className="text-center mb-4">Nurses List</h2>
    <p className="text-center text-muted">This page will show list of all nurses.</p>
    <div className="text-center">
      <a href="/edit/nurse" className="btn btn-primary">Add New Nurse</a>
    </div>
  </div>
);

const PatientsList = () => (
  <div className="container py-5">
    <h2 className="text-center mb-4">Patients List</h2>
    <p className="text-center text-muted">This page will show list of all patients.</p>
    <div className="text-center">
      <a href="/edit/patient" className="btn btn-primary">Add New Patient</a>
    </div>
  </div>
);

const ReceptionistsList = () => (
  <div className="container py-5">
    <h2 className="text-center mb-4">Receptionists List</h2>
    <p className="text-center text-muted">This page will show list of all receptionists.</p>
    <div className="text-center">
      <a href="/edit/receptionist" className="btn btn-primary">Add New Receptionist</a>
    </div>
  </div>
);

const Services = () => (
  <div className="container py-5">
    <h2 className="text-center mb-4">Our Services</h2>
    <p className="text-center text-muted">Detailed information about our medical services.</p>
  </div>
);

const About = () => (
  <div className="container py-5">
    <h2 className="text-center mb-4">About MediCare Pro</h2>
    <p className="text-center text-muted">Learn more about our medical center and team.</p>
  </div>
);

const Contact = () => (
  <div className="container py-5">
    <h2 className="text-center mb-4">Contact Us</h2>
    <p className="text-center text-muted">Get in touch with our medical center.</p>
  </div>
);

const BookAppointment = () => (
  <div className="container py-5">
    <h2 className="text-center mb-4">Book Appointment</h2>
    <p className="text-center text-muted">Schedule your medical appointment.</p>
  </div>
);

const Dashboard = () => (
  <div className="container py-5">
    <h2 className="text-center mb-4">Dashboard</h2>
    <p className="text-center text-muted">Your personal dashboard.</p>
  </div>
);

const Profile = () => (
  <div className="container py-5">
    <h2 className="text-center mb-4">My Profile</h2>
    <p className="text-center text-muted">Manage your profile information.</p>
  </div>
);

const Settings = () => (
  <div className="container py-5">
    <h2 className="text-center mb-4">Settings</h2>
    <p className="text-center text-muted">Configure your account settings.</p>
  </div>
);

const MyAppointments = () => (
  <div className="container py-5">
    <h2 className="text-center mb-4">My Appointments</h2>
    <p className="text-center text-muted">View and manage your appointments.</p>
  </div>
);

const NotFound = () => (
  <div className="container py-5 text-center">
    <h1 className="display-1 fw-bold text-primary">404</h1>
    <h2 className="mb-4">Page Not Found</h2>
    <p className="lead text-muted mb-4">The page you're looking for doesn't exist.</p>
    <a href="/" className="btn btn-primary btn-lg">
      <i className="fas fa-home me-2"></i>
      Back to Home
    </a>
  </div>
);

export default App;
