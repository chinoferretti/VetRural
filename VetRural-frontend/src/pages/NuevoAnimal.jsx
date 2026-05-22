import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEstablecimiento } from '../context/EstablecimientoContext';
import { crearAnimal } from '../api/animalesApi';

// Razas alineadas con RazaBovinoEnum del backend
const RAZAS = ['Angus', 'Hereford', 'Brangus', 'Braford', 'Holstein', 'Jersey', 'Charolais', 'Limousin', 'Simmental', 'Brahman', 'Nelore', 'Gyr'];
const TIPOS  = ['Novillo', 'Novillito', 'Ternero', 'Vaquillona', 'Vaca', 'Torito', 'Toro'];
const SITUACIONES_TACTO = ['Preñada', 'Perdonada', 'Frigorífico', 'Apta servicio'];
const PERIODOS_PRENEZ   = ['-3 meses', '3 a 6 meses', '+6 meses'];
const DENTADURAS        = ['De leche', 'Mixta', 'Permanente'];
const DETERIOROS        = ['Nulo', 'Leve', 'Moderado', 'Severo'];

const INICIAL = {
  caravana: '', sexo: 'Hembra',
  fechaNacimiento: '', lote: '', raza: '', tipo: '', pelaje: '',
  boqueo_dientes: '', boqueo_deterioro: '', boqueo_dentadura: '',
  peso: '', tacto_situacion: '', tacto_periodo: '',
  vac_aftosa: '', vac_brucelosis: '', vac_carbunco: '',
  vac_clostridial: '', vac_ibr: '', vac_bvd: '',
};

const inputCls = "w-full rounded-xl border bg-white";
const inputSty = { borderColor: '#D1D5DB', padding: '0.875rem 1.1rem', fontSize: '0.95rem' };

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold" style={{ color: '#374151' }}>
        {label}{required && <span style={{ color: '#EF4444' }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function Seccion({ titulo, icono, children }) {
  return (
    <div className="card flex flex-col" style={{ gap: '1.5rem', padding: '1.75rem' }}>
      <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: 'var(--verde-oscuro)' }}>
        <span>{icono}</span> {titulo}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
        {children}
      </div>
    </div>
  );
}

