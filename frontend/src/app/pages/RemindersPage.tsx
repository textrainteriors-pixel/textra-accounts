import { useState } from "react";
import {
  Plus, Trash2, Bell, CalendarDays, Clock, Check, Repeat
} from "lucide-react";

export default function RemindersPage({
  reminders,
  onAdd,
  onDelete,
  onToggleComplete,
  onToggleRepeatMonthly,
}: {
  reminders: any[];
  onAdd: (presetMonthly?: boolean) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onToggleRepeatMonthly: (id: string, currentRepeat: boolean) => void;
}) {
  const [subTab, setSubTab] = useState<"all" | "monthly" | "today" | "upcoming" | "history">("all");
  const todayStr = new Date().toISOString().split("T")[0];

  const todayList = reminders
    .filter(r => r.date === todayStr && !r.completed)
    .sort((a, b) => a.date.localeCompare(b.date));

  const upcomingList = reminders
    .filter(r => r.date > todayStr && !r.completed && !r.repeatMonthly)
    .sort((a, b) => a.date.localeCompare(b.date));

  const monthlyList = reminders
    .filter(r => r.repeatMonthly && !r.completed)
    .sort((a, b) => a.date.localeCompare(b.date));

  const pastList = reminders
    .filter(r => r.completed || (r.date < todayStr && !r.repeatMonthly))
    .sort((a, b) => b.date.localeCompare(a.date));

  const renderTable = (items: any[], defaultBadgeText?: string) => {
    if (items.length === 0) return null;

    return (
      <div className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100/90 border-b-2 border-slate-300 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-3 px-4 border-r border-slate-200">Task / Description</th>
                <th className="py-3 px-4 border-r border-slate-200">Scheduled Date</th>
                <th className="py-3 px-4 border-r border-slate-200">Repeat Option</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map(r => {
                const isToday = r.date === todayStr;
                const d = new Date(r.date + "T00:00:00");
                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    {/* Task Description & Badges */}
                    <td className="py-3.5 px-4 font-medium text-slate-900 border-r border-slate-200">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-sm font-bold text-slate-900 break-words">{r.text}</span>
                        {isToday ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700 border border-blue-200">
                            Today
                          </span>
                        ) : defaultBadgeText && defaultBadgeText !== "Monthly" ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {defaultBadgeText}
                          </span>
                        ) : !r.repeatMonthly ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Upcoming
                          </span>
                        ) : null}
                        {r.repeatMonthly && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                            <Repeat size={10} /> Monthly
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Scheduled Date */}
                    <td className="py-3.5 px-4 text-xs font-bold text-slate-700 whitespace-nowrap border-r border-slate-200">
                      {d.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
                    </td>

                    {/* Monthly Repeat Toggle */}
                    <td className="py-3.5 px-4 whitespace-nowrap border-r border-slate-200">
                      <button
                        onClick={() => onToggleRepeatMonthly(r.id, !!r.repeatMonthly)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                          r.repeatMonthly
                            ? "bg-indigo-100 text-indigo-900 border-indigo-300 hover:bg-indigo-200"
                            : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200 hover:text-slate-900"
                        }`}
                        title={r.repeatMonthly ? "Click to turn off monthly repeat" : "Click to enable monthly repeat"}
                      >
                        <Repeat size={12} className={r.repeatMonthly ? "text-indigo-700" : "opacity-70"} />
                        {r.repeatMonthly ? "Monthly Repeat: ON" : "Repeat Monthly?"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onToggleComplete(r.id, true)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-xs"
                        >
                          <Check size={13} /> Mark Done
                        </button>
                        <button
                          onClick={() => onDelete(r.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Reminder"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 w-full max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reminders</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Stay on top of all your financial tasks & monthly recurring bills</p>
        </div>
        <button
          onClick={() => onAdd(subTab === "monthly")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all shrink-0"
          style={{ backgroundColor: "#1e3a5f" }}
        >
          <Plus size={15} />
          New Reminder
        </button>
      </div>

      {/* ── Inside-Page Sub-Tabs Filter Bar ── */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto scrollbar-none">
        {[
          { id: "all", label: "All Reminders", count: reminders.filter(r => !r.completed).length, icon: Bell },
          { id: "monthly", label: "Monthly Reminders", count: monthlyList.length, icon: Repeat, color: "text-indigo-600" },
          { id: "today", label: "Due Today", count: todayList.length, icon: Bell, color: "text-blue-600" },
          { id: "upcoming", label: "Upcoming", count: upcomingList.length, icon: CalendarDays, color: "text-emerald-600" },
          { id: "history", label: "History", count: pastList.length, icon: Clock, color: "text-gray-500" },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-[#1e3a5f] text-white shadow-xs"
                  : "bg-white border border-border text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon size={14} className={isActive ? "text-white" : tab.color || "text-slate-500"} />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold font-mono ${
                isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {reminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-border rounded-xl shadow-sm">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-gray-50 text-slate-500">
            <Bell size={24} />
          </div>
          <h3 className="font-semibold text-foreground text-base">No reminders yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-5 max-w-xs">
            Set a reminder and it will appear on your dashboard on the scheduled date.
          </p>
          <button
            onClick={() => onAdd(false)}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white shadow-sm hover:opacity-90"
            style={{ backgroundColor: "#1e3a5f" }}
          >
            <Plus size={15} /> Create First Reminder
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Overview Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Active Reminders", value: reminders.filter((r: any) => !r.completed).length, color: "#1e3a5f" },
              { label: "Due Today", value: todayList.length, color: "#2563eb" },
              { label: "Upcoming One-Time", value: upcomingList.length, color: "#059669" },
              { label: "Monthly Recurring", value: monthlyList.length, color: "#4f46e5" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-border p-4 shadow-xs">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-extrabold mt-1 font-mono" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* ── Active Reminders Section (for All, Today, Upcoming, Monthly sub-tabs) ── */}
          {(subTab === "all" || subTab === "today" || subTab === "upcoming" || subTab === "monthly") && (
            <div className="grid grid-cols-1 gap-6 items-start">
              {/* ── UPCOMING REMINDERS (Shown for All, Today, Upcoming) ── */}
              {(subTab === "all" || subTab === "today" || subTab === "upcoming") && (
                <div className="space-y-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} className="text-emerald-600" />
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                        Upcoming Reminders
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 font-mono">
                        {todayList.length + upcomingList.length}
                      </span>
                    </div>
                    <button
                      onClick={() => onAdd(false)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                    >
                      <Plus size={13} /> New One-Time
                    </button>
                  </div>

                  {todayList.length === 0 && upcomingList.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-muted-foreground text-sm">
                      No upcoming one-time reminders scheduled.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Due Today subgroup */}
                      {(subTab === "all" || subTab === "today") && todayList.length > 0 && (
                        <div className="space-y-2.5">
                          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                            <Bell size={12} /> Due Today ({todayList.length})
                          </p>
                          {renderTable(todayList, "Today")}
                        </div>
                      )}

                      {/* Upcoming subgroup */}
                      {(subTab === "all" || subTab === "upcoming") && upcomingList.length > 0 && (
                        <div className="space-y-2.5">
                          {todayList.length > 0 && (
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                              Upcoming One-Time ({upcomingList.length})
                            </p>
                          )}
                          {renderTable(upcomingList, "Upcoming")}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── MONTHLY RECURRING REMINDERS (Shown only under Monthly Reminders tab) ── */}
              {subTab === "monthly" && (
                <div className="space-y-4 bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                  <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
                    <div className="flex items-center gap-2">
                      <Repeat size={16} className="text-indigo-600" />
                      <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-wider">
                        Monthly Reminders
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 font-mono">
                        {monthlyList.length}
                      </span>
                    </div>
                    <button
                      onClick={() => onAdd(true)}
                      className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
                    >
                      <Plus size={13} /> New Monthly
                    </button>
                  </div>

                  {monthlyList.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-muted-foreground text-sm">
                      No monthly recurring reminders set yet. Click "New Monthly" to add one.
                    </div>
                  ) : (
                    renderTable(monthlyList, "Monthly")
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── HISTORY SUB-TAB VIEW ── */}
          {subTab === "history" && (
            <div className="space-y-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-slate-600" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Completed History Log
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700 font-mono">
                    {pastList.length}
                  </span>
                </div>
              </div>

              {pastList.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-muted-foreground text-sm">
                  No completed reminder history recorded yet.
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-border divide-y divide-border overflow-hidden shadow-xs">
                  {pastList.map((r: any) => {
                    const d = new Date(r.date + "T00:00:00");
                    return (
                      <div key={r.id} className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Check size={13} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className="text-sm font-semibold text-slate-800 break-words leading-snug"
                              style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
                            >
                              {r.text}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                              <span>{d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                              {r.repeatMonthly && (
                                <span className="text-indigo-600 font-bold flex items-center gap-0.5">
                                  • <Repeat size={10} /> Monthly
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => onDelete(r.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                          title="Delete Reminder"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
