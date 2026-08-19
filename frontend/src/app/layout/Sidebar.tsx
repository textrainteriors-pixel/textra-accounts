import {
  Plus, Building2, CreditCard, ChevronRight,
  LayoutDashboard, Bell, LogOut
} from "lucide-react";
import type { Account } from "../types";
import { calcBalance, fmtSign } from "../utils";

export default function Sidebar({
  accounts,
  activeTab,
  reminders,
  mobileMenuOpen,
  onSetActiveTab,
  onCloseMobile,
  onAddCompany,
  onAddOverdraft,
  onLogout,
}: {
  accounts: Account[];
  activeTab: string;
  reminders: any[];
  mobileMenuOpen: boolean;
  onSetActiveTab: (id: string) => void;
  onCloseMobile: () => void;
  onAddCompany: () => void;
  onAddOverdraft: () => void;
  onLogout: () => void;
}) {
  return (
    <aside className={`${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out absolute md:relative z-30 h-full w-64 md:w-64 bg-white border-r border-border flex flex-col flex-shrink-0`}>
      {/* Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Dashboard & Reminders links */}
        <div className="px-4 py-3 border-b border-border flex flex-col gap-2">
          <button
            onClick={() => { onSetActiveTab("dashboard"); onCloseMobile(); }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "dashboard"
              ? "bg-accent text-white"
              : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
              }`}
          >
            <LayoutDashboard size={15} />
            Dashboard
          </button>
          <button
            onClick={() => { onSetActiveTab("reminders"); onCloseMobile(); }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "reminders"
              ? "bg-accent text-white"
              : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
              }`}
          >
            <Bell size={15} />
            Reminders
            {reminders.filter(r => !r.completed).length > 0 && (
              <span
                className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === "reminders" ? "bg-white/25 text-white" : "text-primary"
                  }`}
                style={activeTab !== "reminders" ? { backgroundColor: "#e8edf5" } : {}}
              >
                {reminders.filter(r => !r.completed).length}
              </span>
            )}
          </button>
        </div>

        <div className="px-4 py-2 border-b border-border flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest py-1">Companies</p>
          <button
            onClick={onAddCompany}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 text-muted-foreground transition-colors"
            title="Add Company"
          >
            <Plus size={14} />
          </button>
        </div>

        <nav className="py-2">
          {accounts.filter(a => a.type === "company").map(acc => {
            const closing = calcBalance(acc);
            const isActive = activeTab === acc.id;
            return (
              <button
                key={acc.id}
                onClick={() => onSetActiveTab(acc.id)}
                className={`w-full text-left px-4 py-3 flex items-center justify-between gap-2 transition-all group ${isActive ? "bg-secondary border-r-2 border-r-accent" : "hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: acc.bgColor }}>
                    <Building2 size={13} style={{ color: acc.color }} />
                  </div>
                  <div className="min-w-0">
                    <div className={`text-xs font-semibold truncate ${isActive ? "text-accent" : "text-foreground"}`}>{acc.name}</div>
                    <div className={`text-xs font-mono mt-0.5 ${closing < 0 ? "text-red-500" : "text-emerald-600"}`}>{fmtSign(closing)}</div>
                  </div>
                </div>
                <ChevronRight size={12} className={`flex-shrink-0 text-muted-foreground transition-transform ${isActive ? "rotate-90 text-accent" : ""}`} />
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-2 border-y border-border flex items-center justify-between bg-gray-50/50">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest py-1">Overdrafts</p>
          <button
            onClick={onAddOverdraft}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 text-muted-foreground transition-colors"
            title="Add Overdraft"
          >
            <Plus size={14} />
          </button>
        </div>

        <nav className="py-2">
          {accounts.filter(a => a.type === "overdraft").map(acc => {
            const closing = calcBalance(acc);
            const isActive = activeTab === acc.id;
            return (
              <button
                key={acc.id}
                onClick={() => onSetActiveTab(acc.id)}
                className={`w-full text-left px-4 py-3 flex items-center justify-between gap-2 transition-all group ${isActive ? "bg-secondary border-r-2 border-r-accent" : "hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: acc.bgColor }}>
                    <CreditCard size={13} style={{ color: acc.color }} />
                  </div>
                  <div className="min-w-0">
                    <div className={`text-xs font-semibold truncate ${isActive ? "text-accent" : "text-foreground"}`}>{acc.name}</div>
                    <div className={`text-xs font-mono mt-0.5 ${closing < 0 ? "text-red-500" : "text-emerald-600"}`}>{fmtSign(closing)}</div>
                  </div>
                </div>
                <ChevronRight size={12} className={`flex-shrink-0 text-muted-foreground transition-transform ${isActive ? "rotate-90 text-accent" : ""}`} />
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border bg-gray-50/50 flex-shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  );
}
