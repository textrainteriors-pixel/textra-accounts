import { X, Bell, Repeat } from "lucide-react";

export default function ReminderModal({
  reminderForm,
  onSetReminderForm,
  onSubmit,
  onClose,
}: {
  reminderForm: { text: string; date: string; repeatMonthly: boolean };
  onSetReminderForm: (form: { text: string; date: string; repeatMonthly: boolean }) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-border">
        {/* Modal header — matches app primary */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ backgroundColor: "#1e3a5f" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <Bell size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">Set a Reminder</h3>
              <p className="text-white/55 text-[11px] mt-0.5">It will appear on the dashboard on the selected date</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">What to remind?</label>
            <input
              type="text"
              value={reminderForm.text}
              onChange={e => onSetReminderForm({ ...reminderForm, text: e.target.value })}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 bg-input-background placeholder:text-muted-foreground/50"
              style={{ "--tw-ring-color": "#1e3a5f40" } as any}
              placeholder="e.g. Review monthly budget report…"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Remind me on</label>
            <input
              type="date"
              value={reminderForm.date}
              onChange={e => onSetReminderForm({ ...reminderForm, date: e.target.value })}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 bg-input-background"
              style={{ "--tw-ring-color": "#1e3a5f40" } as any}
            />
          </div>

          {/* Repeat Monthly Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Repeat size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Repeat Monthly</p>
                <p className="text-[11px] text-muted-foreground">Auto-schedules for the same day next month when completed</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={reminderForm.repeatMonthly}
              onChange={e => onSetReminderForm({ ...reminderForm, repeatMonthly: e.target.checked })}
              className="w-4 h-4 text-[#1e3a5f] rounded border-slate-300 focus:ring-[#1e3a5f] cursor-pointer"
            />
          </div>

          {/* Preview pill */}
          {reminderForm.text && reminderForm.date && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border" style={{ backgroundColor: "#e8edf5", borderColor: "#c8d5e8" }}>
              <Bell size={13} style={{ color: "#1e3a5f" }} className="flex-shrink-0 mt-0.5" />
              <p
                className="text-xs font-medium break-words flex-1 whitespace-normal"
                style={{ color: "#1e3a5f", wordBreak: "break-word", overflowWrap: "anywhere" }}
              >
                <span className="font-bold">"{reminderForm.text}"</span>{" "}
                on {new Date(reminderForm.date + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                {reminderForm.repeatMonthly && <span className="font-semibold text-indigo-700 ml-1">(Repeats Monthly)</span>}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!reminderForm.text.trim() || !reminderForm.date}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            style={{ backgroundColor: "#1e3a5f" }}
          >
            Save Reminder
          </button>
        </div>
      </div>
    </div>
  );
}
