import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export default function AlertBanner({ type = 'info', message, onClose }) {
  if (!message) return null;

  const styles = {
    error: 'bg-red-50 border-red-300 text-red-800',
    success: 'bg-blue-50 border-blue-300 text-blue-900',
    info: 'bg-slate-100 border-slate-300 text-slate-800'
  };

  const icons = {
    error: <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />,
    success: <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />,
    info: <Info className="w-4 h-4 text-slate-600 shrink-0" />
  };

  return (
    <div className={`border rounded px-3 py-2 text-xs flex items-center justify-between shadow-sm my-2 ${styles[type] || styles.info}`}>
      <div className="flex items-center gap-2">
        {icons[type]}
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
