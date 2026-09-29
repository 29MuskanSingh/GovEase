const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const profileApi = {
  get: async (userId) => {
    const res = await fetch(`${API_BASE}/profile/${userId}`, { headers: getAuthHeaders() });
    return res.json();
  },
  create: async (data) => {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  update: async (userId, data) => {
    const res = await fetch(`${API_BASE}/profile/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  upsertProfile: async (data) => {
    const res = await fetch(`${API_BASE}/profile/upsert`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  createAddress: async (data) => {
    const res = await fetch(`${API_BASE}/profile/address`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateAddress: async (userId, data) => {
    const res = await fetch(`${API_BASE}/profile/address/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  upsertAddress: async (data) => {
    const res = await fetch(`${API_BASE}/profile/address/upsert`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  }
};

export const educationApi = {
  getAll: async (userId) => {
    const res = await fetch(`${API_BASE}/education/${userId}`, { headers: getAuthHeaders() });
    return res.json();
  },
  create: async (data) => {
    const res = await fetch(`${API_BASE}/education`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  update: async (id, data) => {
    const res = await fetch(`${API_BASE}/education/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  delete: async (id) => {
    const res = await fetch(`${API_BASE}/education/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  }
};

export const experienceApi = {
  getAll: async (userId) => {
    const res = await fetch(`${API_BASE}/experience/${userId}`, { headers: getAuthHeaders() });
    return res.json();
  },
  create: async (data) => {
    const res = await fetch(`${API_BASE}/experience`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  update: async (id, data) => {
    const res = await fetch(`${API_BASE}/experience/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  delete: async (id) => {
    const res = await fetch(`${API_BASE}/experience/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  }
};

export const skillApi = {
  getAll: async (userId) => {
    const res = await fetch(`${API_BASE}/skill/${userId}`, { headers: getAuthHeaders() });
    return res.json();
  },
  create: async (data) => {
    const res = await fetch(`${API_BASE}/skill`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  update: async (id, data) => {
    const res = await fetch(`${API_BASE}/skill/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  delete: async (id) => {
    const res = await fetch(`${API_BASE}/skill/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  }
};

export const identityApi = {
  get: async (userId) => {
    const res = await fetch(`${API_BASE}/identity/${userId}`, { headers: getAuthHeaders() });
    return res.json();
  },
  create: async (data) => {
    const res = await fetch(`${API_BASE}/identity`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  addId: async (userId, data) => {
    const res = await fetch(`${API_BASE}/identity/${userId}/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  removeId: async (userId, idType) => {
    const res = await fetch(`${API_BASE}/identity/${userId}/${idType}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  }
};

export const documentApi = {
  getTypes: async () => {
    const res = await fetch(`${API_BASE}/document/types`, { headers: getAuthHeaders() });
    return res.json();
  },
  getStats: async (userId) => {
    const res = await fetch(`${API_BASE}/document/stats/${userId}`, { headers: getAuthHeaders() });
    return res.json();
  },
  getAll: async (userId) => {
    const res = await fetch(`${API_BASE}/document/${userId}`, { headers: getAuthHeaders() });
    return res.json();
  },
  getByType: async (userId, typeId) => {
    const res = await fetch(`${API_BASE}/document/${userId}/type/${typeId}`, { headers: getAuthHeaders() });
    return res.json();
  },
  upload: async (formData) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/document`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    return res.json();
  },
  delete: async (id) => {
    const res = await fetch(`${API_BASE}/document/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },
  getFileUrl: (id) => {
    const token = localStorage.getItem('token');
    return `${API_BASE}/document/file/${id}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  }
};

export const preferenceApi = {
  get: async (userId) => {
    const res = await fetch(`${API_BASE}/preference/${userId}`, { headers: getAuthHeaders() });
    return res.json();
  },
  create: async (data) => {
    const res = await fetch(`${API_BASE}/preference`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  update: async (userId, data) => {
    const res = await fetch(`${API_BASE}/preference/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  }
};

export const certificationApi = {
  getAll: async (userId) => {
    const res = await fetch(`${API_BASE}/certification/${userId}`, { headers: getAuthHeaders() });
    return res.json();
  },
  getOne: async (userId, id) => {
    const res = await fetch(`${API_BASE}/certification/${userId}/${id}`, { headers: getAuthHeaders() });
    return res.json();
  },
  create: async (data) => {
    const res = await fetch(`${API_BASE}/certification`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  update: async (id, data) => {
    const res = await fetch(`${API_BASE}/certification/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  delete: async (id) => {
    const res = await fetch(`${API_BASE}/certification/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },
  uploadImage: async (formData) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/certification/upload-image`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    return res.json();
  },
  getImage: (id) => `${API_BASE}/certification/image/${id}`,
  validateUrl: async (url) => {
    const res = await fetch(`${API_BASE}/certification/validate-url`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ url })
    });
    return res.json();
  }
};
