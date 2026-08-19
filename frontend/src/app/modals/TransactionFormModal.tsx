import { useRef } from "react";
import {
  X, TrendingUp, TrendingDown, Upload,
  FileText, Image,
} from "lucide-react";
import type { Account, TransactionType, AttachedDoc } from "../types";

interface TransactionForm {
  date: string;
  description: string;
  type: TransactionType;
  amount: string;
  reference: string;
  document: AttachedDoc | null;
}

export default function TransactionFormModal({
  modalAccount,
  editingTxId,
  form,
  onSetForm,
  onSubmit,
  onClose,
}: {
  modalAccount: Account;
  editingTxId: string | null;
  form: TransactionForm;
  onSetForm: (fn: (f: TransactionForm) => TransactionForm) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onSetForm(f => ({
        ...f,
        document: {
          name: file.name,
          dataUrl: reader.result as string,
          mimeType: file.type,
          size: file.size,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border" style={{ backgroundColor: modalAccount.bgColor }}>
          <div>
            <h3 className="font-bold text-base" style={{ color: modalAccount.color }}>{editingTxId ? "Edit Entry" : "New Entry"}</h3>
            <p className="text-xs mt-0.5" style={{ color: modalAccount.color, opacity: 0.7 }}>{modalAccount.name}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Transaction Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSetForm(f => ({ ...f, type: "credit" }))}
                className={`py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border-2 transition-all ${form.type === "credit" ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "border-border text-muted-foreground hover:border-emerald-200"
                  }`}
              >
                <TrendingUp size={15} /> Credit
              </button>
              <button
                onClick={() => onSetForm(f => ({ ...f, type: "debit" }))}
                className={`py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border-2 transition-all ${form.type === "debit" ? "bg-red-50 border-red-500 text-red-600" : "border-border text-muted-foreground hover:border-red-200"
                  }`}
              >
                <TrendingDown size={15} /> Debit
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={e => onSetForm(f => ({ ...f, date: e.target.value }))}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 bg-input-background"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={e => onSetForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Transaction description..."
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 bg-input-background"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
              <input
                type="number"
                value={form.amount}
                onChange={e => onSetForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full border border-border rounded-lg pl-7 pr-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/30 bg-input-background"
              />
            </div>
          </div>

          {modalAccount.type === "company" ? (
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
                Project <span className="font-normal text-muted-foreground/60">(optional)</span>
              </label>
              <select
                value={form.reference}
                onChange={e => onSetForm(f => ({ ...f, reference: e.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 bg-input-background"
              >
                <option value="">Select Project</option>
                {(modalAccount.projects || []).map((proj: string) => (
                  <option key={proj} value={proj}>{proj}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
                Reference No. <span className="font-normal text-muted-foreground/60">(optional)</span>
              </label>
              <input
                type="text"
                value={form.reference}
                onChange={e => onSetForm(f => ({ ...f, reference: e.target.value }))}
                placeholder="INV-001, PO-012..."
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 bg-input-background"
              />
            </div>
          )}

          {/* Document Upload */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
              Attach Document <span className="font-normal text-muted-foreground/60">(optional)</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileSelect}
              className="hidden"
            />
            {form.document ? (
              <div className="flex items-center gap-3 border border-border rounded-lg px-3 py-2.5 bg-input-background">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  {form.document.mimeType?.startsWith("image/")
                    ? <Image size={15} className="text-blue-500" />
                    : <FileText size={15} className="text-blue-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground truncate">{form.document.name}</div>
                  <div className="text-[10px] text-muted-foreground">{(form.document.size / 1024).toFixed(1)} KB</div>
                </div>
                <button
                  onClick={() => onSetForm(f => ({ ...f, document: null }))}
                  className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-lg px-3 py-4 flex flex-col items-center gap-1.5 text-muted-foreground hover:border-accent hover:text-accent transition-colors"
              >
                <Upload size={18} />
                <span className="text-xs font-medium">Click to upload</span>
                <span className="text-[10px]">PDF, Image, Word, Excel supported</span>
              </button>
            )}
          </div>

          {form.amount && (
            <div className={`rounded-lg px-4 py-3 text-sm flex items-center justify-between ${form.type === "credit" ? "bg-emerald-50" : "bg-red-50"}`}>
              <span className={form.type === "credit" ? "text-emerald-700" : "text-red-600"}>
                {editingTxId ? (form.type === "credit" ? "Updating Credit" : "Updating Debit") : (form.type === "credit" ? "Adding Credit" : "Adding Debit")}
              </span>
              <span className={`font-mono font-bold ${form.type === "credit" ? "text-emerald-700" : "text-red-600"}`}>
                {form.type === "credit" ? "+" : "-"}₹{parseFloat(form.amount || "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!form.description || !form.amount}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: modalAccount.color }}
          >
            {editingTxId ? "Update Entry" : "Save Entry"}
          </button>
        </div>
      </div>
    </div>
  );
}
