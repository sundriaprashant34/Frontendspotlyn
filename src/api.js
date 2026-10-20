import axios from 'axios';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});
api.interceptors.request.use((c) => {
  const t = localStorage.getItem('spotlyn_token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
export default api;
