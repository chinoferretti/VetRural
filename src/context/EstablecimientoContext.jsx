import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const DEMO_IDS = new Set([1, 2, 3]);

const DEMO = [
  { id: 1, nombre: 'La Esperanza',  ubicacion: 'Córdoba'      },
  { id: 2, nombre: 'El Porvenir',   ubicacion: 'Buenos Aires' },
  { id: 3, nombre: 'San Jacinto',   ubicacion: 'Entre Ríos'   },
  { id: 4, nombre: 'Los Aromos',    ubicacion: 'Santa Fe'     },
];

function storageKey(userId) { return `vetrural_establecimientos_${userId}`; }

function cargar(usuario) {
  if (!usuario) return [];
  if (DEMO_IDS.has(usuario.id)) return DEMO;
  try { return JSON.parse(localStorage.getItem(storageKey(usuario.id)) || '[]'); } catch { return []; }
}

function persistir(userId, lista) {
  localStorage.setItem(storageKey(userId), JSON.stringify(lista));
}

const EstablecimientoContext = createContext(null);

export function EstablecimientoProvider({ children }) {
  const { usuario } = useAuth();
  const [lista,       setLista]       = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);

  useEffect(() => {
    setLista(cargar(usuario));
    setSeleccionado(null);
  }, [usuario?.id]);

  const seleccionar = (est) => setSeleccionado(est);

  const crear = ({ nombre, ubicacion }) => {
    if (usuario?.rol !== 'productor') throw new Error('Solo los productores pueden crear establecimientos');
    const nuevo = { id: Date.now(), nombre, ubicacion };
    const nueva = [...lista, nuevo];
    setLista(nueva);
    if (!DEMO_IDS.has(usuario.id)) persistir(usuario.id, nueva);
    return nuevo;
  };

  const unirse = (establecimiento) => {
    if (lista.find(e => e.id === establecimiento.id)) return;
    const nueva = [...lista, establecimiento];
    setLista(nueva);
    if (!DEMO_IDS.has(usuario?.id)) persistir(usuario.id, nueva);
    setSeleccionado(establecimiento);
  };

  const eliminar = (id) => {
    const nueva = lista.filter(e => e.id !== id);
    setLista(nueva);
    if (!DEMO_IDS.has(usuario?.id)) persistir(usuario.id, nueva);
    if (seleccionado?.id === id) setSeleccionado(null);
  };

  return (
    <EstablecimientoContext.Provider value={{ lista, seleccionado, seleccionar, crear, unirse, eliminar }}>
      {children}
    </EstablecimientoContext.Provider>
  );
}

export function useEstablecimiento() {
  return useContext(EstablecimientoContext);
}
