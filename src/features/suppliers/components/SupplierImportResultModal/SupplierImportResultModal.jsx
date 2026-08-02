import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { Button } from "../../../../components/ui/Button/Button";
import { Modal } from "../../../../components/ui/Modal/Modal";

import "./SupplierImportResultModal.scss";

const SupplierImportResultModal = ({ result, onClose }) => (
  <Modal
    open={!!result}
    title="Import natijasi"
    onClose={onClose}
    footer={
      <Button variant="primary" onClick={onClose}>
        Tushunarli
      </Button>
    }
  >
    {result && (
      <div className="supplier-import-result">
        <div className="supplier-import-result__summary">
          <span>
            <CheckCircle2 size={18} />
            Yaratildi: <strong>{result.created}</strong>
          </span>
          <span>
            <AlertTriangle size={18} />
            O'tkazildi: <strong>{result.skipped}</strong>
          </span>
        </div>
        {!!result.errors?.length && (
          <div className="supplier-import-result__errors">
            {result.errors.slice(0, 12).map((error) => (
              <p key={error}>{error}</p>
            ))}
            {result.errors.length > 12 && (
              <small>Yana {result.errors.length - 12} ta xato bor.</small>
            )}
          </div>
        )}
      </div>
    )}
  </Modal>
);

export default SupplierImportResultModal;

