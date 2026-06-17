import { useState, useMemo, useRef, useEffect } from "react";
import { useAccountsController } from "../controllers/useAccountsController";
import {
  Plus, Trash2, TrendingUp, TrendingDown, BarChart3, Building2,
  CreditCard, ChevronRight, X, Edit3, LayoutDashboard, ArrowUpRight,
  ArrowDownRight, Wallet, Activity, FileText, Image,
  Download, Upload, FileDown, Check, LogOut, Menu
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

import { authService } from "../services/authService";
import Login from "./Login";

type TransactionType = "credit" | "debit";

interface AttachedDoc {
  name: string;
  dataUrl: string;
  mimeType: string;
  size: number;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: TransactionType;
  amount: number;
  reference?: string;
  accountId?: string;
  document?: AttachedDoc;
}

interface Account {
  id: string;
  name: string;
  type: "company" | "overdraft";
  openingBalance: number;
  transactions: Transaction[];
  color: string;
  bgColor: string;
  createdAt?: string;
}

const initialAccounts: Account[] = [
  {
    id: "company1",
    name: "Company 1",
    type: "company",
    color: "#1e3a5f",
    bgColor: "#e8edf5",
    openingBalance: 125000,
    transactions: [
      { id: "t1", date: "2024-06-15", description: "Sales Receipt", type: "credit", amount: 45000, reference: "INV-001" },
      { id: "t2", date: "2024-06-15", description: "Supplier Payment", type: "debit", amount: 18500, reference: "PO-012" },
      { id: "t3", date: "2024-06-15", description: "Rent Collection", type: "credit", amount: 12000, reference: "RC-005" },
    ],
  },
  {
    id: "company2",
    name: "Company 2",
    type: "company",
    color: "#065f46",
    bgColor: "#d1fae5",
    openingBalance: 89500,
    transactions: [
      { id: "t4", date: "2024-06-15", description: "Service Income", type: "credit", amount: 32000, reference: "SRV-008" },
      { id: "t5", date: "2024-06-15", description: "Utility Bills", type: "debit", amount: 8200, reference: "UTIL-06" },
    ],
  },
  {
    id: "company3",
    name: "Company 3",
    type: "company",
    color: "#7c2d12",
    bgColor: "#fef3c7",
    openingBalance: 210000,
    transactions: [
      { id: "t6", date: "2024-06-15", description: "Product Sales", type: "credit", amount: 67000, reference: "PS-114" },
      { id: "t7", date: "2024-06-15", description: "Raw Materials", type: "debit", amount: 41000, reference: "RM-033" },
      { id: "t8", date: "2024-06-15", description: "Staff Salaries", type: "debit", amount: 28000, reference: "SAL-06" },
    ],
  },
  {
    id: "company4",
    name: "Company 4",
    type: "company",
    color: "#4c1d95",
    bgColor: "#ede9fe",
    openingBalance: 55000,
    transactions: [
      { id: "t9", date: "2024-06-15", description: "Consulting Fee", type: "credit", amount: 25000, reference: "CF-019" },
      { id: "t10", date: "2024-06-15", description: "Office Supplies", type: "debit", amount: 3500, reference: "OS-007" },
    ],
  },
  {
    id: "overdraft",
    name: "Overdraft Account",
    type: "overdraft",
    color: "#9f1239",
    bgColor: "#ffe4e6",
    openingBalance: -45000,
    transactions: [
      { id: "t11", date: "2024-06-15", description: "Bank Withdrawal", type: "debit", amount: 15000, reference: "BW-002" },
      { id: "t12", date: "2024-06-15", description: "Repayment", type: "credit", amount: 20000, reference: "REP-01" },
    ],
  },
];

function calcBalance(account: Account): number {
  return account.transactions.reduce(
    (bal, tx) => (tx.type === "credit" ? bal + tx.amount : bal - tx.amount),
    account.openingBalance
  );
}
function calcTotalCredit(account: Account): number {
  return account.transactions.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
}
function calcTotalDebit(account: Account): number {
  return account.transactions.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0);
}
function fmt(n: number): string {
  const abs = Math.abs(n);
  const f = abs.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n < 0 ? `(${f})` : f;
}
function fmtSign(n: number): string {
  return n < 0
    ? `-₹${Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
    : `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

const today = new Date().toISOString().split("T")[0];

// ─── PDF Generator ────────────────────────────────────────────────────────────
function generateMonthlyPDF(accounts: Account[], month: number, year: number) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const monthName = new Date(year, month - 1, 1).toLocaleString("en-IN", { month: "long" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;

  const filterTx = (txs: Transaction[]) =>
    txs.filter(tx => {
      const d = new Date(tx.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });

  // ── Header banner ──
  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, pageW, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("ACCOUNTS MANAGER", margin, 12);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Multi-Company Accounting System", margin, 19);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Monthly Report — ${monthName} ${year}`, pageW - margin, 12, { align: "right" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`, pageW - margin, 19, { align: "right" });

  // ── Summary table ──
  doc.setTextColor(30, 58, 95);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Account Summary", margin, 38);

  const summaryRows: any[] = [];
  let totalOpen = 0;
  let totalCredit = 0;
  let totalDebit = 0;
  let totalClose = 0;

  accounts.forEach(acc => {
    // Transactions before this month to calculate accurate monthly opening balance
    const txsBeforeMonth = acc.transactions.filter(tx => {
      const d = new Date(tx.date);
      return d.getFullYear() < year || (d.getFullYear() === year && d.getMonth() + 1 < month);
    });
    const creditBefore = txsBeforeMonth.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
    const debitBefore = txsBeforeMonth.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0);
    const monthlyOpeningBalance = acc.openingBalance + creditBefore - debitBefore;

    // Transactions during this month
    const txs = filterTx(acc.transactions);
    const credit = txs.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
    const debit = txs.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0);
    const closing = monthlyOpeningBalance + credit - debit;

    // Check if the account existed in or before the selected month
    const accDate = acc.createdAt ? new Date(acc.createdAt) : new Date();
    const isExisted = accDate.getFullYear() < year || (accDate.getFullYear() === year && accDate.getMonth() + 1 <= month);

    // Only show accounts that either:
    // 1. Existed in/before this month AND have a non-zero opening/closing balance
    // 2. Have actual transactions this month
    if ((isExisted && (monthlyOpeningBalance !== 0 || credit > 0 || debit > 0)) || txs.length > 0) {
      totalOpen += monthlyOpeningBalance;
      totalCredit += credit;
      totalDebit += debit;
      totalClose += closing;

      summaryRows.push([
        acc.name,
        `Rs.${monthlyOpeningBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        `Rs.${credit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        `Rs.${debit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        `Rs.${closing.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      ]);
    }
  });

  if (summaryRows.length === 0) {
    summaryRows.push(["No Activity", "-", "-", "-", "-"]);
  } else {
    summaryRows.push([
      "TOTAL",
      `Rs.${totalOpen.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      `Rs.${totalCredit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      `Rs.${totalDebit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      `Rs.${totalClose.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    ]);
  }

  autoTable(doc, {
    startY: 42,
    head: [["Account", "Opening Balance", "Total Credit", "Total Debit", "Closing Balance"]],
    body: summaryRows,
    theme: "grid",
    headStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: [30, 30, 30] },
    columnStyles: {
      0: { fontStyle: "bold" },
      1: { halign: "right" },
      2: { halign: "right", textColor: [5, 95, 70] },
      3: { halign: "right", textColor: [159, 18, 57] },
      4: { halign: "right", fontStyle: "bold" },
    },
    willDrawCell: (data) => {
      if (data.row.index === summaryRows.length - 1) {
        doc.setFillColor(230, 237, 245);
      }
    },
    margin: { left: margin, right: margin },
  });

  // ── Per-account detail tables ──
  accounts.forEach(acc => {
    const txs = filterTx(acc.transactions);
    doc.addPage();

    // Account header
    doc.setFillColor(30, 58, 95);
    doc.rect(0, 0, pageW, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(acc.name, margin, 9);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`${acc.type === "overdraft" ? "Overdraft Account" : "Company Account"} — ${monthName} ${year}`, margin, 16);
    doc.text(`Page ${(doc.internal as any).getCurrentPageInfo().pageNumber}`, pageW - margin, 16, { align: "right" });

    // Balance summary row
    const credit = txs.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
    const debit = txs.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0);
    const closing = acc.openingBalance + credit - debit;

    doc.setTextColor(30, 58, 95);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");

    const balY = 28;
    const colW = (pageW - margin * 2) / 4;
    [
      { label: "Opening Balance", val: acc.openingBalance },
      { label: "Total Credit", val: credit },
      { label: "Total Debit", val: debit },
      { label: "Closing Balance", val: closing },
    ].forEach(({ label, val }, i) => {
      const x = margin + i * colW;
      doc.setFillColor(232, 237, 245);
      doc.rect(x, balY - 5, colW - 2, 12, "F");
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 120);
      doc.text(label, x + 3, balY);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(i === 1 ? 5 : i === 2 ? 159 : 30, i === 1 ? 95 : i === 2 ? 18 : 58, i === 1 ? 70 : i === 2 ? 57 : 95);
      doc.text(`Rs.${Math.abs(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, x + 3, balY + 5);
    });

    if (txs.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(9);
      doc.text("No transactions for this month.", margin, 50);
    } else {
      let runBal = acc.openingBalance;
      const rows = txs.map(tx => {
        runBal = tx.type === "credit" ? runBal + tx.amount : runBal - tx.amount;
        return [
          tx.date.split("-").reverse().join("/"),
          tx.description,
          tx.reference || "—",
          tx.type === "credit" ? `Rs.${tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "",
          tx.type === "debit" ? `Rs.${tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "",
          `Rs.${runBal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        ];
      });

      autoTable(doc, {
        startY: 44,
        head: [["Date", "Description", "Reference", "Credit (Rs.)", "Debit (Rs.)", "Balance (Rs.)"]],
        body: rows,
        theme: "striped",
        headStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: "bold", fontSize: 8.5 },
        bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: "auto" },
          2: { cellWidth: 24 },
          3: { halign: "right", textColor: [5, 95, 70], cellWidth: 30 },
          4: { halign: "right", textColor: [159, 18, 57], cellWidth: 30 },
          5: { halign: "right", fontStyle: "bold", cellWidth: 32 },
        },
        margin: { left: margin, right: margin },
      });
    }
  });

  // ── Footer on every page ──
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(240, 242, 245);
    doc.rect(0, doc.internal.pageSize.getHeight() - 10, pageW, 10, "F");
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 140);
    doc.text("Accounts Manager — Confidential", margin, doc.internal.pageSize.getHeight() - 3.5);
    doc.text(`Page ${i} of ${totalPages}`, pageW - margin, doc.internal.pageSize.getHeight() - 3.5, { align: "right" });
  }

  doc.save(`Monthly_Report_${monthName}_${year}.pdf`);
}

