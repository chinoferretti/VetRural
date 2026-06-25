import api from './axios';

// POST /auth/login  →  { idUsuario, nombre, apellido, email, tipo }
export const loginApi = async (email, password) => {
  const response = await api.post('/auth/login', { email, contrasena: password });
  return response.data;
};
