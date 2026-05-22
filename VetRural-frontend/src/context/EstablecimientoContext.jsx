import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, DEMO_EMAILS } from './AuthContext';
import api from '../api/axios';

const DEMO = [
  { id: 1, nombre: 'La Esperanza',  ubicacion: 'Córdoba'      },
  { id: 2, nombre: 'El Porvenir',   ubicacion: 'Buenos Aires' },
  { id: 3, nombre: 'San Jacinto',   ubicacion: 'Entre Ríos'   },
  { id: 4, nombre: 'Los Aromos',    ubicacion: 'Santa Fe'     },
];

function adaptarEstablecimiento(e) {
  return { id: e.id, nombre: e.nombre, ubicacion: e.ubicacion ?? '' };
}

const EstablecimientoContext = createContext(null);

export function EstablecimientoProvider({ children }) {
  const { usuario, esDemoUser } = useAuth();
  const [lista,        setLista]        = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);

  useEffect(() => {
    setSeleccionado(null);

    if (!usuario) { setLista([]); return; }

    // Cuentas demo: datos mock, sin tocar el backend
    if (esDemoUser()) {
      setLista(DEMO);
      return;
    }

    // Usuario real: solo sus establecimientos (GET /api/usuarios/:id/establecimientos)
    api.get(`/usuarios/${usuario.id}/establecimientos`)
      .then(({ data }) => setLista(data.map(adaptarEstablecimiento)))
      .catch(() => setLista([]));
  }, [usuario?.id]);

  const seleccionar = (est) => setSeleccionado(est);

  const crear = async ({ nombre, ubicacion }) => {
    if (usuario?.rol !== 'productor') throw new Error('Solo los productores pueden crear establecimientos');

    if (esDemoUser()) {
      const nuevo = { id: Date.now(), nombre, ubicacion: ubicacion ?? '' };
      setLista(prev => [...prev, nuevo]);
      return nuevo;
    }

    // 1. Crear el establecimiento
    const { data } = await api.post('/establecimientos', { nombre });
    // 2. Asociar automáticamente al productor que lo creó
    await api.post(`/establecimientos/${data.id}/usuarios/${usuario.id}`);

    const nuevo = adaptarEstablecimiento(data);
    setLista(prev => [...prev, nuevo]);
    return nuevo;
  };

  const unirse = (establecimiento) => {
    if (lista.find(e => e.id === establecimiento.id)) return;
    setLista(prev => [...prev, establecimiento]);
    setSeleccionado(establecimiento);
  };

  const eliminar = (id) => {
    setLista(prev => prev.filter(e => e.id !== id));
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
