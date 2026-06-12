import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEstablecimiento } from '../context/EstablecimientoContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAnimalesDadosDeBaja } from '../api/animalesApi';

const ESTADO_STYLE = {
  Vendido:     { bg: '#EBF7F1', color: 'var(--verde-oscuro)', label: 'Vendido' },
  Muerto:      { bg: '#F3F4F6', color: '#374151',             label: 'Muerto' },
  Transferido: { bg: '#FEF3C7', color: '#92400E',             label: 'Transferido' },
};

function formatFecha(valor) {
  if (!valor) return '—';
  const d = Array.isArray(valor)
    ? new Date(valor[0], valor[1] - 1, valor[2])
    : new Date(valor + 'T00:00:00');
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function AnimalesBajas() {
  const navigate = useNavigate();
  const { seleccionado } = useEstablecimiento();
  const [bajas,    setBajas]    = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (!seleccionado) { setCargando(false); return; }
    getAnimalesDadosDeBaja(seleccionado.id)
      .then(data => setBajas(data))
      .catch(() => setBajas([]))
      .finally(() => setCargando(false));
  }, [seleccionado?.id]);

  const filtradas = bajas.filter(a => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return (
      a.caravana.toLowerCase().includes(q) ||
      a.apodo?.toLowerCase().includes(q) ||
      a.motivoBaja?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col w-full" style={{ gap: '1.5rem' }}>

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/animales')}
          className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 transition-colors hover:bg-gray-100"
          style={{ border: '1.5px solid #E5E7EB', color: '#6B7280' }}
          aria-label="Volver al listado"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Bajas del rodeo</h1>
          {seleccionado && (
            <p className="mt-0.5 text-sm" style={{ color: '#6B7280' }}>
              {seleccionado.nombre} · {filtradas.length} de {bajas.length} registros
            </p>
          )}
        </div>
      </div>

      {!seleccionado ? (
        <div className="text-center py-24">
          <p className="text-lg font-semibold" style={{ color: '#374151' }}>Seleccioná un establecimiento</p>
        </div>
      ) : cargando ? (
        <LoadingSpinner texto="Cargando bajas..." />
      ) : (
        <>
          {bajas.length > 0 && (
            <input
              type="text"
              placeholder="Buscar por caravana, apodo o motivo..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full rounded-2xl border bg-white"
              style={{ borderColor: '#D1D5DB', padding: '0.875rem 1.25rem', fontSize: '1rem' }}
            />
          )}

          {filtradas.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-lg font-semibold" style={{ color: '#374151' }}>
                {busqueda ? 'No se encontraron resultados' : 'Sin animales dados de baja en este establecimiento'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtradas.map(a => {
                const st = ESTADO_STYLE[a.estado] ?? { bg: '#F3F4F6', color: '#6B7280', label: a.estado };
                return (
                  <div
                    key={a.id}
                    onClick={() => navigate(`/animales/${a.id}`)}
                    className="card flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
                    style={{ padding: '1rem 1.5rem' }}
                  >
                    {/* N° Caravana — prominente */}
                    <div className="flex-shrink-0" style={{ minWidth: '10rem' }}>
                      <p className="font-mono font-bold" style={{ color: 'var(--verde-oscuro)', fontSize: '1.1rem' }}>
                        N° {a.caravana}
                      </p>
                      {a.apodo && (
                        <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>"{a.apodo}"</p>
                      )}
                    </div>

                    {/* Datos horizontales */}
                    <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                      {a.tipo && (
                        <span className="text-xs font-semibold flex-shrink-0" style={{ color: '#6B7280' }}>{a.tipo}</span>
                      )}
                      {a.lote && (
                        <span className="text-xs flex-shrink-0" style={{ color: '#9CA3AF' }}>Lote: {a.lote}</span>
                      )}
                      {a.fechaBaja && (
                        <span className="text-xs flex-shrink-0" style={{ color: '#9CA3AF' }}>Baja: {formatFecha(a.fechaBaja)}</span>
                      )}
                      {a.motivoBaja && (
                        <span className="text-xs flex-shrink-0" style={{ color: '#6B7280' }}>{a.motivoBaja}</span>
                      )}
                    </div>

                    {/* Flecha */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                      className="w-5 h-5 flex-shrink-0" style={{ color: '#9CA3AF' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
