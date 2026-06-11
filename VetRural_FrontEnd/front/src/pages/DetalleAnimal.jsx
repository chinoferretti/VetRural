import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAnimalById } from '../api/animalesApi';
import api from '../api/axios';

function formatFechaHora(valor) {
  if (!valor) return '—';
  const d = new Date(Array.isArray(valor)
    ? new Date(valor[0], valor[1] - 1, valor[2], valor[3] ?? 0, valor[4] ?? 0)
    : valor);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatFechaLocal(valor) {
  if (!valor) return '—';
  const d = Array.isArray(valor)
    ? new Date(valor[0], valor[1] - 1, valor[2])
    : new Date(valor + 'T00:00:00');
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function Campo({ label, valor }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>{label}</span>
      <span className="text-base font-semibold" style={{ color: '#111827' }}>{valor || '—'}</span>
    </div>
  );
}

function Seccion({ titulo, icono, children, acento }) {
  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div className="flex items-center gap-2 mb-4" style={{ borderBottom: `2px solid ${acento || '#E5E7EB'}`, paddingBottom: '0.75rem' }}>
        <span style={{ fontSize: '1.25rem' }}>{icono}</span>
        <h3 className="font-bold text-base" style={{ color: 'var(--verde-oscuro)' }}>{titulo}</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
        {children}
      </div>
    </div>
  );
}

const VACUNAS = [
  { value: 'Aftosa',      label: 'Aftosa' },
  { value: 'Brucelosis',  label: 'Brucelosis' },
  { value: 'Carbunco',    label: 'Carbunco' },
  { value: 'Clostridial', label: 'Clostridial' },
  { value: 'IBR',         label: 'IBR' },
  { value: 'BVD',         label: 'BVD' },
];

function formatEnum(valor) {
  if (!valor) return '—';
  return String(valor).replace(/_/g, ' ');
}

const DIENTES_EDAD = {
  Dos:    '1.5–2 años (2 dientes)',
  Cuatro: '2.5–3 años (4 dientes)',
  Seis:   '3.5–4 años (6 dientes)',
  Ocho:   '> 4.5 años (8 dientes)',
};

function edadDesdeBoqueo(boqueo) {
  if (!boqueo?.dientes) return null;
  return DIENTES_EDAD[boqueo.dientes] ?? null;
}

