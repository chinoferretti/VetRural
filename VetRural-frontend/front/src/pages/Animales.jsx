import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnimalCard from '../components/AnimalCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAnimales } from '../api/animalesApi';
import { eliminarAnimal } from '../api/animalesApi';

export default function Animales() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const puedeAgregar = !!usuario;
  const [animales, setAnimales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    getAnimales()
    .then(data => { setAnimales(data); setCargando(false); })
    .catch(() => { setAnimales([]); setCargando(false); });
}, []);

  const filtrados = useMemo(() => animales.filter(a => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return a.caravana.toLowerCase().includes(q) || a.nombre?.toLowerCase().includes(q);
  }), [animales, busqueda]);

const eliminar = async (id) => {
  await eliminarAnimal(id);
  setAnimales(prev => prev.filter(a => a.id !== id));
};

  if (cargando) return <LoadingSpinner texto="Cargando animales..." />;

  return (
    <div className="flex flex-col w-full" style={{ gap: '1.5rem' }}>

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Animales</h1>
          <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>
            {filtrados.length} de {animales.length} animales
          </p>
        </div>
        {puedeAgregar && (
          <button
            onClick={() => navigate('/animales/nuevo')}
            className="btn-primary flex-shrink-0"
            style={{ fontSize: '1rem', padding: '0.75rem 1.25rem' }}
          >
            + Nuevo animal
          </button>
        )}
      </div>

      {/* Búsqueda */}
      <input
        type="text"
        placeholder="Buscar por caravana o nombre..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        className="w-full rounded-2xl border bg-white"
        style={{ borderColor: '#D1D5DB', padding: '0.875rem 1.25rem', fontSize: '1rem' }}
      />

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🐄</p>
          <p className="text-lg font-semibold" style={{ color: '#374151' }}>No se encontraron animales</p>
          <p className="mt-1" style={{ color: '#6B7280' }}>Probá con otro número de caravana</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtrados.map(a => (
            <AnimalCard key={a.id} animal={a} onEliminar={eliminar} />
          ))}
        </div>
      )}

    </div>
  );
}