// ─── Dashboard Page ────────────────────────────────────────────────────────────
function Dashboard({
  accounts,
  onNavigate,
}: {
  accounts: Account[];
  onNavigate: (id: string) => void;
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
    .flatMap(a => a.transactions.map(tx => ({ ...tx, accountId: a.id, accountName: a.name, accountColor: a.color, accountBg: a.bgColor })))
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

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Page title */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Overview of all accounts — {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className={`bg-white rounded-2xl border ${kpi.border} p-5 flex flex-col gap-3`}>
            <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
              <kpi.icon size={18} className={kpi.iconColor} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">{kpi.label}</div>
              <div className={`text-lg font-mono font-bold leading-tight ${kpi.valueColor}`}>{kpi.value}</div>
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
              <div key={tx.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === "credit" ? "bg-emerald-50" : "bg-red-50"}`}>
                  {tx.type === "credit"
                    ? <ArrowUpRight size={14} className="text-emerald-600" />
                    : <ArrowDownRight size={14} className="text-red-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground truncate">{tx.description}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: tx.accountBg, color: tx.accountColor }}>{tx.accountName}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{tx.date.split("-").reverse().join("/")}</span>
                    {tx.reference && <span className="text-[10px] text-muted-foreground">{tx.reference}</span>}
                  </div>
                </div>
                <div className={`text-sm font-mono font-semibold flex-shrink-0 ${tx.type === "credit" ? "text-emerald-600" : "text-red-500"}`}>
                  {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!authService.getCurrentUser());
  const { accounts, loading, addTransaction: handleAddTx, deleteTransaction: handleDelTx, saveOpeningBalance: handleSaveBal, addAccount: handleAddAccount, editAccountName } = useAccountsController(isAuthenticated);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({ name: "", type: "company", openingBalance: "", color: "#1e3a5f" });
  const [showReport, setShowReport] = useState(false);
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [editingOpening, setEditingOpening] = useState<string | null>(null);
  const [openingInput, setOpeningInput] = useState("");
  const [editingName, setEditingName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [viewDoc, setViewDoc] = useState<AttachedDoc | null>(null);
  const [form, setForm] = useState({
    date: today,
    description: "",
    type: "credit" as TransactionType,
    amount: "",
    reference: "",
    document: null as AttachedDoc | null,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm(f => ({
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

  const activeAccount = accounts.find(a => a.id === activeTab);

  const runningBalances = useMemo(() => {
    if (!activeAccount) return [];
    let bal = activeAccount.openingBalance;
    return activeAccount.transactions.map((tx: any) => {
      bal = tx.type === "credit" ? bal + tx.amount : bal - tx.amount;
      return bal;
    });
  }, [activeAccount]);

  const addCompany = async () => {
    if (!companyForm.name) return;
    const newId = await handleAddAccount({
      ...companyForm,
      openingBalance: parseFloat(companyForm.openingBalance) || 0,
      bgColor: companyForm.type === "overdraft" ? "#ffe4e6" : "#e8edf5",
      color: companyForm.type === "overdraft" ? "#9f1239" : "#1e3a5f"
    });
    setCompanyForm({ name: "", type: "company", openingBalance: "", color: "#1e3a5f" });
    setShowAddCompany(false);
    if (newId) setActiveTab(newId);
  };

  const addTransaction = () => {
    if (!form.description || !form.amount) return;
    const tx = {
      date: form.date,
      description: form.description,
      type: form.type,
      amount: parseFloat(form.amount),
      reference: form.reference || undefined,
      document: form.document || undefined,
    };
    handleAddTx(activeTab, tx);
    setForm({ date: today, description: "", type: "credit", amount: "", reference: "", document: null });
    setShowForm(false);
  };

  const deleteTransaction = (txId: string) => {
    handleDelTx(activeTab, txId);
  };

  const saveOpeningBalance = (accountId: string) => {
    const val = parseFloat(openingInput);
    if (isNaN(val)) return;
    handleSaveBal(accountId, val);
    setEditingOpening(null);
  };

  const totalDailyCredit = accounts.reduce((s, a) => s + calcTotalCredit(a), 0);
  const totalDailyDebit = accounts.reduce((s, a) => s + calcTotalDebit(a), 0);
  const totalNetBalance = accounts.reduce((s, a) => s + calcBalance(a), 0);
  const totalOpeningBalance = accounts.reduce((s, a) => s + a.openingBalance, 0);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-background" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 sm:px-6 py-4 flex flex-wrap sm:flex-nowrap items-center justify-between shadow-lg flex-shrink-0 gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            className="md:hidden p-1.5 -ml-1.5 rounded-md hover:bg-white/15 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
            onClick={() => setShowReport(true)}
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

      {/* Daily Summary Strip */}
      <div className="hidden md:grid bg-white border-b border-border px-4 sm:px-6 py-3 md:grid-cols-4 gap-4 flex-shrink-0 overflow-x-auto">
        {[
          { label: "Opening Total", value: `₹${fmt(totalOpeningBalance)}`, icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total Credit", value: `+₹${fmt(totalDailyCredit)}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Debit", value: `-₹${fmt(totalDailyDebit)}`, icon: TrendingDown, color: "text-red-500", bg: "bg-red-50" },
          {
            label: "Net Balance", value: fmtSign(totalNetBalance), icon: CreditCard,
            color: totalNetBalance >= 0 ? "text-blue-600" : "text-red-500",
            bg: totalNetBalance >= 0 ? "bg-blue-50" : "bg-red-50",
          },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full ${item.bg} flex items-center justify-center flex-shrink-0`}>
              <item.icon size={15} className={item.color} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
              <div className={`font-mono font-semibold text-sm ${item.color}`}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Backdrop for mobile sidebar */}
        {mobileMenuOpen && (
          <div 
            className="absolute inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        {/* Sidebar */}
        <aside className={`${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out absolute md:relative z-30 h-full w-64 md:w-56 bg-white border-r border-border flex flex-col flex-shrink-0`}>
          {/* Dashboard link */}
          <div className="px-4 py-3 border-b border-border">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "dashboard"
                  ? "bg-accent text-white"
                  : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
              }`}
            >
              <LayoutDashboard size={15} />
              Dashboard
            </button>
          </div>

          <div className="px-4 py-2 border-b border-border flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest py-1">Companies</p>
            <button 
              onClick={() => {
                setCompanyForm({ name: "", type: "company", openingBalance: "", color: "#1e3a5f" });
                setShowAddCompany(true);
              }}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 text-muted-foreground transition-colors"
              title="Add Company"
            >
              <Plus size={14} />
            </button>
          </div>

          <nav className="py-2 flex-shrink-0">
            {accounts.filter(a => a.type === "company").map(acc => {
              const closing = calcBalance(acc);
              const isActive = activeTab === acc.id;
              return (
                <button
                  key={acc.id}
                  onClick={() => setActiveTab(acc.id)}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between gap-2 transition-all group ${
                    isActive ? "bg-secondary border-r-2 border-r-accent" : "hover:bg-gray-50"
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
              onClick={() => {
                setCompanyForm({ name: "", type: "overdraft", openingBalance: "", color: "#9f1239" });
                setShowAddCompany(true);
              }}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 text-muted-foreground transition-colors"
              title="Add Overdraft"
            >
              <Plus size={14} />
            </button>
          </div>

          <nav className="flex-1 py-2 overflow-y-auto">
            {accounts.filter(a => a.type === "overdraft").map(acc => {
              const closing = calcBalance(acc);
              const isActive = activeTab === acc.id;
              return (
                <button
                  key={acc.id}
                  onClick={() => setActiveTab(acc.id)}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between gap-2 transition-all group ${
                    isActive ? "bg-secondary border-r-2 border-r-accent" : "hover:bg-gray-50"
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

          {/* Sidebar summary */}
          <div className="border-t border-border p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Daily Summary</p>
            {accounts.map(acc => {
              const closing = calcBalance(acc);
              return (
                <div key={acc.id} className="flex justify-between items-center py-0.5">
                  <span className="text-xs text-muted-foreground truncate">{acc.name}</span>
                  <span className={`text-xs font-mono font-semibold ${closing < 0 ? "text-red-500" : "text-foreground"}`}>{fmtSign(closing)}</span>
                </div>
              );
            })}
            <div className="border-t border-border mt-2 pt-2 flex justify-between items-center">
              <span className="text-xs font-semibold">Total</span>
              <span className={`text-xs font-mono font-bold ${totalNetBalance < 0 ? "text-red-500" : "text-accent"}`}>{fmtSign(totalNetBalance)}</span>
            </div>
          </div>

          <div className="p-4 mt-auto border-t border-border bg-gray-50/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === "dashboard" ? (
            <Dashboard accounts={accounts} onNavigate={setActiveTab} />
          ) : activeAccount ? (
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
                          onChange={e => setNameInput(e.target.value)}
                          className="border border-border rounded px-2 py-0.5 text-xl font-bold text-foreground focus:outline-none focus:border-accent w-48"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              editAccountName(activeAccount.id, nameInput);
                              setEditingName(null);
                            } else if (e.key === 'Escape') {
                              setEditingName(null);
                            }
                          }}
                        />
                        <button 
                          onClick={() => {
                            editAccountName(activeAccount.id, nameInput);
                            setEditingName(null);
                          }}
                          className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                          title="Save"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => setEditingName(null)}
                          className="p-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group cursor-pointer mb-0.5" onClick={() => {
                        setEditingName(activeAccount.id);
                        setNameInput(activeAccount.name);
                      }}>
                        <h2 className="text-xl font-bold text-foreground">{activeAccount.name}</h2>
                        <Edit3 size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: activeAccount.color }}
                >
                  <Plus size={16} />
                  Add Entry
                </button>
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
                        onChange={e => setOpeningInput(e.target.value)}
                        className="w-full text-sm font-mono border border-border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent/30"
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === "Enter") saveOpeningBalance(activeAccount.id);
                          if (e.key === "Escape") setEditingOpening(null);
                        }}
                      />
                      <button onClick={() => saveOpeningBalance(activeAccount.id)} className="text-xs text-accent font-semibold">✓</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className={`text-base font-mono font-bold ${activeAccount.openingBalance < 0 ? "text-red-500" : "text-foreground"}`}>
                        {fmtSign(activeAccount.openingBalance)}
                      </div>
                      <button
                        onClick={() => { setEditingOpening(activeAccount.id); setOpeningInput(String(activeAccount.openingBalance)); }}
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
                  <div className="text-xs text-emerald-600 mt-1">{activeAccount.transactions.filter((t : any) => t.type === "credit").length} transactions</div>
                </div>

                <div className="bg-red-50 rounded-xl border border-red-100 p-4">
                  <div className="text-xs text-red-700 mb-1">Total Debit</div>
                  <div className="text-base font-mono font-bold text-red-600">-₹{fmt(calcTotalDebit(activeAccount))}</div>
                  <div className="text-xs text-red-600 mt-1">{activeAccount.transactions.filter((t : any) => t.type === "debit").length} transactions</div>
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

              {/* Transactions Table */}
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-foreground">Transactions — {activeAccount.name}</h3>
                  <span className="text-xs text-muted-foreground">{activeAccount.transactions.length} entries</span>
                </div>

                {activeAccount.transactions.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground text-sm">
                    <BarChart3 size={32} className="mx-auto mb-3 opacity-30" />
                    <p>No entries yet</p>
                    <p className="text-xs mt-1">Click "Add Entry" above to get started</p>
                  </div>
                ) : (
                  <>
                    {/* Mobile View */}
                    <div className="md:hidden flex flex-col divide-y divide-border/60">
                      <div className="px-5 py-3 bg-blue-50/30 flex justify-between items-center">
                        <span className="text-sm font-semibold text-muted-foreground">Opening Balance</span>
                        <span className="font-mono font-bold text-sm text-foreground">{fmt(activeAccount.openingBalance)}</span>
                      </div>
                      
                      {activeAccount.transactions.map((tx: any, i: any) => (
                        <div key={tx.id} className="p-5 flex flex-col gap-3 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start gap-4">
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-foreground">{tx.description}</div>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className="text-xs text-muted-foreground font-mono">{tx.date.split("-").reverse().join("/")}</span>
                                {tx.reference && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono truncate max-w-[100px]">Ref: {tx.reference}</span>}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              {tx.type === "credit" ? (
                                <div className="font-mono font-bold text-emerald-600">+{fmt(tx.amount)}</div>
                              ) : (
                                <div className="font-mono font-bold text-red-500">-{fmt(tx.amount)}</div>
                              )}
                              <div className={`text-[11px] font-mono mt-1 ${runningBalances[i] < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                                Bal: {fmt(runningBalances[i])}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-1 pt-3 border-t border-border/40">
                            {tx.document?.name ? (
                                <button
                                  onClick={() => setViewDoc(tx.document!)}
                                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                                >
                                  {tx.document.mimeType?.startsWith("image/") ? <Image size={14} /> : <FileText size={14} />}
                                  <span className="text-xs font-medium max-w-[150px] truncate">{tx.document.name}</span>
                                </button>
                            ) : <div/>}
                            <button
                              onClick={() => deleteTransaction(tx.id)}
                              className="p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-500 rounded-md transition-colors ml-auto"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                      
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
                          <th className="px-4 py-3 text-left font-semibold w-24">Ref. No.</th>
                          <th className="px-4 py-3 text-center font-semibold w-20">Doc</th>
                          <th className="px-4 py-3 text-right font-semibold w-32">Credit (₹)</th>
                          <th className="px-4 py-3 text-right font-semibold w-32">Debit (₹)</th>
                          <th className="px-4 py-3 text-right font-semibold w-36">Balance (₹)</th>
                          <th className="px-4 py-3 text-center w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-blue-50/50 border-b border-border">
                          <td colSpan={6} className="px-4 py-2 text-xs text-muted-foreground font-semibold">Opening Balance</td>
                          <td className="px-4 py-2 text-right font-mono text-xs font-bold text-foreground">{fmt(activeAccount.openingBalance)}</td>
                          <td></td>
                        </tr>

                        {activeAccount.transactions.map((tx: any, i: any) => (
                          <tr key={tx.id} className="border-b border-border/60 hover:bg-gray-50 transition-colors group">
                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tx.date.split("-").reverse().join("/")}</td>
                            <td className="px-4 py-3 text-foreground">{tx.description}</td>
                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tx.reference || "—"}</td>
                            <td className="px-4 py-3 text-center">
                              {tx.document?.name ? (
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => setViewDoc(tx.document!)}
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
                            <td className={`px-4 py-3 text-right font-mono font-semibold text-xs ${runningBalances[i] < 0 ? "text-red-500" : "text-foreground"}`}>
                              {fmt(runningBalances[i])}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => deleteTransaction(tx.id)}
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}

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
                  </>
                )}
              </div>
            </div>
          ) : null}
        </main>
      </div>

      {/* Monthly Report Modal */}
      {showReport && (
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
              <button onClick={() => setShowReport(false)} className="text-white/60 hover:text-white transition-colors">
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
                      onClick={() => setReportMonth(m)}
                      className={`py-2 rounded-lg text-xs font-semibold transition-all border ${
                        reportMonth === m
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
                    onClick={() => setReportYear(y => y - 1)}
                    className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all text-lg font-bold"
                  >‹</button>
                  <div className="flex-1 text-center font-mono font-bold text-xl text-foreground">{reportYear}</div>
                  <button
                    onClick={() => setReportYear(y => y + 1)}
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
                  {accounts.reduce((s, a) => s + a.transactions.filter((tx : any) => {
                    const d = new Date(tx.date);
                    return d.getMonth() + 1 === reportMonth && d.getFullYear() === reportYear;
                  }).length, 0)} transactions across all accounts
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setShowReport(false)}
                className="flex-1 py-2.5 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  generateMonthlyPDF(accounts, reportMonth, reportYear);
                  setShowReport(false);
                }}
                className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Download size={15} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  {viewDoc.mimeType.startsWith("image/")
                    ? <Image size={16} className="text-blue-600" />
                    : <FileText size={16} className="text-blue-600" />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{viewDoc.name}</div>
                  <div className="text-xs text-muted-foreground">{(viewDoc.size / 1024).toFixed(1)} KB · {viewDoc.mimeType}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={viewDoc.dataUrl}
                  download={viewDoc.name}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  <Download size={13} />
                  Download
                </a>
                <button onClick={() => setViewDoc(null)} className="w-8 h-8 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-100 flex items-center justify-center min-h-48">
              {viewDoc.mimeType.startsWith("image/") ? (
                <img
                  src={viewDoc.dataUrl}
                  alt={viewDoc.name}
                  className="max-w-full max-h-[60vh] rounded-lg shadow-md object-contain"
                />
              ) : viewDoc.mimeType === "application/pdf" ? (
                <iframe
                  src={viewDoc.dataUrl}
                  title={viewDoc.name}
                  className="w-full rounded-lg"
                  style={{ height: "60vh" }}
                />
              ) : (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto mb-4 text-muted-foreground opacity-40" />
                  <p className="text-sm text-muted-foreground font-medium">{viewDoc.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">Preview not available for this file type</p>
                  <a
                    href={viewDoc.dataUrl}
                    download={viewDoc.name}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Download size={14} />
                    Download to view
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddCompany && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-lg text-foreground">Add New Company</h3>
              <button onClick={() => setShowAddCompany(false)} className="text-muted-foreground hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Company Name</label>
                <input
                  type="text"
                  value={companyForm.name}
                  onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                  placeholder="Enter name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Account Type</label>
                  <select
                    value={companyForm.type}
                    onChange={e => setCompanyForm({ ...companyForm, type: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                  >
                    <option value="company">Company</option>
                    <option value="overdraft">Overdraft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Opening Balance</label>
                  <input
                    type="number"
                    value={companyForm.openingBalance}
                    onChange={e => setCompanyForm({ ...companyForm, openingBalance: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-border flex justify-end gap-3">
              <button onClick={() => setShowAddCompany(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Cancel
              </button>
              <button onClick={addCompany} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
                Add Company
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && activeAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border" style={{ backgroundColor: activeAccount.bgColor }}>
              <div>
                <h3 className="font-bold text-base" style={{ color: activeAccount.color }}>New Entry</h3>
                <p className="text-xs mt-0.5" style={{ color: activeAccount.color, opacity: 0.7 }}>{activeAccount.name}</p>
              </div>
              <button onClick={() => { setShowForm(false); setForm(f => ({ ...f, document: null })); }} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Transaction Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setForm(f => ({ ...f, type: "credit" }))}
                    className={`py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border-2 transition-all ${
                      form.type === "credit" ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "border-border text-muted-foreground hover:border-emerald-200"
                    }`}
                  >
                    <TrendingUp size={15} /> Credit
                  </button>
                  <button
                    onClick={() => setForm(f => ({ ...f, type: "debit" }))}
                    className={`py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border-2 transition-all ${
                      form.type === "debit" ? "bg-red-50 border-red-500 text-red-600" : "border-border text-muted-foreground hover:border-red-200"
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
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 bg-input-background"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
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
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full border border-border rounded-lg pl-7 pr-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/30 bg-input-background"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  Reference No. <span className="font-normal text-muted-foreground/60">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.reference}
                  onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
                  placeholder="INV-001, PO-012..."
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 bg-input-background"
                />
              </div>

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
                      {form.document.mimeType.startsWith("image/")
                        ? <Image size={15} className="text-blue-500" />
                        : <FileText size={15} className="text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{form.document.name}</div>
                      <div className="text-[10px] text-muted-foreground">{(form.document.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <button
                      onClick={() => setForm(f => ({ ...f, document: null }))}
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
                    {form.type === "credit" ? "Adding Credit" : "Adding Debit"}
                  </span>
                  <span className={`font-mono font-bold ${form.type === "credit" ? "text-emerald-700" : "text-red-600"}`}>
                    {form.type === "credit" ? "+" : "-"}₹{parseFloat(form.amount || "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => { setShowForm(false); setForm(f => ({ ...f, document: null })); }} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={addTransaction}
                disabled={!form.description || !form.amount}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: activeAccount.color }}
              >
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
