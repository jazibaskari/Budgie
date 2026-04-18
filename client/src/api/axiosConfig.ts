import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
  withCredentials: true, 
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = error.config?.url?.includes('/auth');
    const isMonzoRequest = error.config?.url?.includes('/monzo');

    if (error.response && error.response.status === 401) {
      if (!isAuthRequest && !isMonzoRequest && window.location.pathname !== '/login') {
        console.warn("Session expired. Redirecting to login...");
        window.location.href = '/login'; 
      }
    }

    if (isMonzoRequest) {
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;