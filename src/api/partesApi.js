import api from './axios';

// GET /partes  →  lista de partes sanitarios
export const getPartes = async () => {
  // const response = await api.get('/partes');
  // return response.data;
};

// GET /partes/:id  →  detalle del parte
export const getParteById = async (id) => {
  // const response = await api.get(`/partes/${id}`);
  // return response.data;
};

// POST /partes  →  generar nuevo parte
export const crearParte = async (data) => {
  // const response = await api.post('/partes', data);
  // return response.data;
};

// GET /partes/:id/pdf  →  descarga PDF
export const descargarPDF = async (id) => {
  // const response = await api.get(`/partes/${id}/pdf`, { responseType: 'blob' });
  // return response.data;
};
