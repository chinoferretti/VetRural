import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Smile, Scale, Hand, Syringe } from 'lucide-react';

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

const DENTADURAS        = ['De leche', 'Mixta', 'Permanente'];
const DETERIOROS        = ['Nulo', 'Leve', 'Moderado', 'Severo'];
const SITUACIONES_TACTO = ['Preñada', 'Perdonada', 'Frigorífico', 'Apta servicio'];
const PERIODOS_PRENEZ   = ['-3 meses', '3 a 6 meses', '+6 meses'];

const inputCls = "w-full rounded-xl border bg-white";
const inputSty = { borderColor: '#D1D5DB', padding: 'clamp(0.7rem, 2vw, 0.95rem) 1rem', fontSize: 'clamp(0.9rem, 2vw, 1rem)' };

const HOY = new Date().toISOString().slice(0, 10);

function CampoVacuna({ label, value, onChange }) {
  const [prevValue, setPrevValue] = useState(null);

  const handleHoy = () => {
    setPrevValue(value);
    onChange(HOY);
  };

  const handleDeshacer = () => {
    onChange(prevValue);
    setPrevValue(null);
  };

  const handleManual = (v) => {
    setPrevValue(null);
    onChange(v);
  };

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

  const { trabajos, animal } = state;
  const esMacho = animal.sexo === 'Macho';
  const trabajosEfectivos = trabajos.filter(t => !(t === 'tacto' && esMacho));

  const [form, setForm] = useState({
    boqueo_dientes: '', boqueo_deterioro: '', boqueo_dentadura: '',
    peso: animal.peso ? String(animal.peso) : '',
    tacto_situacion: '', tacto_periodo: '',
    vac_aftosa: animal.ultimaVacuna || '', vac_brucelosis: animal.ultimaVacuna || '', vac_carbunco: animal.ultimaVacuna || '',
    vac_clostridial: animal.ultimaVacuna || '', vac_ibr: animal.ultimaVacuna || '', vac_bvd: animal.ultimaVacuna || '',
  });

  const set   = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }));
  const tiene = (t) => trabajosEfectivos.includes(t);

  const handleSiguiente = () => {
    const registro = { animal, trabajosEfectivos, form };
    const registros = [...(state.registros || []), registro];
    navigate('/sesion/animal', { state: { ...state, registros }, replace: true });
  };

  const handleFinalizar = () => {
    const registro = { animal, trabajosEfectivos, form };
    const registros = [...(state.registros || []), registro];
    navigate('/sesion/resumen', { state: { ...state, registros }, replace: true });
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
        <button onClick={cancelarSesion}
          className="px-5 py-3 rounded-xl font-semibold flex-shrink-0"
          style={{ backgroundColor: '#FEE2E2', color: '#EF4444', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
          Cancelar
        </button>
      </div>

      {/* Secciones */}
      {tiene('boqueo') && (
        <Seccion titulo="Boqueo" Icon={Smile}>
          <Campo label="Dientes">
            <input type="number" min="0" max="8" value={form.boqueo_dientes}
              onChange={e => set('boqueo_dientes', e.target.value)}
              placeholder="Ej: 4" className={inputCls} style={inputSty} />
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
              {DENTADURAS.map(d => <option key={d}>{d}</option>)}
            </select>
          </Campo>
        </Seccion>
      )}

      {tiene('pesaje') && (
        <Seccion titulo="Pesaje" Icon={Scale}>
          <Campo label="Peso (kg)">
            <input type="number" min="0" value={form.peso}
              onChange={e => set('peso', e.target.value)}
              placeholder="Ej: 420" className={inputCls} style={inputSty} />
          </Campo>
        </Seccion>
      )}

      {tiene('tacto') && (
        <Seccion titulo="Tacto" Icon={Hand}>
          <Campo label="Situación">
            <select value={form.tacto_situacion} onChange={e => set('tacto_situacion', e.target.value)}
              className={inputCls} style={inputSty}>
              <option value=""></option>
              {SITUACIONES_TACTO.map(s => <option key={s}>{s}</option>)}
            </select>
          </Campo>
          {form.tacto_situacion === 'Preñada' && (
            <Campo label="Período">
              <select value={form.tacto_periodo} onChange={e => set('tacto_periodo', e.target.value)}
                className={inputCls} style={inputSty}>
                <option value=""></option>
                {PERIODOS_PRENEZ.map(p => <option key={p}>{p}</option>)}
              </select>
            </Campo>
          )}
        </Seccion>
      )}

      {tiene('vacunacion') && (
        <Seccion titulo="Vacunación — Última dosis" Icon={Syringe}>
          {[
            ['vac_aftosa','Aftosa'], ['vac_brucelosis','Brucelosis'], ['vac_carbunco','Carbunco'],
            ['vac_clostridial','Clostridial'], ['vac_ibr','IBR'], ['vac_bvd','BVD'],
          ].map(([campo, label]) => (
            <CampoVacuna key={campo} label={label} value={form[campo]} onChange={v => set(campo, v)} />
          ))}
        </Seccion>
      )}

      {/* Acciones */}
      <div className="flex flex-col gap-3 pb-4" style={{ flexShrink: 0 }}>
        <button onClick={handleSiguiente} className="btn-primary w-full"
          style={{ padding: 'clamp(0.85rem, 2.5vw, 1.1rem)', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)' }}>
          Guardar y siguiente →
        </button>
        <button onClick={handleFinalizar}
          className="w-full rounded-xl font-semibold transition-colors"
          style={{ backgroundColor: '#F3F4F6', color: '#374151',
            padding: 'clamp(0.85rem, 2.5vw, 1.1rem)', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
          Terminar sesión
        </button>
      </div>

    </div>
  );
}
