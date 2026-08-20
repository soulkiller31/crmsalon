import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} bg-dark-900 border border-dark-700 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200`}>
        <div className="flex items-center justify-between p-5 border-b border-dark-700">
          <h2 className="text-lg font-semibold text-dark-50">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-dark-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
