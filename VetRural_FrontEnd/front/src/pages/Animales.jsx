import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEstablecimiento } from '../context/EstablecimientoContext';
import AnimalCard from '../components/AnimalCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAnimalesPorEstablecimiento, eliminarAnimal } from '../api/animalesApi';

export default function Animales() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { seleccionado } = useEstablecimiento();
  const [animales, setAnimales] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [error,    setError]    = useState('');

  useEffect(() => {
    if (!seleccionado) { setAnimales([]); return; }
    setCargando(true);
    getAnimalesPorEstablecimiento(seleccionado.id)
      .then(data => { setAnimales(data); setCargando(false); })
      .catch(() => { setAnimales([]); setCargando(false); });
  }, [seleccionado?.id]);

  const filtrados = useMemo(() => animales.filter(a => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return a.caravana.toLowerCase().includes(q) || a.nombre?.toLowerCase().includes(q);
  }), [animales, busqueda]);

  const eliminar = async (id) => {
    try {
      await eliminarAnimal(id);
      setAnimales(prev => prev.filter(a => a.id !== id));
    } catch {
      setError('No se pudo eliminar el animal. Intentá de nuevo.');
      setTimeout(() => setError(''), 4000);
      throw new Error('fallo');
    }
  };

  // Sin establecimiento seleccionado
  if (!seleccionado) {
    return (
      <div className="flex flex-col w-full" style={{ gap: '1.5rem' }}>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Animales</h1>
        </div>
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🏡</p>
          <p className="text-lg font-semibold" style={{ color: '#374151' }}>Seleccioná un establecimiento</p>
          <p className="mt-1" style={{ color: '#6B7280' }}>Los animales se muestran según el establecimiento activo</p>
        </div>
      </div>
    );
  }

  if (cargando) return <LoadingSpinner texto="Cargando animales..." />;

  return (
    <div className="flex flex-col w-full" style={{ gap: '1.5rem' }}>

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Animales</h1>
          <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>
            {seleccionado.nombre} · {filtrados.length} de {animales.length} animales
          </p>
        </div>
        {usuario && (
          <button
            onClick={() => navigate('/animales/nuevo')}
            className="btn-primary flex-shrink-0"
            style={{ fontSize: '1rem', padding: '0.75rem 1.25rem' }}
          >
            + Nuevo animal
          </button>
        )}
      </div>

      {/* Error eliminación */}
      {error && (
        <div className="rounded-2xl px-4 py-3 text-sm font-semibold" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
          {error}
        </div>
      )}

      {/* Búsqueda */}
      <input
        type="text"
        placeholder="Buscar por caravana..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        className="w-full rounded-2xl border bg-white"
        style={{ borderColor: '#D1D5DB', padding: '0.875rem 1.25rem', fontSize: '1rem' }}
      />

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🐄</p>
          <p className="text-lg font-semibold" style={{ color: '#374151' }}>
            {busqueda ? 'No se encontraron animales' : 'Este establecimiento no tiene animales registrados'}
          </p>
          {!busqueda && (
            <button
              onClick={() => navigate('/animales/nuevo')}
              className="btn-primary mt-4"
            >
              + Registrar primer animal
            </button>
          )}
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
