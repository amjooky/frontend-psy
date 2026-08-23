import axios from 'axios';

// Dynamically resolve API URL at runtime to guarantee live Render backend connection
const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes('localhost')) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('vercel.app')) {
      return 'https://backend-psy-upv7.onrender.com/api/v1';
    }
    if (window.location.hostname.includes('educanet.pro')) {
      return 'https://be-psy.educanet.pro/api/v1';
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://backend-psy-upv7.onrender.com/api/v1';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Needed for cookie session rotation
});

// Auto Inject Auth Bearer tokens on each API trigger if exists in localStorage
api.interceptors.request.use(
  (config) => {
    // Ensure baseURL is always synchronized
    config.baseURL = getApiBaseUrl();
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-handle refreshing access tokens on 401 response error
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const res = await axios.post(`${getApiBaseUrl()}/auth/refresh`, {
            refreshToken,
          });
          if (res.data?.data?.accessToken) {
            localStorage.setItem('token', res.data.data.accessToken);
            localStorage.setItem('refreshToken', res.data.data.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
            return axios(originalRequest);
          }
        }
      } catch (refreshError) {
        // Clear tokens if refresh request itself returns error
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
