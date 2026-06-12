import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Smile, Scale, Hand, Syringe } from 'lucide-react';
import api from '../api/axios';

function useSessionGuard() {
  const navigate = useNavigate();
  useEffect(() => {
    window.history.pushState({ sesionActiva: true }, '');
    const onPop = () => navigate('/dashboard', { replace: true });
    const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('popstate',     onPop);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('popstate',     onPop);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [navigate]);
}

const DENTADURAS = [
  { value: 'De_Leche',   label: 'De leche' },
  { value: 'Mixta',      label: 'Mixta' },
  { value: 'Permanente', label: 'Permanente' },
];
const DETERIOROS = ['Nulo', 'Leve', 'Moderado', 'Severo'];
const DIENTES_OPCIONES = [
  { value: 'Dos',    label: '2' },
  { value: 'Cuatro', label: '4' },
  { value: 'Seis',   label: '6' },
  { value: 'Ocho',   label: '8 (boca llena)' },
];
const SITUACIONES_TACTO = [
  { value: 'Preñada',       label: 'Preñada' },
  { value: 'Perdonada',     label: 'Perdonada' },
  { value: 'Frigorífico',   label: 'Frigorífico' },
  { value: 'Apta_Servicio', label: 'Apta servicio' },
  { value: 'No_Aplica',     label: 'No aplica' },
];
const PERIODOS_PRENEZ = [
  { value: 'Menos_3_Meses',     label: 'Menos de 3 meses' },
  { value: 'Entre_3_y_6_Meses', label: 'Entre 3 y 6 meses' },
  { value: 'Mas_6_Meses',       label: 'Más de 6 meses' },
];

const inputCls = "w-full rounded-xl border bg-white";
const inputSty = { borderColor: '#D1D5DB', padding: 'clamp(0.7rem, 2vw, 0.95rem) 1rem', fontSize: 'clamp(0.9rem, 2vw, 1rem)' };

const fechaLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

const VACUNA_HINTS = {
  vac_aftosa:      'Obligatoria · 2 campañas anuales (SENASA)',
  vac_brucelosis:  'Obligatoria · Única dosis para terneras 3–8 meses',
  vac_carbunco:    'Opcional · Renovar cada 12 meses',
  vac_clostridial: 'Opcional · Renovar cada 12 meses',
  vac_ibr:         'Opcional · Renovar cada 12 meses',
  vac_bvd:         'Opcional · Renovar cada 12 meses',
};

function CampoVacuna({ label, value, onChange, hint }) {
  const [prevValue, setPrevValue] = useState(null);
  const handleHoy = () => { setPrevValue(value); onChange(fechaLocal()); };
  const handleDeshacer = () => { onChange(prevValue); setPrevValue(null); };
  const handleManual = (v) => { setPrevValue(null); onChange(v); };
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold" style={{ color: '#374151' }}>{label}</label>
      <div className="flex gap-2">
        <input type="date" value={value} onChange={e => handleManual(e.target.value)}
          className={inputCls} style={{ ...inputSty, flex: 1, minWidth: 0 }} />
        {prevValue !== null ? (
          <button type="button" onClick={handleDeshacer}
            className="rounded-xl text-sm font-semibold flex-shrink-0"
            style={{ padding: '0 0.75rem', backgroundColor: '#FEE2E2', color: '#EF4444', whiteSpace: 'nowrap' }}>
            Deshacer
          </button>
        ) : (
          <button type="button" onClick={handleHoy}
            className="rounded-xl text-sm font-semibold flex-shrink-0"
            style={{ padding: '0 0.875rem', backgroundColor: '#F0FDF4', color: 'var(--verde-oscuro)', border: '1px solid #86EFAC', whiteSpace: 'nowrap' }}>
            Hoy
          </button>
        )}
      </div>
      {hint && <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{hint}</p>}
    </div>
  );
}

