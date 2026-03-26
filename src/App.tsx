import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ModernBusinesses from './components/ModernBusinesses';
import Benefits from './components/Benefits';
import CoreModules from './components/CoreModules';
import MedicalTranscriptionModule from './components/MedicalTranscriptionModule';
import PerformanceRewards from './components/PerformanceRewards';
import CommunicationCollaboration from './components/CommunicationCollaboration';
import ReportingAnalytics from './components/ReportingAnalytics';
import Industries from './components/Industries';
import HowItWorks from './components/HowItWorks';
import FinalCTA from './components/FinalCTA';
import Features from './components/Features';
import Footer from './components/Footer';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ManageCompanies from './pages/ManageCompanies';
import SubscriptionPlans from './pages/SubscriptionPlans';
import Invoices from './pages/Invoices';
import Connection from './pages/Connection';
import GmailIntegration from './pages/GmailIntegration';
import WhatsAppIntegration from './pages/WhatsAppIntegration';
import EmployerDashboard from './pages/employer/EmployerDashboard';
import TimeTrack from './pages/employer/TimeTrack';
import Attendance from './pages/employer/Attendance';
import Department from './pages/employer/Department';
import Designation from './pages/employer/Designation';
import Employee from './pages/employer/Employee';
import Leave from './pages/employer/Leave';
import Payroll from './pages/employer/Payroll';
import Shifts from './pages/employer/Shifts';
import Performance from './pages/employer/Performance';
import Recruitment from './pages/employer/Recruitment';
import Training from './pages/employer/Training';
import Assets from './pages/employer/Assets';
import Expenses from './pages/employer/Expenses';
import Reports from './pages/employer/Reports';
import Settings from './pages/employer/Settings';
import OrgChart from './pages/employer/OrgChart';
import CompanyPolicy from './pages/employer/CompanyPolicy';
import EmployerPermissions from './pages/EmployerPermissions';
import CompanyAdminLogin from './pages/CompanyAdminLogin';
import CompanyAdminDashboard from './pages/CompanyAdminDashboard';
import CompanyAdminLayout from './components/CompanyAdminLayout';
import CompanyAdminAttendance from './pages/CompanyAdminAttendance';
import CompanyAdminDepartment from './pages/CompanyAdminDepartment';
import CompanyAdminDesignation from './pages/CompanyAdminDesignation';
import CompanyAdminEmployee from './pages/CompanyAdminEmployee';
import CompanyAdminTimeTracking from './pages/CompanyAdminTimeTracking';
import EmployeeLayout from './components/EmployeeLayout';
import EmployeeAttendance from './pages/EmployeeAttendance';
import EmployeeLogin from './pages/EmployeeLogin';
import EmployeeDashboard from './pages/EmployeeDashboard';

function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <ModernBusinesses />
      <Benefits />
      <CoreModules />
      <MedicalTranscriptionModule />
      <PerformanceRewards />
      <CommunicationCollaboration />
      <ReportingAnalytics />
      <Industries />
      <HowItWorks />
      <FinalCTA />
      <Features />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/super-admin" element={<SuperAdminLogin />} />
        <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/super-admin/companies" element={<ManageCompanies />} />
        <Route path="/super-admin/plans" element={<SubscriptionPlans />} />
        <Route path="/super-admin/invoice" element={<Invoices />} />
        <Route path="/super-admin/connection" element={<Connection />} />
        <Route path="/super-admin/gmail" element={<GmailIntegration />} />
        <Route path="/super-admin/whatsapp" element={<WhatsAppIntegration />} />
        <Route path="/super-admin/permissions" element={<EmployerPermissions />} />
        <Route path="/super-admin/employer/dashboard" element={<EmployerDashboard />} />
        <Route path="/super-admin/employer/time-track" element={<TimeTrack />} />
        <Route path="/super-admin/employer/org-chart/chart" element={<OrgChart />} />
        <Route path="/super-admin/employer/org-chart/policy" element={<CompanyPolicy />} />
        <Route path="/super-admin/employer/department" element={<Department />} />
        <Route path="/super-admin/employer/designation" element={<Designation />} />
        <Route path="/super-admin/employer/employee" element={<Employee />} />
        <Route path="/super-admin/employer/attendance" element={<Attendance />} />
        <Route path="/super-admin/employer/leaves" element={<Leave />} />
        <Route path="/super-admin/employer/payroll" element={<Payroll />} />
        <Route path="/super-admin/employer/shifts" element={<Shifts />} />
        <Route path="/super-admin/employer/performance" element={<Performance />} />
        <Route path="/super-admin/employer/recruitment" element={<Recruitment />} />
        <Route path="/super-admin/employer/training" element={<Training />} />
        <Route path="/super-admin/employer/assets" element={<Assets />} />
        <Route path="/super-admin/employer/expenses" element={<Expenses />} />
        <Route path="/super-admin/employer/reports" element={<Reports />} />
        <Route path="/super-admin/employer/settings/*" element={<Settings />} />
        <Route path="/company-admin" element={<CompanyAdminLogin />} />
        <Route path="/company-admin" element={<CompanyAdminLayout />}>
          <Route path="dashboard" element={<CompanyAdminDashboard />} />
          <Route path="attendance" element={<CompanyAdminAttendance />} />
          <Route path="department" element={<CompanyAdminDepartment />} />
          <Route path="designation" element={<CompanyAdminDesignation />} />
          <Route path="employee" element={<CompanyAdminEmployee />} />
          <Route path="time-track" element={<CompanyAdminTimeTracking />} />
          <Route path="org-chart/chart" element={<OrgChart />} />
          <Route path="org-chart/policy" element={<CompanyPolicy />} />
          <Route path="settings/*" element={<Settings />} />
          {/* Add more routes here as needed */}
        </Route>
        <Route path="/employee/login" element={<EmployeeLogin />} />
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="attendance" element={<EmployeeAttendance />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
