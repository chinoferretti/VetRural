import api from './axios';
import veterinariosData from '../data/veterinarios.json';

// ── GET /usuarios?rol=veterinario ─────────────────────────────────────────────
// Devuelve los veterinarios registrados en el sistema que pueden ser asignados
// como responsables de una sesión.
export async function getVeterinarios() {
  try {
    const { data } = await api.get('/usuarios/veterinarios');
    return data;
  } catch {
    return veterinariosData; // fallback offline
  }
}

// ── GET /establecimientos/:id/miembros ────────────────────────────────────────
// Devuelve los miembros activos del establecimiento con su rol.
export async function getMiembros(establecimientoId) {
  try {
    const { data } = await api.get(`/establecimientos/${establecimientoId}/miembros`);
    return data;
  } catch {
    // Mock offline: miembros hardcoded del establecimiento de demo
    return [
      { id: 1, nombre: 'Juan Pereyra', email: 'productor@campo.com', rol: 'productor', estado: 'activo' },
      { id: 2, nombre: 'Dr. Carlos Ramírez', email: 'vet@vetrural.com', rol: 'veterinario', estado: 'activo' },
      { id: 3, nombre: 'Pedro Martínez', email: 'peon@campo.com', rol: 'otros', estado: 'activo' },
    ];
  }
}

// ── GET /establecimientos/:id/invitaciones ────────────────────────────────────
export async function getInvitaciones(establecimientoId) {
  try {
    const { data } = await api.get(`/establecimientos/${establecimientoId}/invitaciones`);
    return data;
  } catch {
    // Mock: invitaciones pendientes de ejemplo
    return [
      { id: 'inv-1', email: 'nuevo@campo.com', fechaEnvio: '2026-05-01', estado: 'pendiente' },
    ];
  }
}

// ── POST /establecimientos/:id/invitaciones ───────────────────────────────────
// Envía una invitación por email al usuario. El receptor recibe un link con
// token para unirse al establecimiento.
export async function invitar(establecimientoId, email) {
  try {
    const { data } = await api.post(`/establecimientos/${establecimientoId}/invitaciones`, { email });
    return data;
  } catch (error) {
    if (!navigator.onLine) throw new Error('Sin conexión. La invitación se enviará cuando vuelva a conectarse.');
    throw error;
  }
}

// ── DELETE /establecimientos/:id/miembros/:usuarioId ─────────────────────────
export async function removerMiembro(establecimientoId, usuarioId) {
  return api.delete(`/establecimientos/${establecimientoId}/miembros/${usuarioId}`);
}

// ── DELETE /establecimientos/:id/invitaciones/:invId ─────────────────────────
export async function cancelarInvitacion(establecimientoId, invId) {
  return api.delete(`/establecimientos/${establecimientoId}/invitaciones/${invId}`);
}
