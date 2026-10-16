import React from 'react';
import { useShop } from '../context/ShopContext';
import { Check, Info, AlertCircle } from 'lucide-react';

export const ToastNotification = () => {
  const { toast } = useShop();

  if (!toast.show) return null;

  let icon = <Check className="w-4 h-4 text-emerald-400" />;
  if (toast.type === 'error') icon = <AlertCircle className="w-4 h-4 text-red-400" />;
  if (toast.type === 'info') icon = <Info className="w-4 h-4 text-sky-400" />;

  return (
    <div className="fixed top-20 right-5 z-50 bg-black text-white text-xs font-semibold py-3 px-4 shadow-2xl border border-neutral-700 flex items-center space-x-2.5 animate-bounce-short">
      {icon}
      <span>{toast.message}</span>
    </div>
  );
};
