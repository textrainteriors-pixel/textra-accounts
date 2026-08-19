import { X, FileDown, Download } from "lucide-react";
import type { Account } from "../types";
import { generateMonthlyPDF } from "../generateMonthlyPDF";

export default function ReportModal({
  accounts,
  reportMonth,
  reportYear,
  onSetMonth,
  onSetYear,
  onClose,
}: {
  accounts: Account[];
  reportMonth: number;
  reportYear: number;
  onSetMonth: (m: number) => void;
  onSetYear: (fn: (y: number) => number) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-primary">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
              <FileDown size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Monthly Report</h3>
              <p className="text-xs text-white/60">Download as PDF</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Select Month</label>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <button
                  key={m}
                  onClick={() => onSetMonth(m)}
                  className={`py-2 rounded-lg text-xs font-semibold transition-all border ${reportMonth === m
                    ? "bg-primary text-white border-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                >
                  {new Date(2000, m - 1, 1).toLocaleString("en-IN", { month: "short" })}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Select Year</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onSetYear(y => y - 1)}
                className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all text-lg font-bold"
              >‹</button>
              <div className="flex-1 text-center font-mono font-bold text-xl text-foreground">{reportYear}</div>
              <button
                onClick={() => onSetYear(y => y + 1)}
                className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all text-lg font-bold"
              >›</button>
            </div>
          </div>

          {/* Preview summary */}
          <div className="bg-secondary rounded-xl p-4 space-y-1.5">
            <div className="text-xs font-semibold text-muted-foreground mb-2">Report will include</div>
            <div className="flex items-center gap-2 text-xs text-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              Account summary table (all {accounts.length} accounts)
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              Transaction detail per account
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              Opening & closing balances
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              Credit / Debit totals
            </div>
          </div>

          <div className="text-center py-1">
            <div className="text-sm font-semibold text-foreground">
              {new Date(reportYear, reportMonth - 1, 1).toLocaleString("en-IN", { month: "long", year: "numeric" })}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {accounts.reduce((s, a) => s + a.transactions.filter((tx: any) => {
                const d = new Date(tx.date);
                return d.getMonth() + 1 === reportMonth && d.getFullYear() === reportYear;
              }).length, 0)} transactions across all accounts
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              generateMonthlyPDF(accounts, reportMonth, reportYear);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Download size={15} />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
