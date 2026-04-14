import './ConfirmModal.css';

type ConfirmModalProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({ title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger = false, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="confirm-modal-overlay" id="confirm-modal" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="confirm-modal__title">{title}</h3>
        <p className="confirm-modal__message">{message}</p>
        <div className="confirm-modal__actions">
          <button className="confirm-modal__btn confirm-modal__btn--cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={`confirm-modal__btn ${danger ? 'confirm-modal__btn--danger' : 'confirm-modal__btn--confirm'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
