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
      </Routes>
    </Router>
  )
}

export default App
