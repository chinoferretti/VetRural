import api from './axios';

// GET /animales  →  lista paginada con filtros opcionales
export const getAnimales = async (filtros = {}) => {
  // const response = await api.get('/animales', { params: filtros });
  // return response.data;
};

// GET /animales/:id  →  detalle del animal
export const getAnimalById = async (id) => {
  // const response = await api.get(`/animales/${id}`);
  // return response.data;
};

// POST /animales  →  crear nuevo animal
export const crearAnimal = async (data) => {
  // const response = await api.post('/animales', data);
  // return response.data;
};

// PUT /animales/:id  →  actualizar animal
export const actualizarAnimal = async (id, data) => {
  // const response = await api.put(`/animales/${id}`, data);
  // return response.data;
};

// DELETE /animales/:id
export const eliminarAnimal = async (id) => {
  // await api.delete(`/animales/${id}`);
};

// GET /animales/:id/historial  →  historial clínico del animal
export const getHistorialAnimal = async (id) => {
  // const response = await api.get(`/animales/${id}/historial`);
  // return response.data;
};
