const API_BASE = '/api/admin';

const ApiError = class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
};

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const token = localStorage.getItem('accessToken');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (err) {
    throw new ApiError('Network error. Please check your connection.', 0, null);
  }

  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json().catch(() => null);
  } else {
    data = await response.text().catch(() => null);
  }

  if (!response.ok) {
    const message = data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, data);
  }

  return data;
}

function listRequest(endpoint, params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });
  return request(`${endpoint}?${searchParams.toString()}`);
}

export const adminApi = {
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
    refresh: () => request('/auth/refresh', { method: 'POST', body: { refreshToken: localStorage.getItem('refreshToken') } }),
    me: () => request('/auth/me'),
    logout: () => request('/auth/logout', { method: 'POST' }),
    changePassword: (data) => request('/auth/change-password', { method: 'POST', body: data }),
  },

  dashboard: {
    getMetrics: () => request('/dashboard/metrics'),
  },

  users: {
    list: (params = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value);
        }
      });
      return request(`/users?${searchParams.toString()}`);
    },
    get: (id) => request(`/users/${id}`),
    update: (id, data) => request(`/users/${id}`, { method: 'PATCH', body: data }),
    resetPassword: (id) => request(`/users/${id}/reset-password`, { method: 'POST' }),
  },

  eligibilityRules: {
    list: (params = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value);
        }
      });
      return request(`/eligibility-rules?${searchParams.toString()}`);
    },
    get: (id) => request(`/eligibility-rules/${id}`),
    create: (data) => request('/eligibility-rules', { method: 'POST', body: data }),
    update: (id, data) => request(`/eligibility-rules/${id}`, { method: 'PATCH', body: data }),
    delete: (id) => request(`/eligibility-rules/${id}`, { method: 'DELETE' }),
  },

  exams: {
    list: (params = {}) => listRequest('/exams', params),
    get: (id) => request(`/exams/${id}`),
    create: (data) => request('/exams', { method: 'POST', body: data }),
    update: (id, data) => request(`/exams/${id}`, { method: 'PATCH', body: data }),
    delete: (id) => request(`/exams/${id}`, { method: 'DELETE' }),
  },

  forms: {
    list: (params = {}) => listRequest('/forms', params),
    get: (id) => request(`/forms/${id}`),
    create: (data) => request('/forms', { method: 'POST', body: data }),
    update: (id, data) => request(`/forms/${id}`, { method: 'PATCH', body: data }),
    delete: (id) => request(`/forms/${id}`, { method: 'DELETE' }),
    uploadImage: (file) => {
      const token = localStorage.getItem('accessToken');
      const headers = {
        Authorization: token ? `Bearer ${token}` : undefined
      };
      const form = new FormData();
      form.append('file', file);
      return fetch(`${API_BASE}/forms/upload-image`, {
        method: 'POST',
        headers,
        body: form
      }).then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          const message = data?.message || data?.error || `Request failed with status ${response.status}`;
          throw new ApiError(message, response.status, data);
        }
        return data;
      });
    }
  },

  opportunities: {
    list: (params = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value);
        }
      });
      return request(`/opportunities?${searchParams.toString()}`);
    },
    get: (id) => request(`/opportunities/${id}`),
    create: (data) => request('/opportunities', { method: 'POST', body: data }),
    update: (id, data) => request(`/opportunities/${id}`, { method: 'PATCH', body: data }),
    delete: (id) => request(`/opportunities/${id}`, { method: 'DELETE' }),
  },

  auditLogs: {
    list: (params = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value);
        }
      });
      return request(`/audit-logs?${searchParams.toString()}`);
    },
  },
};

export { ApiError };