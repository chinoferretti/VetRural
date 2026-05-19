import { createContext, useContext, useState } from 'react';

const DEMO = [
  { id: 1, nombre: 'La Esperanza',  ubicacion: 'Córdoba'      },
  { id: 2, nombre: 'El Porvenir',   ubicacion: 'Buenos Aires' },
  { id: 3, nombre: 'San Jacinto',   ubicacion: 'Entre Ríos'   },
  { id: 4, nombre: 'Los Aromos',    ubicacion: 'Santa Fe'     },
];

const EstablecimientoContext = createContext(null);

export function EstablecimientoProvider({ children }) {
  const [lista, setLista] = useState(DEMO);
  const [seleccionado, setSeleccionado] = useState(null);
  const [nextId, setNextId] = useState(DEMO.length + 1);

  const seleccionar = (est) => setSeleccionado(est);

  const crear = ({ nombre, ubicacion }) => {
    const nuevo = { id: nextId, nombre, ubicacion };
    setLista(prev => [...prev, nuevo]);
    setNextId(n => n + 1);
    return nuevo;
  };

  const eliminar = (id) => {
    setLista(prev => prev.filter(e => e.id !== id));
    if (seleccionado?.id === id) setSeleccionado(null);
  };

  return (
    <EstablecimientoContext.Provider value={{ lista, seleccionado, seleccionar, crear, eliminar }}>
      {children}
    </EstablecimientoContext.Provider>
  );
}

export function useEstablecimiento() {
  return useContext(EstablecimientoContext);
}
