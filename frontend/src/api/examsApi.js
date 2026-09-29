const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const examsApi = {
  list: async (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });
    const res = await fetch(`${API_BASE}/exams?${searchParams.toString()}`, { headers: getAuthHeaders() });
    return res.json();
  },
  get: async (id) => {
    const res = await fetch(`${API_BASE}/exams/${id}`, { headers: getAuthHeaders() });
    return res.json();
  },
  getForm: async (id) => {
    const res = await fetch(`${API_BASE}/exams/${id}/form`, { headers: getAuthHeaders() });
    return res.json();
  }
};

export const opportunitiesApi = {
  list: async (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });
    const res = await fetch(`${API_BASE}/opportunities?${searchParams.toString()}`, { headers: getAuthHeaders() });
    return res.json();
  },
  get: async (id) => {
    const res = await fetch(`${API_BASE}/opportunities/${id}`, { headers: getAuthHeaders() });
    return res.json();
  },
  getForm: async (id) => {
    const res = await fetch(`${API_BASE}/opportunities/${id}/form`, { headers: getAuthHeaders() });
    return res.json();
  }
};

export default getAuthHeaders;
