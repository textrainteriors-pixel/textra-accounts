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

const handleResponse = async (response: Response, defaultErrorMsg: string) => {
  if (!response.ok) {
    if (response.status === 401) {
      authService.logout();
      window.location.href = '/';
      throw new Error('Your session expired. Please log in again.');
    }
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || defaultErrorMsg);
  }
  return response.json();
};

export const accountService = {
  getAccounts: async () => {
    const response = await fetch(API_URL, { headers: getAuthHeaders() });
    return handleResponse(response, 'Failed to fetch accounts');
  },

  createAccount: async (accountData: any) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(accountData),
    });
    return handleResponse(response, 'Failed to create account');
  },

  updateAccountName: async (id: string, name: string) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });
    return handleResponse(response, 'Failed to update account name');
  },

  updateAccount: async (id: string, accountData: any) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(accountData),
    });
    return handleResponse(response, 'Failed to update account');
  },

  deleteAccount: async (id: string) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response, 'Failed to delete account');
  },

  seedAccounts: async () => {
    const response = await fetch(`${API_URL}/seed`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response, 'Failed to seed accounts');
  },

  updateOpeningBalance: async (id: string, openingBalance: number) => {
    const response = await fetch(`${API_URL}/${id}/balance`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ openingBalance }),
    });
    return handleResponse(response, 'Failed to update balance');
  },

  addTransaction: async (accountId: string, transaction: any) => {
    const response = await fetch(`${API_URL}/${accountId}/transactions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(transaction),
    });
    return handleResponse(response, 'Failed to add transaction');
  },

  deleteTransaction: async (accountId: string, txId: string) => {
    const response = await fetch(`${API_URL}/${accountId}/transactions/${txId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response, 'Failed to delete transaction');
  },

  updateTransaction: async (accountId: string, txId: string, transaction: any) => {
    const response = await fetch(`${API_URL}/${accountId}/transactions/${txId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(transaction)
    });
    return handleResponse(response, 'Failed to update transaction');
  },

  addProject: async (accountId: string, projectName: string) => {
    const response = await fetch(`${API_URL}/${accountId}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ projectName }),
    });
    return handleResponse(response, 'Failed to add project');
  }
};

export const reminderService = {
  getReminders: async () => {
    const url = API_URL.replace('/accounts', '/reminders');
    const response = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse(response, 'Failed to fetch reminders');
  },

  createReminder: async (reminderData: { text: string; date: string; repeatMonthly?: boolean }) => {
    const url = API_URL.replace('/accounts', '/reminders');
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reminderData),
    });
    return handleResponse(response, 'Failed to create reminder');
  },

  updateReminder: async (id: string, reminderData: { text?: string; date?: string; completed?: boolean; repeatMonthly?: boolean }) => {
    const url = API_URL.replace('/accounts', '/reminders');
    const response = await fetch(`${url}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(reminderData),
    });
    return handleResponse(response, 'Failed to update reminder');
  },

  deleteReminder: async (id: string) => {
    const url = API_URL.replace('/accounts', '/reminders');
    const response = await fetch(`${url}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response, 'Failed to delete reminder');
  },
};
