import api from './axios';

export async function getInvitacionesPendientes(usuarioId) {
  try {
    const { data } = await api.get('/invitaciones', { params: { usuarioId } });
    return data ?? [];
  } catch { return []; }
}

export async function crearInvitacion(establecimientoId, usuarioId, remitenteId) {
  const res = await api.post('/invitaciones', { establecimientoId, usuarioId, remitenteId });
  return res.data;
}

export async function aceptarInvitacion(invitacionId) {
  await api.post(`/invitaciones/${invitacionId}/aceptar`);
}

export async function rechazarInvitacion(invitacionId) {
  await api.delete(`/invitaciones/${invitacionId}`);
}

export async function getInvitacionesPorEstablecimiento(establecimientoId) {
  try {
    const { data } = await api.get(`/invitaciones/establecimiento/${establecimientoId}`);
    return data ?? [];
  } catch { return []; }
}
