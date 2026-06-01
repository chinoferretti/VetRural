import api from './axios';

export const getEstablecimientosDelUsuario = async (usuarioId) => {
  const { data } = await api.get(`/usuarios/${usuarioId}/establecimientos`);
  return data;
};

export const crearEstablecimiento = async (nombre) => {
  const { data } = await api.post('/establecimientos', { nombre });
  return data;
};

export const asociarUsuario = async (establecimientoId, usuarioId) => {
  await api.post(`/establecimientos/${establecimientoId}/usuarios/${usuarioId}`);
};

export const getMetricasEstablecimiento = async (establecimientoId, { sexo, lote } = {}) => {
  const params = {};
  if (sexo && sexo !== 'Todos') params.sexo = sexo;
  if (lote && lote !== 'Todos') params.lote = lote;
  const { data } = await api.get(`/establecimientos/${establecimientoId}/metricas`, { params });
  return data;
};
