import { Trash2 } from "lucide-react";
import type { ConfirmModalState } from "../types";

export default function ConfirmModal({
  modal,
  onCancel,
}: {
  modal: ConfirmModalState;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden border border-border p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <Trash2 size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">{modal.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Action is irreversible</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          {modal.message}
        </p>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg border border-border text-xs sm:text-sm font-semibold text-foreground hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={modal.onConfirm}
            className="flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-all cursor-pointer"
          >
            {modal.confirmText || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
