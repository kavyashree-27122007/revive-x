// ============================================================
// Client API Client
// Standard fetch wrappers with error handling
// ============================================================

const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || `Request failed with status ${res.status}`);
    }
    return json.data;
  } catch (error: any) {
    console.error(`[API Error] ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Health
  getHealth: () => request<any>('/health'),

  // Dashboard
  getSummary: () => request<any>('/dashboard/summary'),

  // Transactions & Revenue Risk
  getTransactions: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams(params).toString();
    return request<any>(`/transactions?${q}`);
  },
  getTransaction: (id: string) => request<any>(`/transactions/${id}`),
  getRiskEvents: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams(params).toString();
    return request<any>(`/transactions/risk-events?${q}`);
  },

  // Recovery Engine & What-If Simulator
  analyzeTransaction: (transactionId: string) =>
    request<any>('/recovery/analyze', {
      method: 'POST',
      body: JSON.stringify({ transactionId }),
    }),
  runBatchRecovery: (limit: number = 2000) =>
    request<any>('/recovery/run', {
      method: 'POST',
      body: JSON.stringify({ limit }),
    }),
  simulateRecovery: (limit: number = 3000) =>
    request<any>('/recovery/simulate', {
      method: 'POST',
      body: JSON.stringify({ limit }),
    }),
  executeRecovery: (transactionId: string, actionId?: string) =>
    request<any>('/recovery/execute', {
      method: 'POST',
      body: JSON.stringify({ transactionId, actionId }),
    }),
  getRecoveryResults: () => request<any>('/recovery/results'),

  // Policies
  getPolicies: () => request<any>('/policies'),
  updatePolicies: (policy: any) =>
    request<any>('/policies', {
      method: 'PUT',
      body: JSON.stringify(policy),
    }),

  // Audit
  getAuditLog: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams(params).toString();
    return request<any>(`/audit?${q}`);
  },

  // Demo Dataset
  loadDemoData: (count: number = 10000) =>
    request<any>('/demo/load', {
      method: 'POST',
      body: JSON.stringify({ count }),
    }),
  resetDemoData: () =>
    request<any>('/demo/reset', {
      method: 'DELETE',
    }),
};
