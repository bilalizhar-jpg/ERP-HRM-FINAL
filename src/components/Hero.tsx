import { useState } from 'react';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function Hero() {
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
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight"
        >
          The All-in-One <span className="text-blue-600">HRM & ERP</span> Platform
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto"
        >
          Streamline your workforce management, automate complex business workflows, and gain real-time insights with multifunctionalHRM-ERP.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4 justify-center"
        >
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-blue-200"
          >
            Request Demo
          </button>
          <button className="bg-white hover:bg-slate-100 text-slate-900 px-8 py-4 rounded-xl font-semibold text-lg transition-all border border-slate-200">
            Learn More
          </button>
        </motion.div>
      </div>

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
    </section>
  );
}
