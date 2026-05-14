import { useToast } from '../../contexts/ToastContext';
import { IoClose, IoCheckmarkCircle, IoAlertCircle, IoWarning, IoInformationCircle } from 'react-icons/io5';

const ICONS = {
  success: <IoCheckmarkCircle />,
  error: <IoAlertCircle />,
  warning: <IoWarning />,
  info: <IoInformationCircle />,
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          <span className="toast-icon">{ICONS[toast.type]}</span>
          <div className="toast-content">
            <div className="toast-title">{toast.title}</div>
            <div className="toast-message">{toast.message}</div>
          </div>
          <button className="toast-close" onClick={() => removeToast(toast.id)}>
            <IoClose />
          </button>
          <div className="toast-progress" />
        </div>
      ))}
    </div>
  );
}
