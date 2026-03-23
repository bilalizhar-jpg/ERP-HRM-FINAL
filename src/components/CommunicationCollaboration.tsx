import { MessageSquare, Bell, Users, Paperclip, Send } from 'lucide-react';

export default function CommunicationCollaboration() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-4">
            <MessageSquare className="w-4 h-4" />
            Communication & Collaboration
          </div>
          <h2 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-6">Keep Your Team Connected & Aligned</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">Built-in communication tools mean you never have to leave your ERP to collaborate. Real-time messaging, notices, and team workspaces in one place.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Internal Messaging */}
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Internal Messaging</h3>
            <p className="text-slate-600 mb-6">Real-time chat, direct messages, group channels, and file sharing — all within your ERP. No third-party tools needed.</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {['Direct Messages', 'Group Channels', 'File Sharing', 'Message Search'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">{tag}</span>
              ))}
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-slate-900"># general</span>
                <span className="text-xs text-slate-500">24 members</span>
              </div>
              <div className="space-y-4 mb-4">
                <div className="text-sm">
                  <p className="font-semibold text-blue-600">Sarah K.</p>
                  <p className="text-slate-700">Q3 report is ready for review</p>
                  <p className="text-xs text-slate-400">10:14 AM</p>
                </div>
                <div className="bg-blue-600 text-white p-3 rounded-xl text-sm">
                  <p>Great! Sending it to the board now</p>
                  <p className="text-xs text-blue-200">10:16 AM</p>
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-blue-600">Mike R.</p>
                  <p className="text-slate-700">Payroll run scheduled for Friday</p>
                  <p className="text-xs text-slate-400">10:18 AM</p>
                </div>
              </div>
              <div className="flex items-center gap-2 border-t pt-3">
                <Paperclip className="w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Type a message..." className="flex-1 text-sm outline-none" />
                <Send className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Notice Board */}
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
              <Bell className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Notice Board</h3>
            <p className="text-slate-600 mb-6">Company-wide announcements, department notices, and policy updates with read receipts and scheduled publishing.</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {['Announcements', 'Department Notices', 'Read Receipts', 'Scheduled Posts'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">{tag}</span>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-amber-500 p-3 flex items-center gap-2 text-white font-semibold">
                <Bell className="w-4 h-4" /> Notice Board
              </div>
              <div className="p-4 space-y-4">
                {[
                  { title: 'Company Holiday - Dec 25', tag: 'All Staff' },
                  { title: 'System Maintenance Tonight', tag: 'IT' },
                  { title: 'New Benefits Policy Update', tag: 'HR' },
                ].map((notice, i) => (
                  <div key={i} className="border-b pb-3 last:border-0 last:pb-0">
                    <p className="text-sm font-medium text-slate-900">{notice.title}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">{notice.tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team Collaboration */}
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Team Collaboration</h3>
            <p className="text-slate-600 mb-6">Shared workspaces, collaborative documents, meeting scheduling, and video conferencing integration for seamless teamwork.</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {['Shared Workspaces', 'Meeting Scheduler', 'Video Calls', 'Task Comments'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">{tag}</span>
              ))}
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="bg-emerald-600 text-white p-3 rounded-xl mb-4 flex justify-between items-center">
                <span className="font-semibold">Q4 Planning - Active</span>
                <span className="text-xs bg-emerald-500 px-2 py-1 rounded">8 participants</span>
              </div>
              <div className="space-y-3">
                {['Design Sprint Review', 'Budget Allocation', 'Go-to-Market Plan'].map((task, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                    {task}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
