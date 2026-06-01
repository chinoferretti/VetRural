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
        const merged = data.map(e => ({
          ...e,
          ubicacion: locales.find(l => l.id === e.id)?.ubicacion || '',
        }));
        setLista(merged);
        persistirLocal(usuario.id, merged); // sobreescribe cualquier dato local viejo
      })
      .catch(() => {
        // Sin conexión: usar solo establecimientos reales cacheados (filtra ids fake > 100)
        const locales = cargarLocal(usuario.id).filter(e => e.id <= 100);
        setLista(locales);
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

  return (
    <EstablecimientoContext.Provider value={{ lista, seleccionado, seleccionar, crear, unirse, eliminar, cargando }}>
      {children}
    </EstablecimientoContext.Provider>
  );
}

export function useEstablecimiento() {
  return useContext(EstablecimientoContext);
}
