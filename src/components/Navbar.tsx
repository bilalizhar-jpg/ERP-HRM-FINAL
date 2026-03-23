import { useState } from 'react';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function Navbar() {
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async () => {
    await fetch('/api/request-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, date: startDate }),
    });
    setShowModal(false);
  };

  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tighter">
              <Link to="/">multifunctional<span className="text-blue-600">HRM-ERP</span></Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => setShowModal(true)} className="text-slate-600 hover:text-blue-600 font-medium">Features</button>
              <button onClick={() => setShowModal(true)} className="text-slate-600 hover:text-blue-600 font-medium">Modules</button>
              <button onClick={() => setShowModal(true)} className="text-slate-600 hover:text-blue-600 font-medium">Industries</button>
              <Link to="/contact-us" className="text-slate-600 hover:text-blue-600 font-medium">Contact</Link>
              <div className="flex items-center space-x-2 text-slate-400">
                <Link to="/super-admin" className="text-slate-600 hover:text-blue-600 font-medium">Super Admin</Link>
                <span>|</span>
                <a href="/login/admin-employer" className="text-slate-600 hover:text-blue-600 font-medium">Admin Employer</a>
                <span>|</span>
                <a href="/login/employee" className="text-slate-600 hover:text-blue-600 font-medium">Employee</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all">
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </nav>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-2xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Schedule a Demo</h2>
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 mb-4 border rounded-xl" />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 mb-4 border rounded-xl" />
            <DatePicker selected={startDate} onChange={(date: Date | null) => date && setStartDate(date)} showTimeSelect className="w-full p-3 mb-4 border rounded-xl" />
            <div className="flex gap-4">
              <button onClick={handleSubmit} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold">Submit</button>
              <button onClick={() => setShowModal(false)} className="bg-slate-200 text-slate-900 px-6 py-3 rounded-xl font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
