import api from './axios';

// POST /auth/login  →  { token, usuario: { id, nombre, email, rol } }
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

// POST /auth/logout
  export const logout = async () => {
  await api.post('/auth/logout');
};

// GET /auth/me  →  usuario actual
export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
