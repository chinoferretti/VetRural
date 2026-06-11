import api from '../api/axios';

async function buscarPorEmail(email) {
  const { data: todos } = await api.get('/usuarios');
  return todos.find(u => u.email === email) ?? null;
}

/**
 * Devuelve el idUsuario real del backend para el usuario de sesión.
 * Si no existe lo crea como Veterinario.
 * Lanza un error si el backend no está disponible.
 */
export async function sincronizarUsuario(usuario) {
  const match = await buscarPorEmail(usuario.email);
  if (match) return match.idUsuario;

  const partes = (usuario.nombre || '').trim().split(' ');
  try {
    const { data: nuevo } = await api.post('/usuarios', {
      nombre:     partes[0] || 'Usuario',
      apellido:   partes.slice(1).join(' ') || '-',
      email:      usuario.email,
      contrasena: 'vetrural2026',
      tipo:       'Veterinario',
    });
    return nuevo.idUsuario;
  } catch (errPost) {
    // Si falla por email duplicado (condición de carrera), buscar de nuevo
    const yaCreado = await buscarPorEmail(usuario.email);
    if (yaCreado) return yaCreado.idUsuario;
    throw errPost;
  }
}
