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

axiosInstance.interceptors.response.use((response) => {
  if (response.data && response.data.success !== undefined && response.data.data !== undefined) {
    return { ...response, data: response.data.data };
  }
  return response;
});

