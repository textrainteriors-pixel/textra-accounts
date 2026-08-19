import {
  Plus, BarChart3, Bell, FileDown, Menu
} from "lucide-react";
import { today } from "../utils";

export default function Header({
  reminders,
  mobileMenuOpen,
  onToggleMobileMenu,
  onAddProject,
  onOpenReminders,
  onOpenReport,
}: {
  reminders: any[];
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onAddProject: () => void;
  onOpenReminders: () => void;
  onOpenReport: () => void;
}) {
  return (
    <header className="bg-primary text-primary-foreground px-4 sm:px-6 py-4 flex flex-wrap sm:flex-nowrap items-center justify-between shadow-lg flex-shrink-0 gap-3">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          className="md:hidden p-1.5 -ml-1.5 rounded-md hover:bg-white/15 transition-colors"
          onClick={onToggleMobileMenu}
        >
          <Menu size={20} />
        </button>
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/15 flex items-center justify-center">
          <BarChart3 size={18} className="sm:hidden" />
          <BarChart3 size={20} className="hidden sm:block" />
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight leading-none">Accounts Manager</h1>
          <p className="text-[10px] sm:text-xs text-white/60 mt-0.5">Multi-Company Accounting System</p>
        </div>
      </div>
      <div className="flex items-center justify-between w-full sm:w-auto gap-4">
        <button
          onClick={onAddProject}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-semibold transition-all"
        >
          <Plus size={16} />
          <span> Project</span>
        </button>
        <button
          onClick={onOpenReminders}
          className="relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-semibold transition-all"
        >
          <Bell size={16} />
          <span>Reminders</span>
          {reminders.filter(r => r.date === today && !r.completed).length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              {reminders.filter(r => r.date === today && !r.completed).length}
            </span>
          )}
        </button>
        <button
          onClick={onOpenReport}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-semibold transition-all"
        >
          <FileDown size={16} />
          <span className="hidden sm:inline">Monthly Report</span>
          <span className="sm:hidden">Report</span>
        </button>
        <div className="text-right text-sm">
          <div className="text-white/60 text-xs">Today</div>
          <div className="font-mono font-semibold">
            {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
          </div>
        </div>
      </div>
    </header>
  );
}