export default function DetalleAnimal() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [animal,   setAnimal]   = useState(null);
  const [pesaje,   setPesaje]   = useState(null);
  const [tacto,    setTacto]    = useState(null);
  const [boqueo,   setBoqueo]   = useState(null);
  const [vacunas,  setVacunas]  = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  const cargarDatos = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargando(true);
    else setActualizando(true);

    try {
      const [animalData, pesajeRes, tactoRes, boqueoRes, vacunasRes] = await Promise.all([
        getAnimalById(id),
        api.get(`/manga/${id}/ultimo-pesaje`).catch(() => ({ data: null })),
        api.get(`/manga/${id}/ultimo-tacto`).catch(() => ({ data: null })),
        api.get(`/manga/${id}/ultimo-boqueo`).catch(() => ({ data: null })),
        api.get(`/manga/${id}/vacunaciones`).catch(() => ({ data: [] })),
      ]);
      setAnimal(animalData);
      setPesaje(pesajeRes.data);
      setTacto(tactoRes.data);
      setBoqueo(boqueoRes.data);
      setVacunas(vacunasRes.data ?? []);
      setUltimaActualizacion(new Date());
    } catch {
      setAnimal(null);
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, [id]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  if (cargando) return <LoadingSpinner texto="Cargando animal..." />;

  if (!animal) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <p className="text-6xl">🐄</p>
        <p className="text-xl font-bold" style={{ color: '#374151' }}>Animal no encontrado</p>
        <button onClick={() => navigate('/animales')} className="btn-primary">Volver al listado</button>
      </div>
    );
  }

  const horaActualizacion = ultimaActualizacion
    ? ultimaActualizacion.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="flex flex-col w-full" style={{ gap: '1.5rem' }}>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/animales')}
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors hover:bg-white mt-1 flex-shrink-0"
            style={{ border: '1.5px solid #E5E7EB', color: '#6B7280' }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#9CA3AF', fontFamily: 'monospace' }}>
              Caravana #{animal.caravana}
            </p>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>
              {animal.raza || '—'}
            </h1>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {animal.tipo && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EBF7F1', color: 'var(--verde-medio)' }}>
                  {animal.tipo}
                </span>
              )}
              {animal.sexo && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
                  {animal.sexo}
                </span>
              )}
              {animal.lote && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                  Lote {animal.lote}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <button
            onClick={() => cargarDatos(true)}
            disabled={actualizando}
            className="flex items-center gap-1.5 btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.5rem 0.875rem' }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${actualizando ? 'animate-spin' : ''}`} />
            {actualizando ? 'Actualizando…' : 'Actualizar'}
          </button>
          {horaActualizacion && (
            <p className="text-xs" style={{ color: '#9CA3AF' }}>Datos al {horaActualizacion}</p>
          )}
        </div>
      </div>

      {/* Grilla principal */}
      <div className="flex flex-col gap-4">

        {/* Información general */}
        <Seccion titulo="Información general" icono="📋" acento="#95D5B2">
          <Campo label="Caravana"   valor={animal.caravana} />
          <Campo label="Sexo"       valor={animal.sexo} />
          <Campo label="Apodo"      valor={animal.apodo} />
          <Campo label="Raza"       valor={animal.raza} />
          <Campo label="Tipo"       valor={animal.tipo} />
          <Campo label="Pelaje"     valor={animal.observaciones} />
          <Campo label="Lote"       valor={animal.lote} />
          {animal.nacimiento
            ? <Campo label="Nacimiento"     valor={formatFechaLocal(animal.nacimiento)} />
            : edadDesdeBoqueo(boqueo) && <Campo label="Edad calculada" valor={edadDesdeBoqueo(boqueo)} />
          }
        </Seccion>

        {/* Fila clínica: Pesaje + Tacto + Boqueo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Pesaje */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div className="flex items-center gap-2 mb-4" style={{ borderBottom: '2px solid #DBEAFE', paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>⚖️</span>
              <h3 className="font-bold text-base" style={{ color: 'var(--verde-oscuro)' }}>Último pesaje</h3>
            </div>
            {pesaje ? (
              <div className="flex flex-col gap-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Peso</span>
                  <p className="text-3xl font-bold mt-1" style={{ color: '#1D4ED8' }}>
                    {pesaje.peso} <span className="text-lg font-semibold" style={{ color: '#6B7280' }}>kg</span>
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Fecha</span>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: '#374151' }}>{formatFechaHora(pesaje.fechaHora)}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm" style={{ color: '#9CA3AF' }}>Sin registros</p>
            )}
          </div>

          {/* Tacto */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div className="flex items-center gap-2 mb-4" style={{ borderBottom: '2px solid #EDE9FE', paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🔍</span>
              <h3 className="font-bold text-base" style={{ color: 'var(--verde-oscuro)' }}>Último tacto</h3>
            </div>
            {tacto ? (
              <div className="flex flex-col gap-3">
                <Campo label="Situación" valor={tacto.situacion?.replace(/_/g, ' ')} />
                {tacto.situacion === 'Preñada' && (
                  <Campo label="Período" valor={tacto.periodo?.replace(/_/g, ' ')} />
                )}
                <Campo label="Fecha" valor={formatFechaHora(tacto.fechaHora)} />
              </div>
            ) : (
              <p className="text-sm" style={{ color: '#9CA3AF' }}>Sin registros</p>
            )}
          </div>

          {/* Boqueo */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div className="flex items-center gap-2 mb-4" style={{ borderBottom: '2px solid #FEF3C7', paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🦷</span>
              <h3 className="font-bold text-base" style={{ color: 'var(--verde-oscuro)' }}>Último boqueo</h3>
            </div>
            {boqueo ? (
              <div className="flex flex-col gap-3">
                <Campo label="Dientes"       valor={formatEnum(boqueo.dientes)} />
                <Campo label="Deterioro"     valor={formatEnum(boqueo.deterioro)} />
                <Campo label="Dentadura"     valor={formatEnum(boqueo.dentadura)} />
                <Campo label="Fecha"         valor={formatFechaHora(boqueo.fechaHora)} />
              </div>
            ) : (
              <p className="text-sm" style={{ color: '#9CA3AF' }}>Sin registros</p>
            )}
          </div>

        </div>

        {/* Vacunaciones */}
        <Seccion titulo="Vacunaciones (última aplicación)" icono="💉" acento="#D1FAE5">
          {VACUNAS.map(({ value, label }) => {
            const vac = vacunas.filter(v => v.vacuna === value)
              .sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora))[0];
            return <Campo key={value} label={label} valor={vac ? formatFechaHora(vac.fechaHora) : null} />;
          })}
        </Seccion>

      </div>
    </div>
  );
}
