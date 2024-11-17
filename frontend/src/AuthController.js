// src/AuthController.js
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from './api'; // O arquivo api.js que gerencia as requisições ao backend

const AuthController = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Inicialmente null para indicar que está verificando

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verificar se o token é válido
      api
        .post('api/token/verify/', { token })
        .then(() => {
          setIsAuthenticated(true);
        })
        .catch(() => {
          setIsAuthenticated(false);
        });
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  if (isAuthenticated === null) {
    // Mostrar um indicador de carregamento enquanto verifica a autenticação
    return <div>Verificando autenticação...</div>;
  }

  if (!isAuthenticated) {
    // Redirecionar para a página de login se não estiver autenticado
    return <Navigate to="/auth/login" replace />;
  }

  // Se estiver autenticado, renderizar os componentes filhos
  return children;
};

export default AuthController;
