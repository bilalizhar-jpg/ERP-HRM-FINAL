import { Mic, FileText, ShieldCheck, BarChart3 } from 'lucide-react';

export default function MedicalTranscriptionModule() {
  return (
    <section className="py-24 bg-blue-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wide mb-2">Medical Transcription Module</h2>
            <p className="text-4xl font-extrabold tracking-tight mb-6">HIPAA-Compliant Medical Transcription Built Into Your ERP</p>
            <p className="text-xl text-slate-300 mb-8">A purpose-built module for healthcare providers. Manage medical transcription workflows, ensure regulatory compliance, and gain visibility into transcription productivity — all within your ERP.</p>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-emerald-900/20">
              Explore Medical Module →
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: Mic, title: 'Audio Upload & Processing', description: 'Securely upload medical audio files in multiple formats. Automated transcription powered by AI with high accuracy rates.' },
              { icon: FileText, title: 'Task Assignment', description: 'Assign transcription tasks to certified medical transcriptionists with workload balancing and priority queuing.' },
              { icon: ShieldCheck, title: 'HIPAA Compliance', description: 'End-to-end encryption, audit trails, and access controls ensure full HIPAA compliance for all medical data.' },
              { icon: BarChart3, title: 'Productivity Tracking', description: 'Monitor transcriptionist performance, turnaround times, accuracy metrics, and workload distribution in real time.' },
            ].map((item, index) => (
              <div key={index} className="p-6 bg-blue-900 rounded-xl border border-blue-800">
                <item.icon className="w-8 h-8 text-emerald-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
