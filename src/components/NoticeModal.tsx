import { useState } from 'react';
import { X } from 'lucide-react';

interface Notice {
  notice_type: string;
  description: string;
  notice_date: string;
  notice_by: string;
  attachment_url: string;
}

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notice: Notice) => void;
}

export default function NoticeModal({ isOpen, onClose, onSave }: NoticeModalProps) {
  const [noticeType, setNoticeType] = useState('');
  const [description, setDescription] = useState('');
  const [noticeDate, setNoticeDate] = useState('');
  const [noticeBy, setNoticeBy] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSave({
      notice_type: noticeType,
      description,
      notice_date: noticeDate,
      notice_by: noticeBy,
      attachment_url: attachmentUrl
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-slate-900">New notice</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Notice type *</label>
            <input 
              type="text" 
              value={noticeType}
              onChange={(e) => setNoticeType(e.target.value)}
              className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="Notice type"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Notice description *</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none h-32"
              placeholder="Notice description"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Notice date *</label>
            <input 
              type="date" 
              value={noticeDate}
              onChange={(e) => setNoticeDate(e.target.value)}
              className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Notice attachment</label>
            <input 
              type="text" 
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="Attachment URL"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Notice by *</label>
            <input 
              type="text" 
              value={noticeBy}
              onChange={(e) => setNoticeBy(e.target.value)}
              className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="Admin"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button onClick={onClose} className="px-6 py-3 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-colors">
            Close
          </button>
          <button onClick={handleSubmit} className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