export default function NuevoAnimal() {
  const navigate = useNavigate();
  const { seleccionado } = useEstablecimiento();
  const [form,      setForm]      = useState(INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [exito,     setExito]     = useState(false);
  const [errores,   setErrores]   = useState({});
  const [lotes,         setLotes]         = useState([]);
  const [nuevoLote,     setNuevoLote]     = useState('');
  const [agregandoLote, setAgregandoLote] = useState(false);

  const set = (campo, valor) => {
    setForm(f => ({ ...f, [campo]: valor }));
    setErrores(e => ({ ...e, [campo]: undefined }));
  };

  const confirmarNuevoLote = () => {
    const nombre = nuevoLote.trim();
    if (!nombre || lotes.includes(nombre)) return;
    setLotes(prev => [...prev, nombre]);
    set('lote', nombre);
    setNuevoLote('');
    setAgregandoLote(false);
  };

  const validar = () => {
    const e = {};
    if (!form.caravana.trim()) e.caravana = 'La caravana es obligatoria';
    if (!form.sexo)            e.sexo     = 'El sexo es obligatorio';
    if (!seleccionado?.id)     e.establecimiento = 'Seleccioná un establecimiento desde el menú superior antes de agregar animales';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validar();
    if (Object.keys(e2).length) { setErrores(e2); return; }

    setGuardando(true);
    try {
      await crearAnimal(form, seleccionado.id);
      setExito(true);
      setTimeout(() => navigate('/animales'), 1500);
    } catch (err) {
      const msg = err.response?.data?.message ?? err.message ?? 'Error al crear el animal';
      setErrores(prev => ({ ...prev, _global: msg }));
    } finally {
      setGuardando(false);
    }
  };

  if (exito) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-5">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl" style={{ backgroundColor: '#D1FAE5' }}>
          ✅
        </div>
        <p className="text-2xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Animal registrado</p>
        <p style={{ color: '#6B7280' }}>Redirigiendo al listado...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col" style={{ gap: '1.75rem' }}>

      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Nuevo animal</h1>
        <p className="mt-1" style={{ color: '#6B7280' }}>
          Los campos con <span style={{ color: '#EF4444' }}>*</span> son obligatorios
          {seleccionado && <span> · <strong>{seleccionado.nombre}</strong></span>}
        </p>
      </div>

      {errores.establecimiento && (
        <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
          {errores.establecimiento}
        </div>
      )}

      {errores._global && (
        <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
          {errores._global}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: '1.75rem' }}>

        {/* ── Datos generales ── */}
        <Seccion titulo="Datos generales" icono="🐄">
          <Field label="Caravana electrónica" required>
            <input
              autoFocus
              value={form.caravana}
              onChange={e => set('caravana', e.target.value.toUpperCase())}
              placeholder="000000000000000 (15 dígitos)"
              maxLength={15}
              className={inputCls}
              style={{ ...inputSty, borderColor: errores.caravana ? '#EF4444' : '#D1D5DB', fontFamily: 'monospace', fontSize: '1rem' }}
            />
            {errores.caravana && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errores.caravana}</p>}
          </Field>

          <Field label="Sexo" required>
            <select value={form.sexo} onChange={e => set('sexo', e.target.value)} className={inputCls}
              style={{ ...inputSty, borderColor: errores.sexo ? '#EF4444' : '#D1D5DB' }}>
              <option value="Hembra">Hembra</option>
              <option value="Macho">Macho</option>
            </select>
          </Field>

          <Field label="Tipo">
            <select value={form.tipo} onChange={e => set('tipo', e.target.value)} className={inputCls} style={inputSty}>
              <option value=""></option>
              {TIPOS.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>

          <Field label="Raza">
            <select value={form.raza} onChange={e => set('raza', e.target.value)} className={inputCls} style={inputSty}>
              <option value=""></option>
              {RAZAS.map(r => <option key={r}>{r}</option>)}
            </select>
          </Field>

          <Field label="Lote">
            {agregandoLote ? (
              <div className="flex gap-2">
                <input autoFocus value={nuevoLote}
                  onChange={e => setNuevoLote(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); confirmarNuevoLote(); } }}
                  placeholder="Nombre del lote" className={inputCls} style={inputSty} />
                <button type="button" onClick={confirmarNuevoLote}
                  className="flex items-center justify-center rounded-xl font-bold flex-shrink-0"
                  style={{ backgroundColor: 'var(--verde-medio)', color: 'white', minWidth: '3.2rem', minHeight: '3.2rem', fontSize: '1rem' }}>
                  OK
                </button>
                <button type="button" onClick={() => setAgregandoLote(false)}
                  className="flex items-center justify-center rounded-xl flex-shrink-0"
                  style={{ backgroundColor: '#F3F4F6', color: '#6B7280', minWidth: '3.2rem', minHeight: '3.2rem', fontSize: '1.2rem' }}>
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <select value={form.lote} onChange={e => set('lote', e.target.value)} className={inputCls} style={inputSty}>
                  <option value=""></option>
                  {lotes.map(l => <option key={l}>{l}</option>)}
                </select>
                <button type="button" onClick={() => setAgregandoLote(true)}
                  className="flex items-center justify-center rounded-xl font-bold flex-shrink-0"
                  style={{ backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB', minWidth: '3.2rem', minHeight: '3.2rem', fontSize: '1.4rem' }}
                  title="Nuevo lote">
                  +
                </button>
              </div>
            )}
          </Field>

          <Field label="Fecha de nacimiento">
            <input type="date" value={form.fechaNacimiento}
              onChange={e => set('fechaNacimiento', e.target.value)}
              className={inputCls} style={inputSty} />
          </Field>

          <Field label="Pelaje">
            <input value={form.pelaje} onChange={e => set('pelaje', e.target.value)}
              placeholder="Ej: Negro entero, colorado overo..."
              className={inputCls} style={inputSty} />
          </Field>
        </Seccion>

        {/* ── Boqueo ── */}
        <Seccion titulo="Boqueo" icono="🦷">
          <Field label="Cantidad de dientes">
            <input type="number" min="0" max="32"
              value={form.boqueo_dientes} onChange={e => set('boqueo_dientes', e.target.value)}
              placeholder="Ej: 8" className={inputCls} style={inputSty} />
          </Field>
          <Field label="Deterioro">
            <select value={form.boqueo_deterioro} onChange={e => set('boqueo_deterioro', e.target.value)} className={inputCls} style={inputSty}>
              <option value=""></option>
              {DETERIOROS.map(d => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Tipo de dentadura">
            <select value={form.boqueo_dentadura} onChange={e => set('boqueo_dentadura', e.target.value)} className={inputCls} style={inputSty}>
              <option value=""></option>
              {DENTADURAS.map(d => <option key={d}>{d}</option>)}
            </select>
          </Field>
        </Seccion>

        {/* ── Pesaje ── */}
        <Seccion titulo="Pesaje" icono="⚖️">
          <Field label="Peso del animal (kg)">
            <input type="number" min="0"
              value={form.peso} onChange={e => set('peso', e.target.value)}
              placeholder="Ej: 420" className={inputCls} style={inputSty} />
          </Field>
        </Seccion>

        {/* ── Tacto ── */}
        <Seccion titulo="Tacto" icono="🔍">
          <Field label="Situación">
            <select value={form.tacto_situacion} onChange={e => set('tacto_situacion', e.target.value)} className={inputCls} style={inputSty}>
              <option value=""></option>
              {SITUACIONES_TACTO.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          {form.tacto_situacion === 'Preñada' && (
            <Field label="Período de preñez">
              <select value={form.tacto_periodo} onChange={e => set('tacto_periodo', e.target.value)} className={inputCls} style={inputSty}>
                <option value=""></option>
                {PERIODOS_PRENEZ.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
          )}
        </Seccion>

        {/* ── Vacunación ── */}
        <Seccion titulo="Vacunación — Última dosis" icono="💉">
          {[
            ['vac_aftosa', 'Aftosa'], ['vac_brucelosis', 'Brucelosis'], ['vac_carbunco', 'Carbunco'],
            ['vac_clostridial', 'Clostridial'], ['vac_ibr', 'IBR'], ['vac_bvd', 'BVD'],
          ].map(([campo, label]) => (
            <Field key={campo} label={label}>
              <input type="date" value={form[campo]}
                onChange={e => set(campo, e.target.value)}
                className={inputCls} style={inputSty} />
            </Field>
          ))}
        </Seccion>

        <div className="flex gap-4 pb-8">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 justify-center">
            Cancelar
          </button>
          <button type="submit" disabled={guardando} className="btn-primary flex-1 justify-center disabled:opacity-60">
            {guardando ? 'Guardando...' : 'Registrar animal'}
          </button>
        </div>

      </form>
    </div>
  );
}
