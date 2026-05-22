import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth, DEMO_EMAILS } from './AuthContext';
import api from '../api/axios';

// IDs coinciden con los establecimientos creados por el seed del backend
const DEMO = [
  { id: 1, nombre: 'La Esperanza', ubicacion: 'Córdoba'      },
  { id: 2, nombre: 'El Porvenir',  ubicacion: 'Buenos Aires' },
];

function adaptarEstablecimiento(e) {
  return { id: e.id, nombre: e.nombre, ubicacion: e.ubicacion ?? '' };
}

const EstablecimientoContext = createContext(null);

export function EstablecimientoProvider({ children }) {
  const { usuario, esDemoUser, actualizarId } = useAuth();
  const [lista,        setLista]        = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);

  // Busca el id real del usuario en el backend por email y lo sincroniza
  const sincronizarId = useCallback(async () => {
    if (!usuario?.email) return null;
    try {
      const { data: todos } = await api.get('/usuarios');
      const backendUser = todos.find(u => u.email === usuario.email);
      if (backendUser && backendUser.idUsuario !== usuario.id) {
        actualizarId(backendUser.idUsuario);
        return backendUser.idUsuario;
      }
      return backendUser?.idUsuario ?? null;
    } catch {
      return null;
    }
  }, [usuario?.email, usuario?.id, actualizarId]);

  useEffect(() => {
    setSeleccionado(null);

    if (!usuario) { setLista([]); return; }
    if (esDemoUser()) { setLista(DEMO); return; }

    api.get(`/usuarios/${usuario.id}/establecimientos`)
      .then(({ data }) => setLista(data.map(adaptarEstablecimiento)))
      .catch(async (err) => {
        // El id en localStorage puede estar desactualizado (ej: después de resetear la DB)
        if (err.response?.status === 404) {
          const idReal = await sincronizarId();
          if (idReal) {
            api.get(`/usuarios/${idReal}/establecimientos`)
              .then(({ data }) => setLista(data.map(adaptarEstablecimiento)))
              .catch(() => setLista([]));
            return;
          }
        }
        setLista([]);
      });
  }, [usuario?.id]);

  const seleccionar = (est) => setSeleccionado(est);

  const crear = async ({ nombre, ubicacion }) => {
    if (usuario?.rol !== 'productor') throw new Error('Solo los productores pueden crear establecimientos');

    if (esDemoUser()) {
      const nuevo = { id: Date.now(), nombre, ubicacion: ubicacion ?? '' };
      setLista(prev => [...prev, nuevo]);
      return nuevo;
    }

    const { data: estData } = await api.post('/establecimientos', { nombre });

    let userId = usuario.id;
    try {
      await api.post(`/establecimientos/${estData.id}/usuarios/${userId}`);
    } catch (err) {
      if (err.response?.status === 404) {
        // Id desactualizado — sincronizar y reintentar
        const idReal = await sincronizarId();
        if (idReal) {
          userId = idReal;
          await api.post(`/establecimientos/${estData.id}/usuarios/${idReal}`);
        }
      } else {
        throw err;
      }
    }

    const nuevo = adaptarEstablecimiento(estData);
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
