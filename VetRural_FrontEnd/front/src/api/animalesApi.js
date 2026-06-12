import api from './axios';

// GET /animales  →  lista paginada con filtros opcionales
export const getAnimales = async () => {
  const response = await api.get('/bovinos');
  return response.data;
};

// GET /animales/:id  →  detalle del animal
export const getAnimalById = async (id) => {
  const response = await api.get(`/bovinos/${id}`);
  return response.data;
};

// POST /animales  →  crear nuevo animal
export const crearAnimal = async (data) => {
  const response = await api.post('/bovinos', data);
  return response.data;
};

// PUT /animales/:id  →  actualizar animal
export const actualizarAnimal = async (id, data) => {
  const response = await api.put(`/bovinos/${id}`, data);
  return response.data;
};

// DELETE /animales/:id
export const eliminarAnimal = async (id) => {
  await api.delete(`/bovinos/${id}`);
};

// GET /bovinos/lotes  →  lista de nombres de lotes existentes
export const getLotes = async () => {
  const response = await api.get('/bovinos/lotes');
  return response.data;
};

// GET /bovinos/existe?caravana=X  →  boolean
export const existeCaravana = async (caravana) => {
  const response = await api.get('/bovinos/existe', { params: { caravana } });
  return response.data;
};

// GET /establecimientos/:id/bovinos  →  animales del establecimiento seleccionado
export const getAnimalesPorEstablecimiento = async (establecimientoId) => {
  const response = await api.get(`/establecimientos/${establecimientoId}/bovinos`);
  return response.data;
};

// GET /bovinos/:caravana/historial  →  historial clínico del animal
export const getHistorialAnimal = async (caravana) => {
  const response = await api.get(`/bovinos/${caravana}/historial`);
  return response.data;
};

// PUT /bovinos/:id/dar-baja  →  soft delete con estado
export const darBajaAnimal = async (id, data) => {
  const response = await api.put(`/bovinos/${id}/dar-baja`, data);
  return response.data;
};

// GET /establecimientos/:id/bovinos/bajas  →  animales dados de baja del establecimiento
export const getAnimalesDadosDeBaja = async (establecimientoId) => {
  const response = await api.get(`/establecimientos/${establecimientoId}/bovinos/bajas`);
  return response.data;
};

// PUT /bovinos/:id/dar-alta  →  reactivar animal (estado → Activo, borra fechaBaja y motivoBaja)
export const darDeAltaAnimal = async (id) => {
  const response = await api.put(`/bovinos/${id}/dar-alta`);
  return response.data;
};
