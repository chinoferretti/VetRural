import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  getEstablecimientosDelUsuario,
  crearEstablecimiento,
  asociarUsuario,
} from '../api/establecimientosApi';
import { agregarMiembro, removerMiembroLocal } from '../api/invitacionesApi';

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
        const backendIds = new Set(data.map(e => String(e.id)));
        const fromBackend = data.map(e => {
          const local = locales.find(l => String(l.id) === String(e.id));
          return {
            ...e,
            ubicacion:  local?.ubicacion  ?? '',
            esInvitado: local?.esInvitado ?? false,
          };
        });
        // Preservar establecimientos aceptados localmente que el backend no conoce
        const soloLocales = locales.filter(l => !backendIds.has(String(l.id)) && l.esInvitado);
        const lista = [...fromBackend, ...soloLocales];
        setLista(lista);
        persistirLocal(usuario.id, lista);
      })
      .catch(() => {
        setLista(cargarLocal(usuario.id));
      })
      .finally(() => setCargando(false));
  }, [usuario?.id]);

  const seleccionar = (est) => setSeleccionado(est);

  const crear = async ({ nombre, ubicacion }) => {
    const nuevo = await crearEstablecimiento(nombre);
    await asociarUsuario(nuevo.id, usuario.id);
    const conUbicacion = { ...nuevo, ubicacion: ubicacion || '', esInvitado: false };
    const nueva = [...lista, conUbicacion];
    setLista(nueva);
    persistirLocal(usuario.id, nueva);
    return conUbicacion;
  };

  const unirse = (establecimiento) => {
    if (lista.find(e => e.id === establecimiento.id)) return;
    const conFlag = { ...establecimiento, esInvitado: true };
    const nueva = [...lista, conFlag];
    setLista(nueva);
    persistirLocal(usuario.id, nueva);
    setSeleccionado(conFlag);
    agregarMiembro(establecimiento.id, {
      id:     usuario.id,
      nombre: usuario.nombre,
      email:  usuario.email,
      rol:    usuario.rol,
    });
  };

  const eliminar = (id) => {
    const nueva = lista.filter(e => e.id !== id);
    setLista(nueva);
    persistirLocal(usuario.id, nueva);
    if (seleccionado?.id === id) setSeleccionado(null);
  };

  const salir = (estId) => {
    removerMiembroLocal(estId, usuario.id);
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
    <EstablecimientoContext.Provider value={{ lista, seleccionado, seleccionar, crear, unirse, eliminar, salir, reemplazarEstablecimiento, cargando }}>
      {children}
    </EstablecimientoContext.Provider>
  );
}

export function useEstablecimiento() {
  return useContext(EstablecimientoContext);
}
