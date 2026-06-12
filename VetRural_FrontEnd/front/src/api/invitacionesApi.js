function key(userId) { return `vetrural_invitaciones_${userId}`; }
function keyMiembros(estId) { return `vetrural_miembros_${estId}`; }

export function getInvitaciones(userId) {
  try {
    const stored = localStorage.getItem(key(userId));
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export function guardarInvitacion(userId, invitacion) {
  const lista = getInvitaciones(userId);
  localStorage.setItem(key(userId), JSON.stringify([...lista, invitacion]));
}

export function removerInvitacion(userId, invId) {
  const lista = getInvitaciones(userId);
  localStorage.setItem(key(userId), JSON.stringify(lista.filter(i => i.id !== invId)));
}

export function getMiembrosLocales(estId) {
  try { return JSON.parse(localStorage.getItem(keyMiembros(estId)) || '[]'); } catch { return []; }
}

export function agregarMiembro(estId, miembro) {
  const lista = getMiembrosLocales(estId);
  if (lista.find(m => m.id === miembro.id)) return;
  localStorage.setItem(keyMiembros(estId), JSON.stringify([...lista, miembro]));
}

export function removerMiembroLocal(estId, userId) {
  const lista = getMiembrosLocales(estId);
  localStorage.setItem(keyMiembros(estId), JSON.stringify(lista.filter(m => m.id !== userId)));
}
