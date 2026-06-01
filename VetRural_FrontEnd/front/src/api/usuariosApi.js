import api from './axios';
import veterinariosData from '../data/veterinarios.json';

// ── GET /usuarios/veterinarios ────────────────────────────────────────────────
export async function getVeterinarios() {
  try {
    const { data } = await api.get('/usuarios/veterinarios');
    return data.map(u => ({
      id:          u.idUsuario,
      nombre:      `${u.nombre} ${u.apellido}`.trim(),
      email:       u.email,
      matricula:   '',
      especialidad: 'Veterinario',
    }));
  } catch {
    return veterinariosData;
  }
}

const TIPO_A_ROL = {
  Veterinario:            'veterinario',
  Anotador:               'otros',
  Productor_Agropecuario: 'productor',
};

// ── GET /establecimientos/:id/usuarios ────────────────────────────────────────
export async function getMiembros(establecimientoId) {
  try {
    const { data } = await api.get(`/establecimientos/${establecimientoId}/usuarios`);
    return data.map(u => ({
      id:     u.idUsuario,
      nombre: `${u.nombre} ${u.apellido}`.trim(),
      email:  u.email,
      rol:    TIPO_A_ROL[u.tipo] || 'otros',
      estado: 'activo',
    }));
  } catch {
    return [];
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

// ── DELETE /establecimientos/:id/usuarios/:usuarioId ─────────────────────────
export async function removerMiembro(establecimientoId, usuarioId) {
  return api.delete(`/establecimientos/${establecimientoId}/usuarios/${usuarioId}`);
}

// ── DELETE /establecimientos/:id/invitaciones/:invId ─────────────────────────
export async function cancelarInvitacion(establecimientoId, invId) {
  return api.delete(`/establecimientos/${establecimientoId}/invitaciones/${invId}`);
}
