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
import Attendance from './pages/employer/Attendance';
import Department from './pages/employer/Department';
import Designation from './pages/employer/Designation';
import Employee from './pages/employer/Employee';
import Leave from './pages/employer/Leave';
import Payroll from './pages/employer/Payroll';
import CompanyPayroll from './pages/employer/payroll/CompanyPayroll';
import SalaryAdvance from './pages/employer/payroll/SalaryAdvance';
import SalaryGenerate from './pages/employer/payroll/SalaryGenerate';
import ManageEmployeeSalary from './pages/employer/payroll/ManageEmployeeSalary';
import SalarySlip from './pages/employer/payroll/SalarySlip';
import PayrollPostingSheet from './pages/employer/payroll/PayrollPostingSheet';
import EmployeeSalaryChart from './pages/employer/payroll/EmployeeSalaryChart';
import Shifts from './pages/employer/Shifts';
import Performance from './pages/employer/Performance';
import Recruitment from './pages/employer/Recruitment';
import JobsList from './pages/employer/JobsList';
import PostJob from './pages/employer/PostJob';
import Training from './pages/employer/Training';
import Assets from './pages/employer/Assets';
import AssetTypes from './pages/employer/AssetTypes';
import ItemRequests from './pages/employer/ItemRequests';
import Expenses from './pages/employer/Expenses';
import Reports from './pages/employer/Reports';
import Settings from './pages/employer/Settings';
import OrgChart from './pages/employer/OrgChart';
import CompanyPolicy from './pages/employer/CompanyPolicy';
import Award from './pages/employer/Award';
import Onboarding from './pages/employer/Onboarding';
import OfferLetter from './pages/employer/onboarding/OfferLetter';
import ContactLetter from './pages/employer/onboarding/ContactLetter';
import WarningLetter from './pages/employer/onboarding/WarningLetter';
import ComplaintLetter from './pages/employer/onboarding/ComplaintLetter';
import Offboarding from './pages/employer/Offboarding';
import ResignationAcceptanceLetter from './pages/employer/offboarding/ResignationAcceptanceLetter';
import ExperienceLetter from './pages/employer/offboarding/ExperienceLetter';
import RelievingLetter from './pages/employer/offboarding/RelievingLetter';
import FNFSettlement from './pages/employer/offboarding/FNFSettlement';
import NoDues from './pages/employer/offboarding/NoDues';
import ExitInterview from './pages/employer/offboarding/ExitInterview';
import NDAReminder from './pages/employer/offboarding/NDAReminder';
import NoticeBoard from './pages/NoticeBoard';
import ProjectManagement from './pages/employer/ProjectManagement';
import Marketing from './pages/employer/Marketing';
import RewardPoints from './pages/employer/RewardPoints';
import Message from './pages/employer/Message';
import SupplyChain from './pages/employer/SupplyChain';
import Procurement from './pages/employer/Procurement';
import Accounting from './pages/employer/Accounting';
import CRM from './pages/employer/CRM';
import PurchaseDep from './pages/employer/PurchaseDep';
import EmployerPermissions from './pages/EmployerPermissions';
import CompanyAdminLogin from './pages/CompanyAdminLogin';
import CompanyAdminDashboard from './pages/CompanyAdminDashboard';
import CompanyAdminLayout from './components/CompanyAdminLayout';
import CompanyAdminAttendance from './pages/CompanyAdminAttendance';
import CompanyAdminDepartment from './pages/CompanyAdminDepartment';
import CompanyAdminDesignation from './pages/CompanyAdminDesignation';
import CompanyAdminEmployee from './pages/CompanyAdminEmployee';
import CompanyAdminAward from './pages/CompanyAdminAward';
import AdminMonitoringDashboard from './pages/AdminMonitoringDashboard';
import MonitoringReports from './pages/MonitoringReports';
import EmployeeMonitoringReport from './pages/EmployeeMonitoringReport';
import EmployeeLayout from './components/EmployeeLayout';
import EmployeeAttendance from './pages/EmployeeAttendance';
import EmployeeLeaves from './pages/EmployeeLeaves';
import EmployeePayroll from './pages/EmployeePayroll';
import EmployeeLogin from './pages/EmployeeLogin';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeAssetPage from './pages/employee/EmployeeAssetPage';
import EmployeeItemRequest from './pages/EmployeeItemRequest';
import EmployeeMonitoring from './pages/employee/EmployeeMonitoring';
import GuestJoin from './pages/GuestJoin';
import GlobalAIAssistant from './components/GlobalAIAssistant';

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
      <div className="relative">
        <GlobalAIAssistant />
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
        <Route path="/super-admin/employer/monitoring" element={<AdminMonitoringDashboard />} />
        <Route path="/super-admin/employer/monitoring/reports" element={<MonitoringReports />} />
        <Route path="/super-admin/employer/monitoring/reports/:employeeId" element={<EmployeeMonitoringReport />} />
        <Route path="/super-admin/employer/org-chart/chart" element={<OrgChart />} />
        <Route path="/super-admin/employer/org-chart/policy" element={<CompanyPolicy />} />
        <Route path="/super-admin/employer/department" element={<Department />} />
        <Route path="/super-admin/employer/designation" element={<Designation />} />
        <Route path="/super-admin/employer/employee" element={<Employee />} />
        <Route path="/super-admin/employer/attendance" element={<Attendance />} />
        <Route path="/super-admin/employer/award" element={<Award />} />
        <Route path="/super-admin/employer/leaves" element={<Leave />} />
        <Route path="/super-admin/employer/payroll" element={<Payroll />} />
        <Route path="/super-admin/employer/payroll/company-payroll" element={<CompanyPayroll />} />
        <Route path="/super-admin/employer/payroll/salary-advance" element={<SalaryAdvance />} />
        <Route path="/super-admin/employer/payroll/salary-generate" element={<SalaryGenerate />} />
        <Route path="/super-admin/employer/payroll/manage-salary" element={<ManageEmployeeSalary />} />
        <Route path="/super-admin/employer/payroll/payslip/:id" element={<SalarySlip />} />
        <Route path="/super-admin/employer/payroll/posting-sheet/:id" element={<PayrollPostingSheet />} />
        <Route path="/super-admin/employer/payroll/salary-chart/:id" element={<EmployeeSalaryChart />} />
        <Route path="/super-admin/employer/payroll/sales-tax" element={<Payroll />} />
        <Route path="/super-admin/employer/shifts" element={<Shifts />} />
        <Route path="/super-admin/employer/performance" element={<Performance />} />
        <Route path="/super-admin/employer/recruitment" element={<Recruitment />} />
        <Route path="/super-admin/employer/recruitment/jobs-list" element={<JobsList />} />
        <Route path="/super-admin/employer/recruitment/job-posting" element={<PostJob />} />
        <Route path="/super-admin/employer/recruitment/view-posted-jobs" element={<Recruitment />} />
        <Route path="/super-admin/employer/recruitment/search-candidates" element={<Recruitment />} />
        <Route path="/super-admin/employer/recruitment/bulk-cv-upload" element={<Recruitment />} />
        <Route path="/super-admin/employer/recruitment/offer-letters" element={<Recruitment />} />
        <Route path="/super-admin/employer/recruitment/agreements" element={<Recruitment />} />
        <Route path="/super-admin/employer/recruitment/career-page" element={<Recruitment />} />
        <Route path="/super-admin/employer/recruitment/view-live-page" element={<Recruitment />} />
        <Route path="/super-admin/employer/onboarding" element={<Onboarding />} />
        <Route path="/super-admin/employer/onboarding/offer-letter" element={<OfferLetter />} />
        <Route path="/super-admin/employer/onboarding/contact-letter" element={<ContactLetter />} />
        <Route path="/super-admin/employer/onboarding/warning-letter" element={<WarningLetter />} />
        <Route path="/super-admin/employer/onboarding/complaint-letter" element={<ComplaintLetter />} />
        <Route path="/super-admin/employer/offboarding" element={<Offboarding />} />
        <Route path="/super-admin/employer/offboarding/resignation-acceptance" element={<ResignationAcceptanceLetter />} />
        <Route path="/super-admin/employer/offboarding/experience-letter" element={<ExperienceLetter />} />
        <Route path="/super-admin/employer/offboarding/relieving-letter" element={<RelievingLetter />} />
        <Route path="/super-admin/employer/offboarding/fnf-settlement" element={<FNFSettlement />} />
        <Route path="/super-admin/employer/offboarding/no-dues" element={<NoDues />} />
        <Route path="/super-admin/employer/offboarding/exit-interview" element={<ExitInterview />} />
        <Route path="/super-admin/employer/offboarding/nda-reminder" element={<NDAReminder />} />
        <Route path="/super-admin/employer/training" element={<Training />} />
        <Route path="/super-admin/employer/assets" element={<Assets />} />
        <Route path="/super-admin/employer/assets/types" element={<AssetTypes />} />
        <Route path="/super-admin/employer/assets/requests" element={<ItemRequests />} />
        <Route path="/super-admin/employer/expenses" element={<Expenses />} />
        <Route path="/super-admin/employer/notice-board" element={<NoticeBoard />} />
        <Route path="/super-admin/employer/projects" element={<ProjectManagement />} />
        <Route path="/super-admin/employer/projects/list" element={<ProjectManagement />} />
        <Route path="/super-admin/employer/projects/my-tasks" element={<ProjectManagement />} />
        <Route path="/super-admin/employer/projects/workspace-tasks" element={<ProjectManagement />} />
        <Route path="/super-admin/employer/projects/milestones" element={<ProjectManagement />} />
        <Route path="/super-admin/employer/projects/bidder-details" element={<ProjectManagement />} />
        <Route path="/super-admin/employer/projects/reports" element={<ProjectManagement />} />
        <Route path="/super-admin/employer/marketing" element={<Marketing />} />
        <Route path="/super-admin/employer/reports" element={<Reports />} />
        <Route path="/super-admin/employer/rewards" element={<RewardPoints />} />
        <Route path="/super-admin/employer/message" element={<Message />} />
        <Route path="/super-admin/employer/supply-chain" element={<SupplyChain />} />
        <Route path="/super-admin/employer/procurement" element={<Procurement />} />
        <Route path="/super-admin/employer/accounting" element={<Accounting />} />
        <Route path="/super-admin/employer/crm" element={<CRM />} />
        <Route path="/super-admin/employer/purchase" element={<PurchaseDep />} />
        <Route path="/super-admin/employer/settings/*" element={<Settings />} />
        <Route path="/company-admin" element={<CompanyAdminLogin />} />
        <Route path="/company-admin" element={<CompanyAdminLayout />}>
          <Route path="dashboard" element={<CompanyAdminDashboard />} />
          <Route path="attendance" element={<CompanyAdminAttendance />} />
          <Route path="department" element={<CompanyAdminDepartment />} />
          <Route path="designation" element={<CompanyAdminDesignation />} />
          <Route path="employee" element={<CompanyAdminEmployee />} />
          <Route path="monitoring" element={<AdminMonitoringDashboard />} />
          <Route path="monitoring/reports" element={<MonitoringReports />} />
          <Route path="monitoring/reports/:employeeId" element={<EmployeeMonitoringReport />} />
          <Route path="award" element={<CompanyAdminAward />} />
          <Route path="leaves" element={<Leave />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="payroll/company-payroll" element={<CompanyPayroll />} />
          <Route path="payroll/salary-advance" element={<SalaryAdvance />} />
          <Route path="payroll/salary-generate" element={<SalaryGenerate />} />
          <Route path="payroll/manage-salary" element={<ManageEmployeeSalary />} />
          <Route path="payroll/payslip/:id" element={<SalarySlip />} />
          <Route path="payroll/posting-sheet/:id" element={<PayrollPostingSheet />} />
          <Route path="payroll/salary-chart/:id" element={<EmployeeSalaryChart />} />
          <Route path="payroll/sales-tax" element={<Payroll />} />
          <Route path="shifts" element={<Shifts />} />
          <Route path="performance" element={<Performance />} />
          <Route path="recruitment" element={<Recruitment />} />
          <Route path="recruitment/jobs-list" element={<JobsList />} />
          <Route path="recruitment/job-posting" element={<PostJob />} />
          <Route path="recruitment/view-posted-jobs" element={<Recruitment />} />
          <Route path="recruitment/search-candidates" element={<Recruitment />} />
          <Route path="recruitment/bulk-cv-upload" element={<Recruitment />} />
          <Route path="recruitment/offer-letters" element={<Recruitment />} />
          <Route path="recruitment/agreements" element={<Recruitment />} />
          <Route path="recruitment/career-page" element={<Recruitment />} />
          <Route path="recruitment/view-live-page" element={<Recruitment />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="onboarding/offer-letter" element={<OfferLetter />} />
          <Route path="onboarding/contact-letter" element={<ContactLetter />} />
          <Route path="onboarding/warning-letter" element={<WarningLetter />} />
          <Route path="onboarding/complaint-letter" element={<ComplaintLetter />} />
          <Route path="offboarding" element={<Offboarding />} />
          <Route path="offboarding/resignation-acceptance" element={<ResignationAcceptanceLetter />} />
          <Route path="offboarding/experience-letter" element={<ExperienceLetter />} />
          <Route path="offboarding/relieving-letter" element={<RelievingLetter />} />
          <Route path="offboarding/fnf-settlement" element={<FNFSettlement />} />
          <Route path="offboarding/no-dues" element={<NoDues />} />
          <Route path="offboarding/exit-interview" element={<ExitInterview />} />
          <Route path="offboarding/nda-reminder" element={<NDAReminder />} />
          <Route path="training" element={<Training />} />
          <Route path="assets" element={<Assets />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="notice-board" element={<NoticeBoard />} />
          <Route path="projects" element={<ProjectManagement />} />
          <Route path="projects/list" element={<ProjectManagement />} />
          <Route path="projects/my-tasks" element={<ProjectManagement />} />
          <Route path="projects/workspace-tasks" element={<ProjectManagement />} />
          <Route path="projects/milestones" element={<ProjectManagement />} />
          <Route path="projects/bidder-details" element={<ProjectManagement />} />
          <Route path="projects/reports" element={<ProjectManagement />} />
          <Route path="marketing" element={<Marketing />} />
          <Route path="reports" element={<Reports />} />
          <Route path="rewards" element={<RewardPoints />} />
          <Route path="message" element={<Message />} />
          <Route path="supply-chain" element={<SupplyChain />} />
          <Route path="procurement" element={<Procurement />} />
          <Route path="accounting" element={<Accounting />} />
          <Route path="crm" element={<CRM />} />
          <Route path="purchase" element={<PurchaseDep />} />
          <Route path="org-chart/chart" element={<OrgChart />} />
          <Route path="org-chart/policy" element={<CompanyPolicy />} />
          <Route path="settings/*" element={<Settings />} />
          {/* Add more routes here as needed */}
        </Route>
        <Route path="/employee/login" element={<EmployeeLogin />} />
        <Route path="/guest/join/:token" element={<GuestJoin />} />
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="attendance" element={<EmployeeAttendance />} />
          <Route path="notice-board" element={<NoticeBoard isAdmin={false} />} />
          <Route path="leaves" element={<EmployeeLeaves />} />
          <Route path="payroll" element={<EmployeePayroll />} />
          <Route path="monitoring" element={<EmployeeMonitoring />} />
          <Route path="assets" element={<EmployeeAssetPage />} />
          <Route path="assets/request" element={<EmployeeItemRequest />} />
          <Route path="message" element={<Message />} />
        </Route>
      </Routes>
      </div>
    </Router>
  )
}

export default App
