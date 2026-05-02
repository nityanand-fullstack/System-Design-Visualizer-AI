import axios from "axios";

const STORAGE_KEY = "sdv_admin_auth";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const { token } = JSON.parse(raw);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      /* ignore */
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEY);
    }
    return Promise.reject(err);
  }
);

export const fetchSystems = async (params = {}) => {
  const { data } = await api.get("/systems", { params });
  return data.data;
};

export const fetchSystemBySlug = async (slug) => {
  const { data } = await api.get(`/systems/${slug}`);
  return data.data;
};

export const createSystem = async (payload) => {
  const { data } = await api.post("/systems", payload);
  return data.data;
};

export const updateSystem = async (slug, payload) => {
  const { data } = await api.put(`/systems/${slug}`, payload);
  return data.data;
};

export const deleteSystem = async (slug) => {
  const { data } = await api.delete(`/systems/${slug}`);
  return data;
};

export const explainSystem = async (slug) => {
  const { data } = await api.post("/explain", { slug });
  return data;
};

export const aiSearchSystem = async (query) => {
  const { data } = await api.post("/explain/search", { query });
  return data;
};

export default api;
