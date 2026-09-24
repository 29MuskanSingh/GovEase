import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', variant = 'danger', loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={
      <>
        <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button className={`btn btn-${variant}`} onClick={onConfirm} disabled={loading}>
          {loading ? <span className="loading-spinner" /> : confirmText}
        </button>
      </>
    }>
      <p style={{ color: 'var(--gray-700)', lineHeight: 1.6 }}>{message}</p>
    </Modal>
  );
}