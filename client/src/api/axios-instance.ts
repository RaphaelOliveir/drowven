import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: process.env.VITE_API_BASE_URL || '/api',
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
