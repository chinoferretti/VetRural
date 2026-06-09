import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  getEstablecimientosDelUsuario,
  crearEstablecimiento,
  asociarUsuario,
} from '../api/establecimientosApi';

const DEMO_IDS = new Set([1, 2, 3]);

const DEMO = [
  { id: 1, nombre: 'La Esperanza',  ubicacion: 'Córdoba'      },
  { id: 2, nombre: 'El Porvenir',   ubicacion: 'Buenos Aires' },
  { id: 3, nombre: 'San Jacinto',   ubicacion: 'Entre Ríos'   },
  { id: 4, nombre: 'Los Aromos',    ubicacion: 'Santa Fe'     },
];

const DEFAULTS_NOMBRES = [
  { nombre: 'Campo Principal',       ubicacion: '' },
  { nombre: 'Establecimiento Norte', ubicacion: '' },
  { nombre: 'Establecimiento Sur',   ubicacion: '' },
];

function crearDefaults(userId) {
  return DEFAULTS_NOMBRES.map((e, i) => ({ id: `default_${userId}_${i + 1}`, ...e }));
}

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

    if (DEMO_IDS.has(usuario.id)) {
      setLista(DEMO);
      return;
    }

    // Usuario real → traer del backend
    setCargando(true);
    getEstablecimientosDelUsuario(usuario.id)
      .then(data => {
        const locales = cargarLocal(usuario.id);
        let lista;
        if (data.length === 0) {
          // Sin establecimientos en el backend → usar los locales o crear 3 por defecto
          lista = locales.length > 0 ? locales : crearDefaults(usuario.id);
          if (locales.length === 0) persistirLocal(usuario.id, lista);
        } else {
          lista = data.map(e => ({
            ...e,
            ubicacion: locales.find(l => l.id === e.id)?.ubicacion || '',
          }));
          persistirLocal(usuario.id, lista);
        }
        setLista(lista);
      })
      .catch(() => {
        // Sin conexión: usar caché local o crear 3 por defecto
        const locales = cargarLocal(usuario.id);
        const lista = locales.length > 0 ? locales : crearDefaults(usuario.id);
        if (locales.length === 0) persistirLocal(usuario.id, lista);
        setLista(lista);
      })
      .finally(() => setCargando(false));
  }, [usuario?.id]);

  const seleccionar = (est) => setSeleccionado(est);

  const crear = async ({ nombre, ubicacion }) => {
    if (DEMO_IDS.has(usuario?.id)) {
      const nuevo = { id: Date.now(), nombre, ubicacion };
      const nueva = [...lista, nuevo];
      setLista(nueva);
      return nuevo;
    }

    // Usuario real → crear en el backend y asociar
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
    if (!DEMO_IDS.has(usuario?.id)) persistirLocal(usuario.id, nueva);
    setSeleccionado(establecimiento);
  };

  const eliminar = (id) => {
    const nueva = lista.filter(e => e.id !== id);
    setLista(nueva);
    if (!DEMO_IDS.has(usuario?.id)) persistirLocal(usuario.id, nueva);
    if (seleccionado?.id === id) setSeleccionado(null);
  };

  const reemplazarEstablecimiento = (oldId, nuevoId) => {
    const nuevaLista = lista.map(e => e.id === oldId ? { ...e, id: nuevoId } : e);
    setLista(nuevaLista);
    if (seleccionado?.id === oldId) setSeleccionado(s => ({ ...s, id: nuevoId }));
    if (!DEMO_IDS.has(usuario?.id)) persistirLocal(usuario.id, nuevaLista);
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
