import { useEffect } from "react";
import { X, AlertCircle } from "lucide-react";

const ErrorToast = ({ error, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (error && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [error, onClose, duration]);

  if (!error) return null;

  return (
    <div className="fixed top-5 right-5 z-50 animate-fade-in slide-in-from-top">
      <div className="bg-white/90 backdrop-blur-md border border-red-200 rounded-xl shadow-lg p-4 w-[95vw] max-w-md sm:max-w-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0 animate-pulse" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-600 transition-colors mt-0.5"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorToast;
