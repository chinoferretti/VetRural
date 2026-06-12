import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  getEstablecimientosDelUsuario,
  crearEstablecimiento,
  asociarUsuario,
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

  useEffect(() => {
    setLista([]);
    setSeleccionado(null);
    if (!usuario) return;

    setCargando(true);
    getEstablecimientosDelUsuario(usuario.id)
      .then(data => {
        const locales = cargarLocal(usuario.id);
        const lista = data.map(e => ({
          ...e,
          ubicacion: locales.find(l => l.id === e.id)?.ubicacion || '',
        }));
        setLista(lista);
        persistirLocal(usuario.id, lista);
      })
      .catch(() => {
        // Sin conexión: usar caché local
        setLista(cargarLocal(usuario.id));
      })
      .finally(() => setCargando(false));
  }, [usuario?.id]);

  const seleccionar = (est) => setSeleccionado(est);

  const crear = async ({ nombre, ubicacion }) => {
    const nuevo = await crearEstablecimiento(nombre);
    await asociarUsuario(nuevo.id, usuario.id);
    const conUbicacion = { ...nuevo, ubicacion: ubicacion || '' };
    const nueva = [...lista, conUbicacion];
    setLista(nueva);
    persistirLocal(usuario.id, nueva);
    return conUbicacion;
  };

  const unirse = (establecimiento) => {
    if (lista.find(e => e.id === establecimiento.id)) return;
    const nueva = [...lista, establecimiento];
    setLista(nueva);
    persistirLocal(usuario.id, nueva);
    setSeleccionado(establecimiento);
  };

  const eliminar = (id) => {
    const nueva = lista.filter(e => e.id !== id);
    setLista(nueva);
    persistirLocal(usuario.id, nueva);
    if (seleccionado?.id === id) setSeleccionado(null);
  };

  const reemplazarEstablecimiento = (oldId, nuevoId) => {
    const nuevaLista = lista.map(e => e.id === oldId ? { ...e, id: nuevoId } : e);
    setLista(nuevaLista);
    if (seleccionado?.id === oldId) setSeleccionado(s => ({ ...s, id: nuevoId }));
    persistirLocal(usuario.id, nuevaLista);
  };

  return (
    <EstablecimientoContext.Provider value={{ lista, seleccionado, seleccionar, crear, unirse, eliminar, reemplazarEstablecimiento, cargando }}>
      {children}
    </EstablecimientoContext.Provider>
  );
}

export function useEstablecimiento() {
  return useContext(EstablecimientoContext);
}
