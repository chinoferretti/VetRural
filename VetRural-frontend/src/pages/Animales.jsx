import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEstablecimiento } from '../context/EstablecimientoContext';
import AnimalCard from '../components/AnimalCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAnimales, eliminarAnimal } from '../api/animalesApi';

export default function Animales() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { seleccionado } = useEstablecimiento();
  const [animales, setAnimales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (!seleccionado) {
      setAnimales([]);
      setCargando(false);
      return;
    }
    setCargando(true);
    setError(null);
    getAnimales(seleccionado.id)
      .then(setAnimales)
      .catch(() => setError('No se pudo cargar la lista de animales.'))
      .finally(() => setCargando(false));
  }, [seleccionado?.id]);

  const filtrados = useMemo(() => animales.filter(a => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return a.caravana.toLowerCase().includes(q) || a.nombre?.toLowerCase().includes(q);
  }), [animales, busqueda]);

  const handleEliminar = async (id) => {
    try {
      await eliminarAnimal(id);
      setAnimales(prev => prev.filter(a => a.id !== id));
    } catch {
      alert('No se pudo eliminar el animal. Intentá de nuevo.');
    }
  };

  return (
    <div className="flex flex-col w-full" style={{ gap: '1.5rem' }}>

      {/* Header — siempre visible, el botón no depende del establecimiento */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Animales</h1>
          <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>
            {seleccionado
              ? `${filtrados.length} de ${animales.length} animales · ${seleccionado.nombre}`
              : 'Seleccioná un establecimiento para ver sus animales'}
          </p>
        </div>
        {!!usuario && (
          <button
            onClick={() => navigate('/animales/nuevo')}
            className="btn-primary flex-shrink-0"
            style={{ fontSize: '1rem', padding: '0.75rem 1.25rem' }}
          >
            + Nuevo animal
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
          {error}
        </div>
      )}

      {/* Sin establecimiento seleccionado */}
      {!seleccionado && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-5xl">🏡</p>
          <p className="text-lg font-semibold" style={{ color: '#374151' }}>Seleccioná un establecimiento</p>
          <p className="text-sm text-center" style={{ color: '#6B7280' }}>
            Usá el selector en la barra superior para elegir un establecimiento y ver sus animales.
          </p>
        </div>
      )}

      {/* Con establecimiento: búsqueda + lista */}
      {seleccionado && !cargando && (
        <>
          <input
            type="text"
            placeholder="Buscar por caravana o nombre..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full rounded-2xl border bg-white"
            style={{ borderColor: '#D1D5DB', padding: '0.875rem 1.25rem', fontSize: '1rem' }}
          />

          {filtrados.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-5xl mb-4">🐄</p>
              <p className="text-lg font-semibold" style={{ color: '#374151' }}>No se encontraron animales</p>
              <p className="mt-1" style={{ color: '#6B7280' }}>Probá con otro número de caravana</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtrados.map(a => (
                <AnimalCard key={a.id} animal={a} onEliminar={handleEliminar} />
              ))}
            </div>
          )}
        </>
      )}

      {seleccionado && cargando && <LoadingSpinner texto="Cargando animales..." />}

    </div>
  );
}
