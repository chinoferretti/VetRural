// Mock de invitaciones recibidas por el usuario (de establecimientos a los que fue invitado)
const INVITACIONES_INICIALES = [
  {
    id: 'inv-a',
    establecimiento: { id: 10, nombre: 'La Patagonia',     ubicacion: 'Neuquén'       },
    remitente: 'María García',
    fecha: '2026-05-15',
  },
  {
    id: 'inv-b',
    establecimiento: { id: 11, nombre: 'El Rancho Grande', ubicacion: 'Mendoza'       },
    remitente: 'Roberto Sánchez',
    fecha: '2026-05-10',
  },
];

function key(userId) { return `vetrural_invitaciones_${userId}`; }

export function getInvitaciones(userId) {
  try {
    const stored = localStorage.getItem(key(userId));
    if (stored !== null) return JSON.parse(stored);
    // Primera vez: sembrar con mock
    localStorage.setItem(key(userId), JSON.stringify(INVITACIONES_INICIALES));
    return INVITACIONES_INICIALES;
  } catch { return []; }
}

export function removerInvitacion(userId, invId) {
  const lista = getInvitaciones(userId);
  localStorage.setItem(key(userId), JSON.stringify(lista.filter(i => i.id !== invId)));
}
