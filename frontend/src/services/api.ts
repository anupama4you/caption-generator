import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Server status tracking
type StatusListener = (isDown: boolean) => void;
const listeners: Set<StatusListener> = new Set();
let serverDown = false;

function setServerDown(down: boolean) {
  if (serverDown !== down) {
    serverDown = down;
    listeners.forEach(fn => fn(down));
  }
}

export function onServerStatusChange(listener: StatusListener) {
  listeners.add(listener);
  listener(serverDown); // Send current state immediately
  return () => { listeners.delete(listener); };
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh + server down detection
api.interceptors.response.use(
  (response) => {
    // Server responded successfully - mark as up
    setServerDown(false);
    return response;
  },
  async (error) => {
    // Detect server down: no response (network error) or 502/503/504
    const status = error.response?.status;
    if (!error.response || status === 502 || status === 503 || status === 504) {
      setServerDown(true);
      return Promise.reject(error);
    }

    // Server is reachable (returned an error response) - mark as up
    setServerDown(false);

    const originalRequest = error.config;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
