function key(userId) { return `vetrural_invitaciones_${userId}`; }

export function getInvitaciones(userId) {
  try {
    const stored = localStorage.getItem(key(userId));
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export function removerInvitacion(userId, invId) {
  const lista = getInvitaciones(userId);
  localStorage.setItem(key(userId), JSON.stringify(lista.filter(i => i.id !== invId)));
}
