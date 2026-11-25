import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('spotlyn_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const mutatingMethods = new Set(['post', 'put', 'patch', 'delete']);
const inflightMutations = new Map();

api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase();
  if (!mutatingMethods.has(method)) return config;

  let payloadKey = '';
  if (typeof config.data === 'string') {
    payloadKey = config.data;
  } else if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    payloadKey = `[form-data:${Array.from(config.data.keys()).join(',')}]`;
  } else if (config.data) {
    try {
      payloadKey = JSON.stringify(config.data);
    } catch {
      payloadKey = String(config.data);
    }
  }

  const requestKey = `${method}:${config.url || ''}:${payloadKey}`;
  const existing = inflightMutations.get(requestKey);
  let idempotencyKey;

  if (existing) {
    idempotencyKey = existing.idempotencyKey;
  } else {
    idempotencyKey =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  config.headers['Idempotency-Key'] = idempotencyKey;
  config.headers['X-Spotlyn-Deduplicated'] = existing ? 'true' : 'false';

  const originalAdapter = axios.getAdapter(config.adapter || api.defaults.adapter);
  config.adapter = async (adapterConfig) => {
    const current = inflightMutations.get(requestKey);
    if (current) return current.promise;

    const promise = Promise.resolve(originalAdapter(adapterConfig));
    inflightMutations.set(requestKey, { promise, idempotencyKey });

    try {
      return await promise;
    } finally {
      window.setTimeout(() => {
        if (inflightMutations.get(requestKey)?.promise === promise)
          inflightMutations.delete(requestKey);
      }, 650);
    }
  };

  return config;
});

export default api;
