import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Account, Transaction } from "./types";

export function generateMonthlyPDF(accounts: Account[], month: number, year: number) {
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
        head: [["Date", "Description", acc.type === "company" ? "Project" : "Reference", "Credit (Rs.)", "Debit (Rs.)", "Balance (Rs.)"]],
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
