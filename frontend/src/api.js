// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/', // Ajuste conforme necessário
});

// Interceptor para incluir o token nas requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Armazene o token no localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
