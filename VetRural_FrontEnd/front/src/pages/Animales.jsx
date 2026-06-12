import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEstablecimiento } from '../context/EstablecimientoContext';
import AnimalCard from '../components/AnimalCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAnimalesPorEstablecimiento, darBajaAnimal } from '../api/animalesApi';

const TIPOS_TODOS = ['Todos', 'Ternera', 'Vaquillona', 'Vaca', 'Ternero', 'Novillito', 'Novillo', 'Torito', 'Toro'];

export default function Animales() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { seleccionado } = useEstablecimiento();
  const [animales, setAnimales] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroSexo, setFiltroSexo] = useState('Todos');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroLote, setFiltroLote] = useState('Todos');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!seleccionado) { setAnimales([]); return; }
    setCargando(true);
    getAnimalesPorEstablecimiento(seleccionado.id)
      .then(data => { setAnimales(data); setCargando(false); })
      .catch(() => { setAnimales([]); setCargando(false); });
  }, [seleccionado?.id]);

  const lotesDisponibles = useMemo(() => {
    const ls = [...new Set(animales.map(a => a.lote).filter(Boolean))].sort();
    return ['Todos', ...ls];
  }, [animales]);

  const tiposDisponibles = useMemo(() => {
    const ts = [...new Set(animales.map(a => a.tipo).filter(Boolean))];
    return ['Todos', ...TIPOS_TODOS.filter(t => t !== 'Todos' && ts.includes(t))];
  }, [animales]);

  const filtrados = useMemo(() => animales.filter(a => {
    if (busqueda) {
      const q = busqueda.toLowerCase();
      if (!a.caravana.toLowerCase().includes(q) && !a.apodo?.toLowerCase().includes(q)) return false;
    }
    if (filtroSexo !== 'Todos' && a.sexo !== filtroSexo) return false;
    if (filtroTipo !== 'Todos' && a.tipo !== filtroTipo) return false;
    if (filtroLote !== 'Todos' && a.lote !== filtroLote) return false;
    return true;
  }), [animales, busqueda, filtroSexo, filtroTipo, filtroLote]);

  const darBaja = async (id, data) => {
    try {
      await darBajaAnimal(id, data);
      setAnimales(prev => prev.filter(a => a.id !== id));
    } catch {
      setError('No se pudo dar de baja al animal. Intentá de nuevo.');
      setTimeout(() => setError(''), 4000);
      throw new Error('fallo');
    }
  };

  if (!seleccionado) {
    return (
      <div className="flex flex-col w-full" style={{ gap: '1.5rem' }}>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Animales</h1>
        </div>
        <div className="text-center py-24">
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
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Animales</h1>
          <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>
            {seleccionado.nombre} · {filtrados.length} de {animales.length} animales
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => navigate('/animales/bajas')}
            className="flex items-center gap-1.5 rounded-xl font-semibold transition-colors hover:bg-gray-100"
            style={{ border: '1.5px solid #E5E7EB', padding: '0.6rem 1rem', fontSize: '0.9rem', color: '#6B7280', backgroundColor: 'white' }}
          >
            Animales inactivos
          </button>
          {usuario && (
            <button
              onClick={() => navigate('/animales/nuevo')}
              className="btn-primary"
              style={{ fontSize: '1rem', padding: '0.75rem 1.25rem' }}
            >
              + Nuevo animal
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl px-4 py-3 text-sm font-semibold" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
          {error}
        </div>
      )}

      {/* Búsqueda */}
      <input
        type="text"
        placeholder="Buscar por caravana o apodo..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        className="w-full rounded-2xl border bg-white"
        style={{ borderColor: '#D1D5DB', padding: '0.875rem 1.25rem', fontSize: '1rem' }}
      />

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-end">
        {/* Sexo */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold" style={{ color: '#6B7280' }}>Sexo</span>
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1.5px solid #E5E7EB' }}>
            {['Todos', 'Hembra', 'Macho'].map(s => (
              <button key={s} onClick={() => setFiltroSexo(s)}
                className="font-semibold transition-colors"
                style={{
                  padding: '0.5rem 0.875rem', fontSize: '0.85rem',
                  ...(filtroSexo === s
                    ? { backgroundColor: 'var(--verde-oscuro)', color: 'white' }
                    : { backgroundColor: 'white', color: '#6B7280' })
                }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Tipo */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold" style={{ color: '#6B7280' }}>Tipo</span>
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
            className="rounded-xl border bg-white font-semibold"
            style={{ borderColor: '#E5E7EB', borderWidth: '1.5px', padding: '0.5rem 0.875rem', fontSize: '0.85rem', color: '#374151' }}>
            {tiposDisponibles.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Lote */}
        {lotesDisponibles.length > 1 && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold" style={{ color: '#6B7280' }}>Lote</span>
            <select value={filtroLote} onChange={e => setFiltroLote(e.target.value)}
              className="rounded-xl border bg-white font-semibold"
              style={{ borderColor: '#E5E7EB', borderWidth: '1.5px', padding: '0.5rem 0.875rem', fontSize: '0.85rem', color: '#374151' }}>
              {lotesDisponibles.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-lg font-semibold" style={{ color: '#374151' }}>
            {busqueda || filtroSexo !== 'Todos' || filtroTipo !== 'Todos' || filtroLote !== 'Todos'
              ? 'No se encontraron animales con ese filtro'
              : 'Este establecimiento no tiene animales registrados'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtrados.map(a => (
            <AnimalCard key={a.id} animal={a} onDarBaja={darBaja} />
          ))}
        </div>
      )}

    </div>
  );
}
