import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-slate-700">
          <section>
            <h2 className="text-2xl font-semibold mb-2">Data Collection Policy</h2>
            <p>We collect information you provide directly to us, such as when you create an account, request a demo, or contact us. This may include your name, email address, and other contact details.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">Right to Use Data for Marketing</h2>
            <p>By providing your contact information, you consent to us using your data to send you marketing emails, updates, and promotional materials. You can opt-out at any time.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">No Refund Policy</h2>
            <p>All purchases are final. We do not offer refunds for any services or subscriptions.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">USA and Euro User Policy</h2>
            <p>We comply with applicable data protection regulations in the USA and the European Union, including GDPR where applicable.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">California User Policy</h2>
            <p>In accordance with the CCPA, California residents have specific rights regarding their personal information. Please contact us for more details.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">Google AdSense Policy</h2>
            <p>We may use Google AdSense to display ads. Google, as a third-party vendor, uses cookies to serve ads on our site. You can opt out of the use of the DART cookie by visiting the Google ad and content network privacy policy.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
