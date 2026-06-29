import { useState, useEffect } from 'react';
import { accountService } from '../services/api';

export const useAccountsController = (isAuthenticated: boolean) => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountService.getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error("Failed to fetch accounts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAccounts();
    } else {
      setAccounts([]);
    }
  }, [isAuthenticated]);

  const addTransaction = async (accountId: string, transaction: any) => {
    try {
      const newTx = await accountService.addTransaction(accountId, transaction);
      setAccounts(prev => prev.map(a =>
        a.id === accountId ? { ...a, transactions: [...a.transactions, newTx] } : a
      ));
    } catch (error) {
      console.error("Failed to add transaction", error);
    }
  };

  const deleteTransaction = async (accountId: string, txId: string) => {
    try {
      await accountService.deleteTransaction(accountId, txId);
      setAccounts(prev => prev.map(a =>
        a.id === accountId ? { ...a, transactions: a.transactions.filter((t: any) => t.id !== txId) } : a
      ));
    } catch (error) {
      console.error("Failed to delete transaction", error);
    }
  };

  const saveOpeningBalance = async (accountId: string, value: number) => {
    try {
      if (isNaN(value)) return;
      await accountService.updateOpeningBalance(accountId, value);
      setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, openingBalance: value } : a));
    } catch (error) {
      console.error("Failed to update opening balance", error);
    }
  };

  const addAccount = async (accountData: any) => {
    try {
      const newAccount = await accountService.createAccount(accountData);
      setAccounts(prev => [...prev, newAccount]);
      return newAccount.id;
    } catch (error) {
      console.error("Failed to add account", error);
    }
  };

  const editAccountName = async (accountId: string, newName: string) => {
    try {
      if (!newName.trim()) return;
      await accountService.updateAccountName(accountId, newName);
      setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, name: newName } : a));
    } catch (error) {
      console.error("Failed to update account name", error);
    }
  };

  const addProject = async (accountId: string, projectName: string) => {
    try {
      if (!projectName.trim()) return;
      const updatedProjects = await accountService.addProject(accountId, projectName);
      setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, projects: updatedProjects } : a));
    } catch (error) {
      console.error("Failed to add project", error);
    }
  };

  const editTransaction = async (accountId: string, txId: string, transaction: any) => {
    try {
      const updatedTx = await accountService.updateTransaction(accountId, txId, transaction);
      setAccounts(prev => prev.map(a =>
        a.id === accountId ? {
          ...a,
          transactions: a.transactions.map((t: any) => t.id === txId ? updatedTx : t)
        } : a
      ));
    } catch (error) {
      console.error("Failed to edit transaction", error);
    }
  };

  const editAccount = async (accountId: string, accountData: any) => {
    try {
      const updatedAccount = await accountService.updateAccount(accountId, accountData);
      setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, ...updatedAccount } : a));
    } catch (error) {
      console.error("Failed to update account", error);
    }
  };

  const deleteAccount = async (accountId: string) => {
    try {
      await accountService.deleteAccount(accountId);
      setAccounts(prev => prev.filter(a => a.id !== accountId));
    } catch (error) {
      console.error("Failed to delete account", error);
    }
  };

  return {
    accounts,
    loading,
    addAccount,
    editAccount,
    deleteAccount,
    editAccountName,
    addProject,
    addTransaction,
    editTransaction,
    deleteTransaction,
    saveOpeningBalance
  };
};
