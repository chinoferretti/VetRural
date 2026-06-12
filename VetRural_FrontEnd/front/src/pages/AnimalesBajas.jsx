import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEstablecimiento } from '../context/EstablecimientoContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAnimalesDadosDeBaja, darDeAltaAnimal, eliminarAnimal } from '../api/animalesApi';
import vacaImg from '../assets/vaca.png';
import toroImg from '../assets/toro.png';

const ESTADO_STYLE = {
  Vendido:     { bg: '#EBF7F1', color: 'var(--verde-oscuro)', label: 'Vendido' },
  Muerto:      { bg: '#F3F4F6', color: '#374151',             label: 'Muerto' },
  Transferido: { bg: '#FEF3C7', color: '#92400E',             label: 'Transferido' },
  Otros:       { bg: '#F3F4F6', color: '#6B7280',             label: 'Otros' },
};

function formatFecha(valor) {
  if (!valor) return '—';
  const d = Array.isArray(valor)
    ? new Date(valor[0], valor[1] - 1, valor[2])
    : new Date(valor + 'T00:00:00');
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function BajaCard({ animal, onDarAlta, onDepurar }) {
  const navigate = useNavigate();
  const [confirmando,        setConfirmando]        = useState(false);
  const [confirmandoDepurar, setConfirmandoDepurar] = useState(false);
  const [guardando,          setGuardando]          = useState(false);

  const st = ESTADO_STYLE[animal.estado] ?? { bg: '#F3F4F6', color: '#6B7280', label: animal.estado };
  const esMacho = animal.sexo === 'Macho';

  const handleConfirmar = async (e) => {
    e.stopPropagation();
    setGuardando(true);
    try {
      await onDarAlta(animal.id);
    } catch {
      setGuardando(false);
      setConfirmando(false);
    }
  };

  const handleConfirmarDepurar = async (e) => {
    e.stopPropagation();
    setGuardando(true);
    try {
      await onDepurar(animal.id);
    } catch {
      setGuardando(false);
      setConfirmandoDepurar(false);
    }
  };

  return (
    <div
      className="flex flex-col rounded-2xl bg-white"
      style={{ padding: '0.875rem 1rem', border: '1.5px solid #E5E7EB', gap: '0.6rem' }}
    >
      {/* Fila principal */}
      <div className="flex items-center" style={{ gap: '0.75rem' }}>
        {/* Imagen + info — clickeable */}
        <button
          className="flex items-center flex-1 min-w-0 text-left"
          style={{ gap: '0.6rem' }}
          onClick={() => navigate(`/animales/${animal.id}`)}
          disabled={guardando}
        >
          <div className="rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#F9FAFB', width: '3.8rem', height: '3.8rem' }}>
            <img
              src={esMacho ? toroImg : vacaImg}
              alt={esMacho ? 'Toro' : 'Vaca'}
              style={{ width: '3.6rem', height: '3.6rem' }}
              className="object-contain"
            />
          </div>

          <div className="min-w-0 flex flex-col" style={{ gap: '0.2rem' }}>
            <div className="flex items-baseline overflow-hidden" style={{ gap: '0.5rem' }}>
              <p className="font-bold truncate flex-shrink-0" style={{ color: 'var(--verde-oscuro)', fontSize: '1.4rem' }}>
                N° {animal.caravana}
              </p>
              {animal.apodo && (
                <p className="font-semibold truncate" style={{ color: '#9CA3AF', fontSize: '1.2rem' }}>{animal.apodo}</p>
              )}
            </div>
            {/* Chips horizontales */}
            <div className="flex flex-wrap items-center" style={{ gap: '0.3rem' }}>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: st.bg, color: st.color }}>
                {st.label}
              </span>
              {animal.tipo && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
                  style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                  {animal.tipo}
                </span>
              )}
              {animal.lote && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
                  style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                  Lote: {animal.lote}
                </span>
              )}
              {animal.fechaBaja && (
                <span className="text-xs flex-shrink-0" style={{ color: '#9CA3AF' }}>
                  Baja: {formatFecha(animal.fechaBaja)}
                </span>
              )}
              {animal.motivoBaja && (
                <span className="text-xs flex-shrink-0" style={{ color: '#6B7280' }}>{animal.motivoBaja}</span>
              )}
            </div>
          </div>
        </button>

        {/* Botones: dar de alta + depurar */}
        {!confirmando && !confirmandoDepurar && (
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <button
              onClick={e => { e.stopPropagation(); setConfirmando(true); }}
              className="rounded-xl font-semibold text-xs transition-colors hover:opacity-80"
              style={{ backgroundColor: '#EBF7F1', color: 'var(--verde-oscuro)', padding: '0.4rem 0.75rem', border: '1px solid #C8E6D8' }}
              title="Dar de alta"
            >
              Dar de alta
            </button>
            <button
              onClick={e => { e.stopPropagation(); setConfirmandoDepurar(true); }}
              className="rounded-xl font-semibold text-xs transition-colors hover:opacity-80"
              style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.4rem 0.75rem', border: '1px solid #FECACA' }}
              title="Eliminar definitivamente"
            >
              Depurar
            </button>
          </div>
        )}
      </div>

      {/* Panel confirmación dar de alta */}
      {confirmando && (
        <div className="flex items-center gap-2 px-1"
          onClick={e => e.stopPropagation()}>
          <p className="text-xs font-semibold flex-1" style={{ color: '#374151' }}>
            ¿Reactivar N° {animal.caravana}?
          </p>
          <button
            onClick={handleConfirmar}
            disabled={guardando}
            className="rounded-lg font-semibold text-xs disabled:opacity-60"
            style={{ backgroundColor: 'var(--verde-medio)', color: 'white', padding: '0.35rem 0.75rem' }}
          >
            {guardando ? 'Guardando...' : 'Confirmar'}
          </button>
          <button
            onClick={e => { e.stopPropagation(); setConfirmando(false); }}
            disabled={guardando}
            className="rounded-lg font-semibold text-xs disabled:opacity-50"
            style={{ backgroundColor: '#F3F4F6', color: '#6B7280', padding: '0.35rem 0.75rem' }}
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Panel confirmación depurar */}
      {confirmandoDepurar && (
        <div className="flex flex-col gap-1.5 px-1" onClick={e => e.stopPropagation()}>
          <p className="text-xs font-semibold" style={{ color: '#991B1B' }}>
            ¿Eliminar N° {animal.caravana} definitivamente? Se borrarán todos sus registros clínicos y no podrá recuperarse.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirmarDepurar}
              disabled={guardando}
              className="rounded-lg font-semibold text-xs disabled:opacity-60"
              style={{ backgroundColor: '#991B1B', color: 'white', padding: '0.35rem 0.75rem' }}
            >
              {guardando ? 'Eliminando...' : 'Eliminar definitivamente'}
            </button>
            <button
              onClick={e => { e.stopPropagation(); setConfirmandoDepurar(false); }}
              disabled={guardando}
              className="rounded-lg font-semibold text-xs disabled:opacity-50"
              style={{ backgroundColor: '#F3F4F6', color: '#6B7280', padding: '0.35rem 0.75rem' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnimalesBajas() {
  const navigate = useNavigate();
  const { seleccionado } = useEstablecimiento();
  const [bajas,    setBajas]    = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroSexo, setFiltroSexo] = useState('Todos');

  useEffect(() => {
    if (!seleccionado) { setCargando(false); return; }
    getAnimalesDadosDeBaja(seleccionado.id)
      .then(data => setBajas(data))
      .catch(() => setBajas([]))
      .finally(() => setCargando(false));
  }, [seleccionado?.id]);

  const handleDarAlta = async (id) => {
    await darDeAltaAnimal(id);
    setBajas(prev => prev.filter(a => a.id !== id));
  };

  const handleDepurar = async (id) => {
    await eliminarAnimal(id);
    setBajas(prev => prev.filter(a => a.id !== id));
  };

  const filtradas = bajas.filter(a => {
    if (filtroSexo !== 'Todos' && a.sexo !== filtroSexo) return false;
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
            <>
              <input
                type="text"
                placeholder="Buscar por caravana, apodo o motivo..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full rounded-2xl border bg-white"
                style={{ borderColor: '#D1D5DB', padding: '0.875rem 1.25rem', fontSize: '1rem' }}
              />
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold flex-shrink-0" style={{ color: '#6B7280' }}>Sexo</span>
                <div className="flex rounded-xl overflow-hidden" style={{ border: '1.5px solid #E5E7EB' }}>
                  {['Todos', 'Hembra', 'Macho'].map(s => (
                    <button key={s} onClick={() => setFiltroSexo(s)}
                      className="font-semibold transition-colors"
                      style={{
                        padding: '0.4rem 0.875rem', fontSize: '0.85rem',
                        ...(filtroSexo === s
                          ? { backgroundColor: 'var(--verde-oscuro)', color: 'white' }
                          : { backgroundColor: 'white', color: '#6B7280' })
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {filtradas.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-lg font-semibold" style={{ color: '#374151' }}>
                {busqueda || filtroSexo !== 'Todos' ? 'No se encontraron resultados' : 'Sin animales dados de baja en este establecimiento'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtradas.map(a => (
                <BajaCard key={a.id} animal={a} onDarAlta={handleDarAlta} onDepurar={handleDepurar} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
