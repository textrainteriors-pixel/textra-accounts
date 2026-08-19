import type { Account } from "./types";

export function calcBalance(account: Account): number {
  return account.transactions.reduce(
    (bal, tx) => (tx.type === "credit" ? bal + tx.amount : bal - tx.amount),
    account.openingBalance
  );
}
export function calcTotalCredit(account: Account): number {
  return account.transactions.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
}
export function calcTotalDebit(account: Account): number {
  return account.transactions.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0);
}
export function fmt(n: number): string {
  const abs = Math.abs(n);
  const f = abs.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n < 0 ? `(${f})` : f;
}
export function fmtSign(n: number): string {
  return n < 0
    ? `-₹${Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
    : `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

export const today = new Date().toISOString().split("T")[0];
