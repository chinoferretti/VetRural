import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RefreshCw, Pencil, ChevronDown, ChevronUp, Scale, Hand, Smile, TrendingUp, Syringe, History, Lock, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAnimalById, darDeAltaAnimal } from '../api/animalesApi';
import api from '../api/axios';

const VACUNA_INTERVALO_DIAS = {
  Aftosa:      180,
  Brucelosis:  36500,
  Carbunco:    365,
  Clostridial: 365,
  IBR:         365,
  BVD:         365,
  IBR_BVD:     365,
};

const TIPO_LABEL = {
  Pesaje:     'Pesaje',
  Tacto:      'Tacto',
  Boqueo:     'Boqueo',
  Vacunacion: 'Vacunación',
};

function parseFecha(valor) {
  if (!valor) return null;
  if (Array.isArray(valor)) return new Date(valor[0], valor[1] - 1, valor[2], valor[3] ?? 0, valor[4] ?? 0);
  return new Date(valor);
}

function formatFechaHora(valor) {
  const d = parseFecha(valor);
  if (!d || isNaN(d.getTime())) return '—';
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

function Seccion({ titulo, Icon, children }) {
  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div className="flex items-center gap-2 mb-4" style={{ borderBottom: '2px solid #C8E6D8', paddingBottom: '0.75rem' }}>
        {Icon && (
          <span className="flex items-center justify-center rounded-lg flex-shrink-0"
            style={{ backgroundColor: '#EBF7F1', border: '1.5px solid #C8E6D8', padding: '0.3rem' }}>
            <Icon className="w-4 h-4" style={{ color: 'var(--verde-medio)' }} />
          </span>
        )}
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

function vacunaEstado(vac) {
  if (!vac) return { fecha: null, vigente: null };
  const d = parseFecha(vac.fechaHora);
  if (!d) return { fecha: null, vigente: null };
  const dias = Math.floor((Date.now() - d.getTime()) / 86400000);
  const intervalo = VACUNA_INTERVALO_DIAS[vac.vacuna] ?? 365;
  return { fecha: formatFechaHora(vac.fechaHora), vigente: dias <= intervalo };
}

function formatEnum(valor) {
  if (!valor) return '—';
  return String(valor).replace(/_/g, ' ');
}

function edadDesdeBoqueo(boqueo) {
  const { dientes, dentadura, deterioro } = boqueo ?? {};
  if (!dientes) return null;
  if (dentadura === 'De_Leche') return 'Menos de 1.5 años';
  if (dentadura === 'Mixta') {
    const map = { Dos: '1.5–2 años', Cuatro: '2.5–3 años', Seis: '3.5–4 años', Ocho: '4–5 años' };
    const rango = map[dientes];
    return rango ?? null;
  }
  if (dentadura === 'Permanente') {
    if (dientes === 'Dos')    return 'Alrededor de 2 años';
    if (dientes === 'Cuatro') return 'Alrededor de 3 años';
    if (dientes === 'Seis')   return 'Alrededor de 4 años';
    const porDeterioro = {
      Nulo:     '5–6 años',
      Leve:     '6–7 años',
      Moderado: '7–9 años',
      Severo:   'Más de 10 años',
    };
    return (deterioro && porDeterioro[deterioro]) ?? 'Más de 5 años';
  }
  const fallback = { Dos: '1.5–2 años', Cuatro: '2.5–3 años', Seis: '3.5–4 años', Ocho: 'Más de 4.5 años' };
  return fallback[dientes] ?? null;
}

export default function DetalleAnimal() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [animal,       setAnimal]       = useState(null);
  const [pesaje,       setPesaje]       = useState(null);
  const [todosPesajes, setTodosPesajes] = useState([]);
  const [tacto,        setTacto]        = useState(null);
  const [boqueo,       setBoqueo]       = useState(null);
  const [vacunas,      setVacunas]      = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [mostrarHistorial,  setMostrarHistorial]  = useState(false);
  const [eventos,           setEventos]           = useState([]);
  const [cargandoEventos,   setCargandoEventos]   = useState(false);
  const [errorEventos,      setErrorEventos]      = useState(null);
  const [dandoDeAlta,       setDandoDeAlta]       = useState(false);

  const cargarDatos = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargando(true);
    else setActualizando(true);

    try {
      const [animalData, pesajeRes, tactoRes, boqueoRes, vacunasRes, pesajesRes] = await Promise.all([
        getAnimalById(id),
        api.get(`/manga/${id}/ultimo-pesaje`).catch(() => ({ data: null })),
        api.get(`/manga/${id}/ultimo-tacto`).catch(() => ({ data: null })),
        api.get(`/manga/${id}/ultimo-boqueo`).catch(() => ({ data: null })),
        api.get(`/manga/${id}/vacunaciones`).catch(() => ({ data: [] })),
        api.get(`/manga/${id}/pesajes`).catch(() => ({ data: [] })),
      ]);
      setAnimal(animalData);
      setPesaje(pesajeRes.data);
      setTacto(tactoRes.data);
      setBoqueo(boqueoRes.data);
      setVacunas(vacunasRes.data ?? []);
      const pesajesOrdenados = [...(pesajesRes.data ?? [])].sort((a, b) => parseFecha(a.fechaHora) - parseFecha(b.fechaHora));
      setTodosPesajes(pesajesOrdenados);
      setUltimaActualizacion(new Date());
    } catch {
      setAnimal(null);
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, [id]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const cargarEventos = useCallback(async () => {
    setCargandoEventos(true);
    setErrorEventos(null);
    try {
      const res = await api.get(`/manga/${id}/eventos`);
      setEventos(res.data ?? []);
    } catch (err) {
      setErrorEventos(err?.response?.data?.error || 'No se pudieron cargar los eventos.');
      setEventos([]);
    } finally {
      setCargandoEventos(false);
    }
  }, [id]);

  const handleToggleHistorial = () => {
    const abriendo = !mostrarHistorial;
    setMostrarHistorial(abriendo);
    if (abriendo) cargarEventos();
  };

  // Agrupar eventos por día (sesión)
  const sesionesHistorial = useMemo(() => {
    const grupos = new Map();
    eventos.forEach(ev => {
      const d = parseFecha(ev.fechaHora);
      if (!d) return;
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!grupos.has(key)) grupos.set(key, { fecha: formatFechaHora(ev.fechaHora), tipos: new Set(), ts: d });
      grupos.get(key).tipos.add(ev.tipo);
    });
    return [...grupos.values()].sort((a, b) => b.ts - a.ts);
  }, [eventos]);

  if (cargando) return <LoadingSpinner texto="Cargando animal..." />;

  if (!animal) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <p className="text-xl font-bold" style={{ color: '#374151' }}>Animal no encontrado</p>
        <button onClick={() => navigate('/animales')} className="btn-primary">Volver al listado</button>
      </div>
    );
  }

  const horaActualizacion = ultimaActualizacion
    ? ultimaActualizacion.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    : null;

  const pesajesChart = todosPesajes.map(p => ({
    fecha: formatFechaHora(p.fechaHora),
    peso: p.peso,
  }));

  const estaDadoDeBaja = animal.estado && animal.estado !== 'Activo';

  return (
    <div className="flex flex-col flex-1" style={{ minHeight: 0, overflow: 'hidden' }}>

      {/* Header fijo: banner de baja + toolbar */}
      <div style={{ flexShrink: 0 }}>

        {/* Banner de baja */}
        {estaDadoDeBaja && (
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ backgroundColor: '#FEF3C7', border: '1.5px solid #FDE68A', marginBottom: '1rem' }}>
            <Lock className="w-5 h-5 flex-shrink-0" style={{ color: '#B45309' }} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm" style={{ color: '#92400E' }}>
                Animal dado de baja — {animal.estado}
              </p>
              {animal.fechaBaja && (
                <p className="text-xs mt-0.5" style={{ color: '#B45309' }}>
                  Fecha: {formatFechaLocal(animal.fechaBaja)}
                  {animal.motivoBaja ? ` · Motivo: ${animal.motivoBaja}` : ''}
                </p>
              )}
            </div>
            <button
              disabled={dandoDeAlta}
              onClick={async () => {
                setDandoDeAlta(true);
                try {
                  await darDeAltaAnimal(id);
                  await cargarDatos(true);
                } finally {
                  setDandoDeAlta(false);
                }
              }}
              className="flex-shrink-0 rounded-xl font-semibold text-xs disabled:opacity-60"
              style={{ backgroundColor: 'white', color: '#92400E', border: '1.5px solid #FDE68A', padding: '0.4rem 0.875rem' }}
            >
              {dandoDeAlta ? 'Reactivando...' : 'Dar de alta'}
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-end gap-2" style={{ marginBottom: '1rem' }}>
          {!estaDadoDeBaja && (
            <button
              onClick={() => navigate(`/animales/${id}/editar`)}
              className="flex items-center gap-1.5 btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.5rem 0.875rem' }}
            >
              <Pencil className="w-3.5 h-3.5" />
              Editar
            </button>
          )}
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

      {/* Contenido scrolleable */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '1rem' }}>

      {/* Grilla principal */}
      <div className="flex flex-col gap-4">

        {/* Información general */}
        <Seccion titulo="Información general" Icon={FileText}>
          <Campo label="Caravana"   valor={animal.caravana} />
          <Campo label="Sexo"       valor={animal.sexo} />
          <Campo label="Apodo"      valor={animal.apodo} />
          <Campo label="Raza"       valor={animal.raza} />
          <Campo label="Tipo"       valor={animal.tipo} />
          <Campo label="Pelaje"     valor={animal.observaciones} />
          <Campo label="Lote"       valor={animal.lote} />
          {animal.nacimiento
            ? <Campo label="Nacimiento"    valor={formatFechaLocal(animal.nacimiento)} />
            : edadDesdeBoqueo(boqueo) && <Campo label="Edad calculada" valor={edadDesdeBoqueo(boqueo)} />
          }
        </Seccion>

        {/* Fila clínica: Pesaje + Tacto + Boqueo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Pesaje */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div className="flex items-center gap-2 mb-4" style={{ borderBottom: '2px solid #C8E6D8', paddingBottom: '0.75rem' }}>
              <span className="flex items-center justify-center rounded-lg flex-shrink-0"
                style={{ backgroundColor: '#EBF7F1', border: '1.5px solid #C8E6D8', padding: '0.3rem' }}>
                <Scale className="w-4 h-4" style={{ color: 'var(--verde-medio)' }} />
              </span>
              <h3 className="font-bold text-base" style={{ color: 'var(--verde-oscuro)' }}>Último pesaje</h3>
            </div>
            {pesaje ? (
              <div className="flex flex-col gap-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Peso</span>
                  <p className="text-3xl font-bold mt-1" style={{ color: 'var(--verde-oscuro)' }}>
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
            <div className="flex items-center gap-2 mb-4" style={{ borderBottom: '2px solid #C8E6D8', paddingBottom: '0.75rem' }}>
              <span className="flex items-center justify-center rounded-lg flex-shrink-0"
                style={{ backgroundColor: '#EBF7F1', border: '1.5px solid #C8E6D8', padding: '0.3rem' }}>
                <Hand className="w-4 h-4" style={{ color: 'var(--verde-medio)' }} />
              </span>
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
            <div className="flex items-center gap-2 mb-4" style={{ borderBottom: '2px solid #C8E6D8', paddingBottom: '0.75rem' }}>
              <span className="flex items-center justify-center rounded-lg flex-shrink-0"
                style={{ backgroundColor: '#EBF7F1', border: '1.5px solid #C8E6D8', padding: '0.3rem' }}>
                <Smile className="w-4 h-4" style={{ color: 'var(--verde-medio)' }} />
              </span>
              <h3 className="font-bold text-base" style={{ color: 'var(--verde-oscuro)' }}>Último boqueo</h3>
            </div>
            {boqueo ? (
              <div className="flex flex-col gap-3">
                <Campo label="Dientes"   valor={formatEnum(boqueo.dientes)} />
                <Campo label="Deterioro" valor={formatEnum(boqueo.deterioro)} />
                <Campo label="Dentadura" valor={formatEnum(boqueo.dentadura)} />
                <Campo label="Fecha"     valor={formatFechaHora(boqueo.fechaHora)} />
              </div>
            ) : (
              <p className="text-sm" style={{ color: '#9CA3AF' }}>Sin registros</p>
            )}
          </div>

        </div>

        {/* Evolución de peso */}
        {pesajesChart.length > 1 && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <div className="flex items-center gap-2 mb-4" style={{ borderBottom: '2px solid #C8E6D8', paddingBottom: '0.75rem' }}>
              <span className="flex items-center justify-center rounded-lg flex-shrink-0"
                style={{ backgroundColor: '#EBF7F1', border: '1.5px solid #C8E6D8', padding: '0.3rem' }}>
                <TrendingUp className="w-4 h-4" style={{ color: 'var(--verde-medio)' }} />
              </span>
              <h3 className="font-bold text-base" style={{ color: 'var(--verde-oscuro)' }}>Evolución de peso</h3>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={pesajesChart} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit=" kg" />
                <Tooltip formatter={v => [`${v} kg`, 'Peso']}
                  contentStyle={{ borderRadius: '0.75rem', border: '1px solid #E5E7EB' }} />
                <Line type="monotone" dataKey="peso" stroke="var(--verde-medio)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Vacunaciones con vigencia */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div className="flex items-center gap-2 mb-4" style={{ borderBottom: '2px solid #C8E6D8', paddingBottom: '0.75rem' }}>
            <span className="flex items-center justify-center rounded-lg flex-shrink-0"
              style={{ backgroundColor: '#EBF7F1', border: '1.5px solid #C8E6D8', padding: '0.3rem' }}>
              <Syringe className="w-4 h-4" style={{ color: 'var(--verde-medio)' }} />
            </span>
            <h3 className="font-bold text-base" style={{ color: 'var(--verde-oscuro)' }}>Vacunaciones (última aplicación)</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
            {VACUNAS.map(({ value, label }) => {
              const vac = vacunas.filter(v => v.vacuna === value)
                .sort((a, b) => parseFecha(b.fechaHora) - parseFecha(a.fechaHora))[0];
              const est = vacunaEstado(vac ? { ...vac, vacuna: value } : null);
              return (
                <div key={value} className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>{label}</span>
                  <div className="flex items-center gap-1.5">
                    {est.fecha === null ? (
                      <span className="text-sm font-semibold" style={{ color: '#9CA3AF' }}>Sin registro</span>
                    ) : (
                      <>
                        <span style={{ color: est.vigente ? '#059669' : '#DC2626', fontSize: '1rem', lineHeight: 1, fontWeight: 700 }}>
                          {est.vigente ? '✓' : '✗'}
                        </span>
                        <span className="text-sm font-semibold" style={{ color: '#374151' }}>{est.fecha}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Historial de sesiones colapsable */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <button onClick={handleToggleHistorial} className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center rounded-lg flex-shrink-0"
                style={{ backgroundColor: '#EBF7F1', border: '1.5px solid #C8E6D8', padding: '0.3rem' }}>
                <History className="w-4 h-4" style={{ color: 'var(--verde-medio)' }} />
              </span>
              <h3 className="font-bold text-base" style={{ color: 'var(--verde-oscuro)' }}>Historial de eventos</h3>
            </div>
            {mostrarHistorial
              ? <ChevronUp className="w-5 h-5" style={{ color: '#9CA3AF' }} />
              : <ChevronDown className="w-5 h-5" style={{ color: '#9CA3AF' }} />}
          </button>
          {mostrarHistorial && (
            <div className="mt-4 flex flex-col" style={{ gap: '0.6rem' }}>
              {cargandoEventos ? (
                <p className="text-sm" style={{ color: '#9CA3AF' }}>Cargando eventos...</p>
              ) : errorEventos ? (
                <p className="text-sm" style={{ color: '#EF4444' }}>{errorEventos}</p>
              ) : sesionesHistorial.length === 0 ? (
                <p className="text-sm" style={{ color: '#9CA3AF' }}>Sin eventos registrados</p>
              ) : (
                sesionesHistorial.map((sesion, i) => {
                  const num = sesionesHistorial.length - i;
                  const trabajos = [...sesion.tipos]
                    .filter(t => t !== 'Vacunacion')
                    .map(t => TIPO_LABEL[t] ?? t)
                    .join(' · ');
                  return (
                    <div key={i} className="flex items-center gap-2" style={{ padding: '0.25rem 0' }}>
                      <span className="text-xs font-bold flex-shrink-0" style={{ color: 'var(--verde-medio)', minWidth: '2rem' }}>
                        #{num}
                      </span>
                      <span className="text-xs font-medium flex-shrink-0" style={{ color: '#374151' }}>
                        {sesion.fecha}
                      </span>
                      {trabajos && (
                        <>
                          <span className="text-xs flex-shrink-0" style={{ color: '#D1D5DB' }}>—</span>
                          <span className="text-xs" style={{ color: '#6B7280' }}>{trabajos}</span>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

      </div>

      </div>
    </div>
  );
}
