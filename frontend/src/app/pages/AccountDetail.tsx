import { useState, useMemo, useEffect } from "react";
import {
  Plus, Trash2, BarChart3, Building2,
  CreditCard, Edit3, X, Check,
  FileText, Image, Search, Filter, RotateCcw,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import type { Account, AttachedDoc } from "../types";
import { calcBalance, calcTotalCredit, calcTotalDebit, fmt, fmtSign } from "../utils";

export default function AccountDetail({
  activeAccount,
  editingName,
  nameInput,
  editingOpening,
  openingInput,
  onSetEditingName,
  onSetNameInput,
  onSaveAccountName,
  onCancelEditName,
  onSetEditingOpening,
  onSetOpeningInput,
  onSaveOpeningBalance,
  onCancelEditOpening,
  onEditCompany,
  onDeleteCompany,
  onAddEntry,
  onEditTransaction,
  onDeleteTransaction,
  onViewDoc,
}: {
  activeAccount: Account;
  editingName: string | null;
  nameInput: string;
  editingOpening: string | null;
  openingInput: string;
  onSetEditingName: (id: string | null) => void;
  onSetNameInput: (val: string) => void;
  onSaveAccountName: (id: string, name: string) => void;
  onCancelEditName: () => void;
  onSetEditingOpening: (id: string | null) => void;
  onSetOpeningInput: (val: string) => void;
  onSaveOpeningBalance: (id: string) => void;
  onCancelEditOpening: () => void;
  onEditCompany: (account: Account) => void;
  onDeleteCompany: (id: string) => void;
  onAddEntry: () => void;
  onEditTransaction: (tx: any) => void;
  onDeleteTransaction: (txId: string) => void;
  onViewDoc: (doc: AttachedDoc) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "credit" | "debit">("all");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const txsWithBalances = useMemo(() => {
    let bal = activeAccount.openingBalance;
    const list = activeAccount.transactions.map((tx: any) => {
      bal = tx.type === "credit" ? bal + tx.amount : bal - tx.amount;
      return { ...tx, runningBalance: bal };
    });
    return list.slice().reverse();
  }, [activeAccount]);

  const filteredTransactions = useMemo(() => {
    return txsWithBalances.filter((tx: any) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchDesc = tx.description?.toLowerCase().includes(q);
        const matchRef = tx.reference?.toLowerCase().includes(q);
        const matchAmt = String(tx.amount || "").includes(q);
        const matchDateStr = tx.date ? (tx.date.includes(q) || tx.date.split("-").reverse().join("/").includes(q)) : false;
        if (!matchDesc && !matchRef && !matchAmt && !matchDateStr) return false;
      }
      if (filterType !== "all" && tx.type !== filterType) return false;
      if (filterProject !== "all" && tx.reference !== filterProject) return false;
      if (startDate && tx.date < startDate) return false;
      if (endDate && tx.date > endDate) return false;
      return true;
    });
  }, [txsWithBalances, searchQuery, filterType, filterProject, startDate, endDate]);

  const isFilterActive = searchQuery !== "" || filterType !== "all" || filterProject !== "all" || startDate !== "" || endDate !== "";

  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("all");
    setFilterProject("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeAccount.id, searchQuery, filterType, filterProject, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedTransactions = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, safeCurrentPage, pageSize]);

  const startItemIndex = filteredTransactions.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endItemIndex = Math.min(safeCurrentPage * pageSize, filteredTransactions.length);

  return (
    <div className="p-6 space-y-5 w-full">
      {/* Account Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: activeAccount.bgColor }}>
            {activeAccount.type === "overdraft"
              ? <CreditCard size={18} style={{ color: activeAccount.color }} />
              : <Building2 size={18} style={{ color: activeAccount.color }} />}
          </div>
          <div>
            {editingName === activeAccount.id ? (
              <div className="flex items-center gap-2 mb-0.5">
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => onSetNameInput(e.target.value)}
                  className="border border-border rounded px-2 py-0.5 text-xl font-bold text-foreground focus:outline-none focus:border-accent w-48"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      onSaveAccountName(activeAccount.id, nameInput);
                    } else if (e.key === 'Escape') {
                      onCancelEditName();
                    }
                  }}
                />
                <button
                  onClick={() => onSaveAccountName(activeAccount.id, nameInput)}
                  className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                  title="Save"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={onCancelEditName}
                  className="p-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  title="Cancel"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group cursor-pointer mb-0.5" onClick={() => {
                onSetEditingName(activeAccount.id);
                onSetNameInput(activeAccount.name);
              }}>
                <h2 className="text-xl font-bold text-foreground">{activeAccount.name}</h2>
                <Edit3 size={14} className="text-gray-400 hover:text-accent transition-colors ml-1 cursor-pointer" />
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              {activeAccount.type === "overdraft" ? "Overdraft Account" : "Company Account"}
            </p>
          </div>
          {activeAccount.type === "overdraft" && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Overdraft</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onEditCompany(activeAccount)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-gray-50 transition-colors"
          >
            <Edit3 size={14} />
            <span>Edit Company</span>
          </button>
          <button
            onClick={() => onDeleteCompany(activeAccount.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors"
          >
            <Trash2 size={14} />
            <span>Delete Company</span>
          </button>
          <button
            onClick={onAddEntry}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 ml-1"
            style={{ backgroundColor: activeAccount.color }}
          >
            <Plus size={16} />
            Add Entry
          </button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-xs text-muted-foreground mb-1">Opening Balance</div>
          {editingOpening === activeAccount.id ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={openingInput}
                onChange={e => onSetOpeningInput(e.target.value)}
                className="w-full text-sm font-mono border border-border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent/30"
                autoFocus
                onKeyDown={e => {
                  if (e.key === "Enter") onSaveOpeningBalance(activeAccount.id);
                  if (e.key === "Escape") onCancelEditOpening();
                }}
              />
              <button onClick={() => onSaveOpeningBalance(activeAccount.id)} className="text-xs text-accent font-semibold">✓</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className={`text-base font-mono font-bold ${activeAccount.openingBalance < 0 ? "text-red-500" : "text-foreground"}`}>
                {fmtSign(activeAccount.openingBalance)}
              </div>
              <button
                onClick={() => { onSetEditingOpening(activeAccount.id); onSetOpeningInput(String(activeAccount.openingBalance)); }}
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                <Edit3 size={12} />
              </button>
            </div>
          )}
        </div>

        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
          <div className="text-xs text-emerald-700 mb-1">Total Credit</div>
          <div className="text-base font-mono font-bold text-emerald-700">+₹{fmt(calcTotalCredit(activeAccount))}</div>
          <div className="text-xs text-emerald-600 mt-1">{activeAccount.transactions.filter((t: any) => t.type === "credit").length} transactions</div>
        </div>

        <div className="bg-red-50 rounded-xl border border-red-100 p-4">
          <div className="text-xs text-red-700 mb-1">Total Debit</div>
          <div className="text-base font-mono font-bold text-red-600">-₹{fmt(calcTotalDebit(activeAccount))}</div>
          <div className="text-xs text-red-600 mt-1">{activeAccount.transactions.filter((t: any) => t.type === "debit").length} transactions</div>
        </div>

        <div className="rounded-xl border p-4" style={{ backgroundColor: activeAccount.bgColor, borderColor: `${activeAccount.color}30` }}>
          <div className="text-xs mb-1" style={{ color: activeAccount.color }}>Closing Balance</div>
          <div
            className={`text-base font-mono font-bold ${calcBalance(activeAccount) < 0 ? "text-red-600" : ""}`}
            style={{ color: calcBalance(activeAccount) < 0 ? undefined : activeAccount.color }}
          >
            {fmtSign(calcBalance(activeAccount))}
          </div>
          <div className="text-xs mt-1" style={{ color: activeAccount.color, opacity: 0.7 }}>
            {calcBalance(activeAccount) >= activeAccount.openingBalance ? "↑ Increase" : "↓ Decrease"}
          </div>
        </div>
      </div>

      {/* Transactions Table & Filters */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {/* Header & Filter Bar */}
        <div className="px-5 py-3.5 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-foreground">Transactions — {activeAccount.name}</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-200/70 text-gray-700 font-medium">
              {isFilterActive ? `${filteredTransactions.length} of ${activeAccount.transactions.length}` : `${activeAccount.transactions.length} entries`}
            </span>
          </div>

          {/* Filter Controls */}
          {activeAccount.transactions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative flex-1 sm:w-44 min-w-[140px]">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search desc, ref, date, amount..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-7 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value as any)}
                className="text-xs px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="credit">Credit Only</option>
                <option value="debit">Debit Only</option>
              </select>

              {/* Project Filter */}
              {activeAccount.type === "company" && activeAccount.projects && activeAccount.projects.length > 0 && (
                <select
                  value={filterProject}
                  onChange={e => setFilterProject(e.target.value)}
                  className="text-xs px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white cursor-pointer"
                >
                  <option value="all">All Projects</option>
                  {Array.from(new Set(activeAccount.projects)).map((p, idx) => (
                    <option key={`${p}-${idx}`} value={p}>{p}</option>
                  ))}
                </select>
              )}

              {/* Date Filters */}
              <div className="flex items-center gap-1">
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  title="From Date"
                  className="text-xs px-2 py-1 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white text-gray-700"
                />
                <span className="text-xs text-muted-foreground font-medium">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  title="To Date"
                  className="text-xs px-2 py-1 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white text-gray-700"
                />
              </div>

              {/* Clear Filters Button */}
              {isFilterActive && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition-colors"
                  title="Reset Filters"
                >
                  <RotateCcw size={12} />
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {activeAccount.transactions.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            <BarChart3 size={32} className="mx-auto mb-3 opacity-30" />
            <p>No entries yet</p>
            <p className="text-xs mt-1">Click "Add Entry" above to get started</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            <Filter size={28} className="mx-auto mb-2 opacity-30 text-gray-400" />
            <p className="font-semibold text-gray-700">No matching entries found</p>
            <p className="text-xs mt-1 text-gray-400">Try adjusting your filters or search query</p>
            <button
              onClick={clearFilters}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:opacity-90 transition-all cursor-pointer"
            >
              <RotateCcw size={12} /> Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="md:hidden flex flex-col divide-y divide-border/60">
              {paginatedTransactions.map((tx: any) => (
                <div key={tx.id} className="p-5 flex flex-col gap-3 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground">{tx.description}</div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs text-muted-foreground font-mono">{tx.date.split("-").reverse().join("/")}</span>
                        {tx.reference && (
                          <span className={`text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded truncate max-w-[120px] ${activeAccount.type === "company" ? "" : "font-mono"}`}>
                            {activeAccount.type === "company" ? `Project: ${tx.reference}` : `Ref: ${tx.reference}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {tx.type === "credit" ? (
                        <div className="font-mono font-bold text-emerald-600">+{fmt(tx.amount)}</div>
                      ) : (
                        <div className="font-mono font-bold text-red-500">-{fmt(tx.amount)}</div>
                      )}
                      <div className={`text-[11px] font-mono mt-1 ${tx.runningBalance < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                        Bal: {fmt(tx.runningBalance)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-1 pt-3 border-t border-border/40">
                    {tx.document?.name ? (
                      <button
                        onClick={() => onViewDoc(tx.document!)}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                      >
                        {tx.document.mimeType?.startsWith("image/") ? <Image size={14} /> : <FileText size={14} />}
                        <span className="text-xs font-medium max-w-[150px] truncate">{tx.document.name}</span>
                      </button>
                    ) : <div />}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        onClick={() => onEditTransaction(tx)}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-accent rounded-md transition-colors cursor-pointer"
                        title="Edit Entry"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                        title="Delete Entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {safeCurrentPage === totalPages && (
                <div className="px-5 py-3 bg-blue-50/30 flex justify-between items-center border-t border-border/60">
                  <span className="text-sm font-semibold text-muted-foreground">Opening Balance</span>
                  <span className="font-mono font-bold text-sm text-foreground">{fmt(activeAccount.openingBalance)}</span>
                </div>
              )}

              <div className="px-5 py-4 flex justify-between items-center" style={{ backgroundColor: activeAccount.bgColor }}>
                <span className="text-sm font-bold" style={{ color: activeAccount.color }}>Closing Balance</span>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-emerald-600 mb-0.5">Credit: +{fmt(calcTotalCredit(activeAccount))}</div>
                  <div className="text-base font-mono font-bold" style={{ color: calcBalance(activeAccount) < 0 ? "#dc2626" : activeAccount.color }}>
                    {fmt(calcBalance(activeAccount))}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-muted-foreground uppercase tracking-wide">
                    <th className="px-4 py-3 text-left font-semibold w-24">Date</th>
                    <th className="px-4 py-3 text-left font-semibold">Description</th>
                    <th className="px-4 py-3 text-left font-semibold w-24">{activeAccount.type === "company" ? "Project" : "Ref. No."}</th>
                    <th className="px-4 py-3 text-center font-semibold w-20">Doc</th>
                    <th className="px-4 py-3 text-right font-semibold w-32">Credit (₹)</th>
                    <th className="px-4 py-3 text-right font-semibold w-32">Debit (₹)</th>
                    <th className="px-4 py-3 text-right font-semibold w-36">Balance (₹)</th>
                    <th className="px-4 py-3 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((tx: any) => (
                    <tr key={tx.id} className="border-b border-border/60 hover:bg-gray-50 transition-colors group">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tx.date.split("-").reverse().join("/")}</td>
                      <td className="px-4 py-3 text-foreground">{tx.description}</td>
                      <td className={`px-4 py-3 text-xs text-muted-foreground ${activeAccount.type === "company" ? "" : "font-mono"}`}>{tx.reference || "—"}</td>
                      <td className="px-4 py-3 text-center">
                        {tx.document?.name ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onViewDoc(tx.document!)}
                              className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                              title={tx.document.name}
                            >
                              {tx.document.mimeType?.startsWith("image/")
                                ? <Image size={12} />
                                : <FileText size={12} />}
                              <span className="text-[10px] font-medium max-w-[60px] truncate">{tx.document.name?.split(".")[0]}</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/30 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {tx.type === "credit"
                          ? <span className="text-emerald-600 font-semibold">{fmt(tx.amount)}</span>
                          : <span className="text-muted-foreground/40">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {tx.type === "debit"
                          ? <span className="text-red-500 font-semibold">{fmt(tx.amount)}</span>
                          : <span className="text-muted-foreground/40">—</span>}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-semibold text-xs ${tx.runningBalance < 0 ? "text-red-500" : "text-foreground"}`}>
                        {fmt(tx.runningBalance)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="text-gray-500 hover:text-accent p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                            title="Edit Entry"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="text-gray-500 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Delete Entry"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {safeCurrentPage === totalPages && (
                    <tr className="bg-blue-50/50 border-b border-border">
                      <td colSpan={6} className="px-4 py-2 text-xs text-muted-foreground font-semibold">Opening Balance</td>
                      <td className="px-4 py-2 text-right font-mono text-xs font-bold text-foreground">{fmt(activeAccount.openingBalance)}</td>
                      <td></td>
                    </tr>
                  )}

                  <tr style={{ backgroundColor: activeAccount.bgColor }}>
                    <td colSpan={5} className="px-4 py-3 text-xs font-bold" style={{ color: activeAccount.color }}>Closing Balance</td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-bold text-emerald-600">+{fmt(calcTotalCredit(activeAccount))}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold" style={{ color: calcBalance(activeAccount) < 0 ? "#dc2626" : activeAccount.color }}>
                      {fmt(calcBalance(activeAccount))}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredTransactions.length > 0 && (
              <div className="px-5 py-3 border-t border-border bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
                <div className="flex flex-wrap items-center gap-4">
                  <span>
                    Showing <span className="font-semibold text-foreground">{startItemIndex}</span> to{" "}
                    <span className="font-semibold text-foreground">{endItemIndex}</span> of{" "}
                    <span className="font-semibold text-foreground">{filteredTransactions.length}</span> entries
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span>Rows per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-1 border border-border rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 font-medium cursor-pointer"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={safeCurrentPage === 1}
                    className="p-1.5 rounded-lg border border-border bg-white hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="First Page"
                  >
                    <ChevronsLeft size={14} />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safeCurrentPage === 1}
                    className="p-1.5 rounded-lg border border-border bg-white hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Previous Page"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  <span className="px-3 py-1 font-semibold text-foreground">
                    Page {safeCurrentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safeCurrentPage === totalPages}
                    className="p-1.5 rounded-lg border border-border bg-white hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Next Page"
                  >
                    <ChevronRight size={14} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={safeCurrentPage === totalPages}
                    className="p-1.5 rounded-lg border border-border bg-white hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Last Page"
                  >
                    <ChevronsRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