function Seccion({ titulo, Icon, children }) {
  return (
    <div className="card" style={{ padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
      <h2 className="font-bold flex items-center gap-2 mb-4"
        style={{ color: 'var(--verde-oscuro)', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)' }}>
        {Icon && (
          <span className="flex items-center justify-center rounded-lg"
            style={{ backgroundColor: '#EBF7F1', border: '1.5px solid #C8E6D8', padding: '0.4rem', flexShrink: 0 }}>
            <Icon style={{ width: '1rem', height: '1rem', color: 'var(--verde-medio)' }} />
          </span>
        )}
        {titulo}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );
}

function Campo({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold" style={{ color: '#374151' }}>{label}</label>
      {children}
    </div>
  );
}

export default function SesionRegistro() {
  const navigate = useNavigate();
  const location = useLocation();
  const state    = location.state;
  useSessionGuard();

  if (!state?.animal) {
    navigate('/sesion', { replace: true });
    return null;
  }

  const { trabajos, animal, veterinarioId } = state;
  const esMacho = animal.sexo === 'Macho';
  const trabajosEfectivos = trabajos.filter(t => !(t === 'tacto' && esMacho));

  const TIPOS_HEMBRA = ['Ternera', 'Vaquillona', 'Vaca'];
  const TIPOS_MACHO  = ['Ternero', 'Novillito', 'Novillo', 'Torito', 'Toro'];
  const tiposDisponibles = esMacho ? TIPOS_MACHO : TIPOS_HEMBRA;

  const [tipoAnimal, setTipoAnimal] = useState(animal.tipo || '');
  const [form, setForm] = useState(() => ({
    boqueo_dientes: '', boqueo_deterioro: '', boqueo_dentadura: '',
    peso: '',
    tacto_situacion: (!esMacho && animal.tipo === 'Ternera') ? 'No_Aplica' : '',
    tacto_periodo: '',
    vac_aftosa: '', vac_brucelosis: '', vac_carbunco: '',
    vac_clostridial: '', vac_ibr: '', vac_bvd: '',
  }));
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState('');

  const handleTipoChange = (nuevoTipo) => {
    setTipoAnimal(nuevoTipo);
    if (!esMacho && nuevoTipo === 'Ternera') {
      setForm(f => ({ ...f, tacto_situacion: 'No_Aplica', tacto_periodo: '' }));
    } else if (!esMacho && tipoAnimal === 'Ternera') {
      setForm(f => ({ ...f, tacto_situacion: '', tacto_periodo: '' }));
    }
    api.put(`/bovinos/${animal.id}`, {
      caravana: animal.caravana, sexo: animal.sexo,
      establecimientoId: animal.establecimientoId,
      nacimiento: animal.nacimiento || null,
      lote: animal.lote || null,
      raza: animal.raza || null,
      tipo: nuevoTipo || null,
      obs: animal.observaciones || null,
      apodo: animal.apodo || null,
    }).catch(() => {});
  };

  const set   = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }));
  const tiene = (t) => trabajosEfectivos.includes(t);

  const guardarEventos = async () => {
    const bovinoId        = animal.id;
    const registradoPorId = veterinarioId;
    if (!bovinoId || !registradoPorId) return;

    const promises = [];

    if (tiene('pesaje') && form.peso) {
      promises.push(
        api.post('/manga/pesaje', { bovinoId, registradoPorId, peso: Number(form.peso) })
      );
    }
    if (tiene('tacto') && form.tacto_situacion) {
      promises.push(
        api.post('/manga/tacto', {
          bovinoId, registradoPorId,
          situacion: form.tacto_situacion,
          periodo:   form.tacto_periodo || null,
        })
      );
    }
    if (tiene('boqueo') && form.boqueo_dientes) {
      promises.push(
        api.post('/manga/boqueo', {
          bovinoId, registradoPorId,
          dientes:   form.boqueo_dientes,
          deterioro: form.boqueo_deterioro || null,
          dentadura: form.boqueo_dentadura || null,
        })
      );
    }
    const vacunas = [
      ['vac_aftosa',      'Aftosa'],
      ['vac_brucelosis',  'Brucelosis'],
      ['vac_carbunco',    'Carbunco'],
      ['vac_clostridial', 'Clostridial'],
      ['vac_ibr',         'IBR'],
      ['vac_bvd',         'BVD'],
    ];
    for (const [campo, vacuna] of vacunas) {
      if (tiene('vacunacion') && form[campo]) {
        promises.push(
          api.post('/manga/vacunacion', { bovinoId, registradoPorId, vacuna, fechaAplicacion: form[campo] })
        );
      }
    }
    const resultados = await Promise.allSettled(promises);
    const fallidos = resultados.filter(r => r.status === 'rejected');
    if (fallidos.length > 0) {
      const primer = fallidos[0].reason;
      const msg = primer?.response?.data?.error || primer?.message || 'Error al guardar datos';
      throw new Error(msg);
    }
  };

  const handleSiguiente = async () => {
    setGuardando(true);
    setErrorGuardado('');
    try {
      await guardarEventos();
      const registro = { animal, trabajosEfectivos, form };
      const registros = [...(state.registros || []), registro];
      navigate('/sesion/animal', { state: { ...state, registros }, replace: true });
    } catch (err) {
      setErrorGuardado(err.message || 'Error al guardar. Intentá de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  const handleFinalizar = async () => {
    setGuardando(true);
    setErrorGuardado('');
    try {
      await guardarEventos();
      const registro = { animal, trabajosEfectivos, form };
      const registros = [...(state.registros || []), registro];
      navigate('/sesion/resumen', { state: { ...state, registros }, replace: true });
    } catch (err) {
      setErrorGuardado(err.message || 'Error al guardar. Intentá de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  const cancelarSesion = () => navigate('/dashboard', { replace: true });

  return (
    <div className="flex flex-col flex-1" style={{ gap: '1rem' }}>

      {/* Header */}
      <div className="flex items-start justify-between gap-3" style={{ flexShrink: 0 }}>
        <div className="min-w-0">
          <p className="font-mono text-sm" style={{ color: '#9CA3AF' }}>{animal.caravana}</p>
          <h1 className="font-bold truncate"
            style={{ color: 'var(--verde-oscuro)', fontSize: 'clamp(1.2rem, 3vw, 1.75rem)' }}>
            {animal.nombre || animal.caravana}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{ backgroundColor: '#F3F4F6', color: '#374151' }}>
              {animal.sexo}
            </span>
            {trabajosEfectivos.map(t => (
              <span key={t} className="px-3 py-1 rounded-full text-sm font-semibold"
                style={{ backgroundColor: '#F0FDF4', color: 'var(--verde-medio)', border: '1px solid #86EFAC' }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </span>
            ))}
            {esMacho && trabajos.includes('tacto') && (
              <span className="px-3 py-1 rounded-full text-sm font-semibold"
                style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}>
                Sin tacto
              </span>
            )}
          </div>
        </div>
        <button onClick={cancelarSesion} disabled={guardando}
          className="px-5 py-3 rounded-xl font-semibold flex-shrink-0 disabled:opacity-50"
          style={{ backgroundColor: '#FEE2E2', color: '#EF4444', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
          Cancelar
        </button>
      </div>

      {/* Tipo */}
      <div className="card" style={{ padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
        <h2 className="font-bold mb-4"
          style={{ color: 'var(--verde-oscuro)', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)' }}>
          Tipo de animal
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold" style={{ color: '#374151' }}>Tipo</label>
            <select value={tipoAnimal} onChange={e => handleTipoChange(e.target.value)}
              className={inputCls} style={inputSty}>
              <option value=""></option>
              {tiposDisponibles.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Secciones */}
      {tiene('boqueo') && (
        <Seccion titulo="Boqueo" Icon={Smile}>
          <Campo label="Dientes">
            <select value={form.boqueo_dientes} onChange={e => set('boqueo_dientes', e.target.value)}
              className={inputCls} style={inputSty}>
              <option value=""></option>
              {DIENTES_OPCIONES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Campo>
          <Campo label="Deterioro">
            <select value={form.boqueo_deterioro} onChange={e => set('boqueo_deterioro', e.target.value)}
              className={inputCls} style={inputSty}>
              <option value=""></option>
              {DETERIOROS.map(d => <option key={d}>{d}</option>)}
            </select>
          </Campo>
          <Campo label="Dentadura">
            <select value={form.boqueo_dentadura} onChange={e => set('boqueo_dentadura', e.target.value)}
              className={inputCls} style={inputSty}>
              <option value=""></option>
              {DENTADURAS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </Campo>
        </Seccion>
      )}

      {tiene('pesaje') && (
        <Seccion titulo="Pesaje" Icon={Scale}>
          <Campo label="Peso (kg)">
            <input type="number" min="0" value={form.peso}
              onChange={e => set('peso', e.target.value)}
              onWheel={e => e.target.blur()}
              placeholder="Ej: 420" className={inputCls} style={inputSty} />
          </Campo>
        </Seccion>
      )}

      {tiene('tacto') && (
        <Seccion titulo="Tacto" Icon={Hand}>
          <Campo label="Situación">
            <select
              value={form.tacto_situacion}
              onChange={e => set('tacto_situacion', e.target.value)}
              disabled={tipoAnimal === 'Ternera'}
              className={inputCls}
              style={{ ...inputSty, ...(tipoAnimal === 'Ternera' ? { backgroundColor: '#F9FAFB', color: '#6B7280', cursor: 'not-allowed' } : {}) }}
            >
              {tipoAnimal !== 'Ternera' && <option value=""></option>}
              {SITUACIONES_TACTO.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            {tipoAnimal === 'Ternera' && (
              <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Las terneras se registran como "No aplica"</p>
            )}
          </Campo>
          {form.tacto_situacion === 'Preñada' && (
            <Campo label="Período">
              <select value={form.tacto_periodo} onChange={e => set('tacto_periodo', e.target.value)}
                className={inputCls} style={inputSty}>
                <option value=""></option>
                {PERIODOS_PRENEZ.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </Campo>
          )}
        </Seccion>
      )}

      {tiene('vacunacion') && (
        <Seccion titulo="Vacunación — Última dosis" Icon={Syringe}>
          {[
            ['vac_aftosa',      'Aftosa'],
            ['vac_brucelosis',  'Brucelosis'],
            ['vac_carbunco',    'Carbunco'],
            ['vac_clostridial', 'Clostridial'],
            ['vac_ibr',         'IBR'],
            ['vac_bvd',         'BVD'],
          ].map(([campo, label]) => (
            <CampoVacuna key={campo} label={label} value={form[campo]} onChange={v => set(campo, v)} hint={VACUNA_HINTS[campo]} />
          ))}
        </Seccion>
      )}

      {/* Error de guardado */}
      {errorGuardado && (
        <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', flexShrink: 0 }}>
          {errorGuardado}
        </div>
      )}

      {/* Acciones */}
      <div className="flex flex-col gap-3 pb-4" style={{ flexShrink: 0 }}>
        <button onClick={handleSiguiente} disabled={guardando}
          className="btn-primary w-full disabled:opacity-60"
          style={{ padding: 'clamp(0.85rem, 2.5vw, 1.1rem)', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)' }}>
          {guardando ? 'Guardando...' : 'Guardar y siguiente →'}
        </button>
      </div>

    </div>
  );
}
