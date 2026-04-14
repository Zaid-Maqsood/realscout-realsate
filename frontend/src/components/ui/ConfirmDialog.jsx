import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', loading }) {
  return (
    <Modal open={open} onClose={onClose} title=" " size="sm">
      <div className="flex flex-col items-center text-center py-2">
        <div className="w-14 h-14 rounded-full bg-danger/10 flex items-center justify-center mb-4">
          <AlertTriangle size={24} className="text-danger" />
        </div>
        <h3 className="font-heading text-lg font-semibold text-text mb-2">{title}</h3>
        <p className="text-sm text-text-muted mb-6">{message}</p>
        <div className="flex gap-3 w-full">
          <button onClick={onClose} className="btn-outline flex-1 justify-center">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="btn-danger flex-1 justify-center">
            {loading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
