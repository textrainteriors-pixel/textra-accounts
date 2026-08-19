import {
  TrendingUp, TrendingDown, BarChart3, Building2,
  CreditCard, ChevronRight, Edit3,
  ArrowUpRight, ArrowDownRight, Wallet, Activity, Trash2, Bell, Check, Repeat
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import type { Account } from "../types";
import { calcBalance, calcTotalCredit, calcTotalDebit, fmtSign } from "../utils";

export default function Dashboard({
  accounts,
  reminders = [],
  onDeleteReminder,
  onToggleCompleteReminder,
  onNavigate,
  onEditTransaction,
  onDeleteTransaction,
}: {
  accounts: Account[];
  reminders?: any[];
  onDeleteReminder: (id: string) => void;
  onToggleCompleteReminder: (id: string, completed: boolean) => void;
  onNavigate: (id: string) => void;
  onEditTransaction: (tx: any, accountId: string) => void;
  onDeleteTransaction: (txId: string, accountId: string) => void;
}) {
  const totalOpening = accounts.reduce((s, a) => s + a.openingBalance, 0);
  const totalCredit = accounts.reduce((s, a) => s + calcTotalCredit(a), 0);
  const totalDebit = accounts.reduce((s, a) => s + calcTotalDebit(a), 0);
  const totalClosing = accounts.reduce((s, a) => s + calcBalance(a), 0);

  const barData = accounts.map(a => ({
    name: a.name,
    Credit: calcTotalCredit(a),
    Debit: calcTotalDebit(a),
    Balance: Math.max(0, calcBalance(a)),
  }));

  const pieData = accounts
    .filter(a => calcBalance(a) > 0)
    .map(a => ({ name: a.name, value: calcBalance(a), color: a.color }));

  const recentTxs = accounts
    .flatMap(a => a.transactions.map(tx => ({ ...tx, accountId: a.id, accountName: a.name, accountColor: a.color, accountBg: a.bgColor, accountType: a.type })))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  const kpis = [
    {
      label: "Opening Balance",
      value: fmtSign(totalOpening),
      icon: Wallet,
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
      border: "border-blue-100",
      valueColor: "text-blue-700",
    },
    {
      label: "Total Credits",
      value: `+${fmtSign(totalCredit)}`,
      icon: TrendingUp,
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      border: "border-emerald-100",
      valueColor: "text-emerald-700",
    },
    {
      label: "Total Debits",
      value: `-${fmtSign(totalDebit)}`,
      icon: TrendingDown,
      bg: "bg-red-50",
      iconColor: "text-red-500",
      border: "border-red-100",
      valueColor: "text-red-600",
    },
    {
      label: "Net Closing Balance",
      value: fmtSign(totalClosing),
      icon: Activity,
      bg: totalClosing >= 0 ? "bg-indigo-50" : "bg-red-50",
      iconColor: totalClosing >= 0 ? "text-indigo-600" : "text-red-500",
      border: totalClosing >= 0 ? "border-indigo-100" : "border-red-100",
      valueColor: totalClosing >= 0 ? "text-indigo-700" : "text-red-600",
    },
  ];

  const todayStr = new Date().toISOString().split("T")[0];
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const todayReminders = reminders.filter(r => r.date === todayStr && !r.completed);

  const upcoming5DaysReminders = reminders.filter(r => {
    if (r.completed) return false;
    const remDate = new Date(r.date + "T00:00:00");
    remDate.setHours(0, 0, 0, 0);
    const diffTime = remDate.getTime() - todayDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 5;
  }).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="p-6 space-y-6 w-full max-w-7xl mx-auto">
      {/* Page title */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Overview of all accounts — {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* 5-Day Upcoming Reminders Alert Notification */}
      {upcoming5DaysReminders.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4.5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Bell size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950">Upcoming Reminders Alert (Due in Next 5 Days)</h4>
                <p className="text-xs text-amber-800/80">You have tasks scheduled coming up within the next 5 days</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200/90 text-amber-900 font-mono">
              {upcoming5DaysReminders.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcoming5DaysReminders.map(r => {
              const d = new Date(r.date + "T00:00:00");
              d.setHours(0, 0, 0, 0);
              const diffTime = d.getTime() - todayDate.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const dayLabel = diffDays === 0 ? "Due Today!" : diffDays === 1 ? "Due Tomorrow" : `Due in ${diffDays} days`;

              return (
                <div key={r.id} className="bg-white rounded-xl border border-amber-200/70 p-3.5 flex flex-col justify-between gap-2.5 shadow-xs hover:border-amber-300 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      diffDays === 0 ? "bg-red-100 text-red-700" : diffDays <= 2 ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-800"
                    }`}>
                      {dayLabel}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {d.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 break-words leading-relaxed">{r.text}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-0.5">
                    {r.repeatMonthly ? (
                      <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                        <Repeat size={10} /> Monthly
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400">One-time</span>
                    )}
                    <button
                      onClick={() => onToggleCompleteReminder(r.id, true)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center gap-1 active:scale-95"
                    >
                      <Check size={12} /> Mark Done
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Today's Reminders */}
      {todayReminders.length > 0 && (
        <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
          {/* Header bar */}
          <div className="flex items-center justify-between px-5 py-3.5" style={{ backgroundColor: "#1e3a5f" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                <Bell size={14} className="text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">Today's Reminders</h4>
                <p className="text-[10px] text-white/60">Tasks scheduled for today</p>
              </div>
            </div>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold text-primary" style={{ backgroundColor: "#e8edf5" }}>
              {todayReminders.length}
            </span>
          </div>
          {/* Reminder list */}
          <div className="divide-y divide-border/60">
            {todayReminders.map((r, idx) => (
              <div
                key={r.id}
                className="flex items-start gap-3 px-5 py-3.5 hover:bg-secondary/60 transition-colors group"
              >
                {/* Index number */}
                <span
                  className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
                  style={{ backgroundColor: "#1e3a5f" }}
                >
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0 pr-2">
                  <p
                    className="text-sm font-medium text-foreground break-words whitespace-normal text-left"
                    style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
                  >
                    {r.text}
                  </p>
                  {r.repeatMonthly && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 mt-1">
                      <Repeat size={10} /> Monthly
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onToggleCompleteReminder(r.id, true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white transition-all flex-shrink-0 hover:bg-blue-700 active:scale-95 mt-0.5"
                  style={{ backgroundColor: "#2563eb" }}
                  title="Mark as Done"
                >
                  <Check size={12} />
                  Done
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className={`bg-white rounded-xl sm:rounded-2xl border ${kpi.border} p-3 sm:p-5 flex flex-col gap-2 sm:gap-3`}>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${kpi.bg} flex items-center justify-center`}>
              <kpi.icon size={16} className={`sm:hidden ${kpi.iconColor}`} />
              <kpi.icon size={18} className={`hidden sm:block ${kpi.iconColor}`} />
            </div>
            <div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">{kpi.label}</div>
              <div className={`text-sm sm:text-lg font-mono font-bold leading-tight truncate ${kpi.valueColor}`}>{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Bar Chart */}
        <div className="col-span-1 lg:col-span-3 bg-white rounded-2xl border border-border p-5">
          <h3 className="font-semibold text-sm text-foreground mb-4">Credit vs Debit vs Balance — by Account</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(val: number, name: string) => [`₹${val.toLocaleString("en-IN")}`, name]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
              />
              <Bar dataKey="Credit" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Debit" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Balance" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            {[{ color: "#10b981", label: "Credit" }, { color: "#ef4444", label: "Debit" }, { color: "#3b82f6", label: "Balance" }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
                <span className="text-xs text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl border border-border p-5">
          <h3 className="font-semibold text-sm text-foreground mb-2">Balance Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`₹${val.toLocaleString("en-IN")}`, "Balance"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No positive balances</div>
          )}
        </div>
      </div>

      {/* Account Cards + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Account Cards */}
        <div className="col-span-1 lg:col-span-2 space-y-3">
          <h3 className="font-semibold text-sm text-foreground">Account Summary</h3>
          {accounts.map(acc => {
            const closing = calcBalance(acc);
            const credit = calcTotalCredit(acc);
            const debit = calcTotalDebit(acc);
            const change = closing - acc.openingBalance;
            return (
              <button
                key={acc.id}
                onClick={() => onNavigate(acc.id)}
                className="w-full bg-white rounded-xl border border-border p-4 text-left hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: acc.bgColor }}>
                      {acc.type === "overdraft" ? (
                        <CreditCard size={14} style={{ color: acc.color }} />
                      ) : (
                        <Building2 size={14} style={{ color: acc.color }} />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">{acc.name}</div>
                      {acc.type === "overdraft" && (
                        <span className="text-[10px] text-red-500 font-medium">Overdraft</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-accent">View</span>
                    <ChevronRight size={12} className="text-accent" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-[10px] text-muted-foreground">Credit</div>
                    <div className="text-xs font-mono font-semibold text-emerald-600">+₹{(credit / 1000).toFixed(1)}k</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Debit</div>
                    <div className="text-xs font-mono font-semibold text-red-500">-₹{(debit / 1000).toFixed(1)}k</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Balance</div>
                    <div className={`text-xs font-mono font-bold ${closing < 0 ? "text-red-600" : "text-foreground"}`} style={{ color: closing < 0 ? undefined : acc.color }}>
                      {closing < 0 ? "-" : ""}₹{(Math.abs(closing) / 1000).toFixed(1)}k
                    </div>
                  </div>
                </div>
                {/* Mini progress bar */}
                <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                  {credit + debit > 0 && (
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(credit / (credit + debit)) * 100}%`, backgroundColor: acc.color }}
                    />
                  )}
                </div>
                <div className="mt-1 flex justify-between">
                  <span className="text-[10px] text-muted-foreground">Credit ratio</span>
                  <span className={`text-[10px] font-mono ${change >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {change >= 0 ? "▲" : "▼"} {fmtSign(Math.abs(change))}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Recent Transactions */}
        <div className="col-span-1 lg:col-span-3 bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-sm text-foreground">Recent Transactions</h3>
            <span className="text-xs text-muted-foreground">All accounts</span>
          </div>
          <div className="divide-y divide-border/60">
            {recentTxs.map((tx: any) => (
              <div key={tx.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === "credit" ? "bg-emerald-50" : "bg-red-50"}`}>
                    {tx.type === "credit"
                      ? <ArrowUpRight size={14} className="text-emerald-600" />
                      : <ArrowDownRight size={14} className="text-red-500" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground truncate">{tx.description}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: tx.accountBg, color: tx.accountColor }}>{tx.accountName}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{tx.date.split("-").reverse().join("/")}</span>
                      {tx.reference && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                          {tx.accountType === "company" ? `Project: ${tx.reference}` : `Ref: ${tx.reference}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className={`text-sm font-mono font-semibold ${tx.type === "credit" ? "text-emerald-600" : "text-red-500"}`}>
                    {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEditTransaction(tx, tx.accountId)}
                      className="p-1 text-gray-500 hover:text-accent rounded hover:bg-gray-100 transition-colors cursor-pointer"
                      title="Edit Entry"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => onDeleteTransaction(tx.id, tx.accountId)}
                      className="p-1 text-gray-500 hover:text-red-500 rounded hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Entry"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
