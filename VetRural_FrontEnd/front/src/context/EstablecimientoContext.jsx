import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getEstablecimientosDelUsuario,
  crearEstablecimiento,
  asociarUsuario,
  removerMiembro,
} from '../api/establecimientosApi';

function storageKey(userId) { return `vetrural_establecimientos_${userId}`; }
function cargarLocal(userId) {
  try { return JSON.parse(localStorage.getItem(storageKey(userId)) || '[]'); } catch { return []; }
}
function persistirLocal(userId, lista) {
  localStorage.setItem(storageKey(userId), JSON.stringify(lista));
}

const EstablecimientoContext = createContext(null);

export function EstablecimientoProvider({ children }) {
  const { usuario } = useAuth();
  const [lista,        setLista]        = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [cargando,     setCargando]     = useState(false);

  const cargarDesdeBackend = useCallback((userId) => {
    setCargando(true);
    return getEstablecimientosDelUsuario(userId)
      .then(data => {
        const nueva = data.map(e => ({ ...e, ubicacion: '', esInvitado: false }));
        setLista(nueva);
        persistirLocal(userId, nueva);
        return nueva;
      })
      .catch(() => {
        const local = cargarLocal(userId);
        setLista(local);
        return local;
      })
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    setLista([]);
    setSeleccionado(null);
    if (!usuario) return;
    cargarDesdeBackend(usuario.id);
  }, [usuario?.id, cargarDesdeBackend]);

  const recargar = () => usuario && cargarDesdeBackend(usuario.id);

  const seleccionar = (est) => setSeleccionado(est);

  const crear = async ({ nombre, ubicacion }) => {
    const nuevo = await crearEstablecimiento(nombre);
    try { await asociarUsuario(nuevo.id, usuario.id); } catch { /* DB recién reiniciada */ }
    const conUbicacion = { ...nuevo, ubicacion: ubicacion || '', esInvitado: false };
    const nueva = [...lista, conUbicacion];
    setLista(nueva);
    persistirLocal(usuario.id, nueva);
    return conUbicacion;
  };

  const eliminar = (id) => {
    const nueva = lista.filter(e => e.id !== id);
    setLista(nueva);
    persistirLocal(usuario.id, nueva);
    if (seleccionado?.id === id) setSeleccionado(null);
  };

  const salir = async (estId) => {
    try { await removerMiembro(estId, usuario.id); } catch { /* ignorar */ }
    const nueva = lista.filter(e => e.id !== estId);
    setLista(nueva);
    persistirLocal(usuario.id, nueva);
    if (seleccionado?.id === estId) setSeleccionado(null);
  };

  const reemplazarEstablecimiento = (oldId, nuevoId) => {
    const nuevaLista = lista.map(e => e.id === oldId ? { ...e, id: nuevoId } : e);
    setLista(nuevaLista);
    if (seleccionado?.id === oldId) setSeleccionado(s => ({ ...s, id: nuevoId }));
    persistirLocal(usuario.id, nuevaLista);
  };

  return (
    <EstablecimientoContext.Provider value={{
      lista, seleccionado, seleccionar, crear, eliminar, salir,
      reemplazarEstablecimiento, recargar, cargando,
    }}>
      {children}
    </EstablecimientoContext.Provider>
  );
}

export function useEstablecimiento() {
  return useContext(EstablecimientoContext);
}
