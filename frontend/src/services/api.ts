import { authService } from './authService';

const API_URL = 'https://textra-accounts.onrender.com/api/accounts';
// const API_URL = 'http://localhost:5000/api/accounts';

const getAuthHeaders = (): Record<string, string> => {
  const user = authService.getCurrentUser();
  if (user && user.token) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.token}`,
    };
  }
  return { 'Content-Type': 'application/json' };
};

export const accountService = {
  getAccounts: async () => {
    const response = await fetch(API_URL, { headers: getAuthHeaders() });
    if (!response.ok) {
      if (response.status === 401) {
        authService.logout();
        // Removed window.location.reload() to prevent infinite loops
      }
      throw new Error('Failed to fetch accounts');
    }
    return response.json();
  },

  createAccount: async (accountData: any) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(accountData),
    });
    if (!response.ok) throw new Error('Failed to create account');
    return response.json();
  },

  updateAccountName: async (id: string, name: string) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to update account name');
    return response.json();
  },

  updateAccount: async (id: string, accountData: any) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(accountData),
    });
    if (!response.ok) throw new Error('Failed to update account');
    return response.json();
  },

  deleteAccount: async (id: string) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete account');
    return response.json();
  },

  seedAccounts: async () => {
    const response = await fetch(`${API_URL}/seed`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to seed accounts');
    return response.json();
  },

  updateOpeningBalance: async (id: string, openingBalance: number) => {
    const response = await fetch(`${API_URL}/${id}/balance`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ openingBalance }),
    });
    if (!response.ok) throw new Error('Failed to update balance');
    return response.json();
  },

  addTransaction: async (accountId: string, transaction: any) => {
    const response = await fetch(`${API_URL}/${accountId}/transactions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(transaction),
    });
    if (!response.ok) throw new Error('Failed to add transaction');
    return response.json();
  },

  deleteTransaction: async (accountId: string, txId: string) => {
    const response = await fetch(`${API_URL}/${accountId}/transactions/${txId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete transaction');
    return response.json();
  },

  updateTransaction: async (accountId: string, txId: string, transaction: any) => {
    const response = await fetch(`${API_URL}/${accountId}/transactions/${txId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(transaction)
    });
    if (!response.ok) throw new Error('Failed to update transaction');
    return response.json();
  },

  addProject: async (accountId: string, projectName: string) => {
    const response = await fetch(`${API_URL}/${accountId}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ projectName }),
    });
    if (!response.ok) throw new Error('Failed to add project');
    return response.json();
  }
};
