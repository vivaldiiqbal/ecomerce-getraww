import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div 
        className="bg-white w-full max-w-md border border-neutral-200 shadow-2xl animate-fade-in relative flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button Top Right */}
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-neutral-400 hover:text-black transition-colors"
          aria-label="Tutup Konfirmasi"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 bg-red-100 p-3 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-black uppercase tracking-wider mb-2">
                {title}
              </h3>
              <p className="text-sm font-medium text-neutral-600 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-200 flex justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-black hover:bg-neutral-200 transition-colors bg-neutral-100"
          >
            Batal
          </button>
          <button 
            onClick={onConfirm}
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
};
