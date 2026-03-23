import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ContactUs() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // This is a placeholder for actual email sending logic.
    // In a real app, this would call a backend API that uses a service like SendGrid, Mailgun, etc.
    alert('Thank you for your message! We will get back to you at info@inforesumeedge.com soon.');
    console.log('Sending email to info@inforesumeedge.com:', formData);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input type="text" required className="w-full p-3 border rounded-xl" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input type="email" required className="w-full p-3 border rounded-xl" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Message</label>
            <textarea required className="w-full p-3 border rounded-xl h-32" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700">Submit</button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
