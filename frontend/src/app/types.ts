export type TransactionType = "credit" | "debit";

export interface AttachedDoc {
  name: string;
  dataUrl: string;
  mimeType: string;
  size: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  type: TransactionType;
  amount: number;
  reference?: string;
  accountId?: string;
  document?: AttachedDoc;
}

export interface Account {
  id: string;
  name: string;
  type: "company" | "overdraft";
  openingBalance: number;
  transactions: Transaction[];
  color: string;
  bgColor: string;
  createdAt?: string;
  projects?: string[];
}

export interface ConfirmModalState {
  show: boolean;
  title: string;
  message: string;
  confirmText?: string;
  type?: "danger" | "warning" | "info";
  onConfirm: () => void;
}
