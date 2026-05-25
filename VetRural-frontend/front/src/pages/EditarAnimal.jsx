import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAnimalById, actualizarAnimal } from '../api/animalesApi';

const RAZAS = ['Angus', 'Hereford', 'Brangus', 'Braford', 'Holstein', 'Jersey', 'Charolais', 'Limousin', 'Simmental', 'Brahman', 'Nelore', 'Gyr'];
const TIPOS = ['Ternero', 'Novillito', 'Novillo', 'Vaquillona', 'Vaca', 'Torito', 'Toro'];
const LOTES_DEFAULT    = ['Lote Norte', 'Lote Sur', 'Lote Este', 'Reproductores'];
const SITUACIONES_TACTO = ['Preñada', 'Perdonada', 'Frigorífico', 'Apta servicio'];
const PERIODOS_PRENEZ  = ['-3 meses', '3 a 6 meses', '+6 meses'];
const DENTADURAS       = ['De leche', 'Mixta', 'Permanente'];
const DETERIOROS       = ['Nulo', 'Leve', 'Moderado', 'Severo'];

const inputCls = "w-full rounded-xl border bg-white";
const inputSty = { borderColor: '#D1D5DB', padding: '0.875rem 1.1rem', fontSize: '0.95rem' };

function Field({ label, children, nota }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold" style={{ color: '#374151' }}>{label}</label>
      {children}
      {nota && <p className="text-xs" style={{ color: '#9CA3AF' }}>{nota}</p>}
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

function CampoFijo({ label, valor }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold" style={{ color: '#374151' }}>{label}</label>
      <div
        className="w-full rounded-xl flex items-center"
        style={{ ...inputSty, backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', color: '#6B7280', fontFamily: label === 'Caravana electrónica' ? 'monospace' : undefined, fontSize: '1rem' }}
      >
        {valor}
      </div>
      <p className="text-xs" style={{ color: '#9CA3AF' }}>No se puede modificar</p>
    </div>
  );
}

export default function EditarAnimal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cargando, setCargando]   = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito]         = useState(false);
  const [form, setForm]           = useState(null);
  const [lotes, setLotes]         = useState(LOTES_DEFAULT);
  const [nuevoLote, setNuevoLote] = useState('');
  const [agregandoLote, setAgregandoLote] = useState(false);

  useEffect(() => {
  getAnimalById(id)
    .then(animal => {
      setForm({
        caravana:         animal.caravana,
        sexo:             animal.sexo,
        fechaNacimiento:  animal.nacimiento || '',
        lote:             animal.lote || '',
        raza:             animal.raza || '',
        tipo:             animal.tipo || '',
        pelaje:           animal.obs || '',
        boqueo_dientes:   '',
        boqueo_deterioro: '',
        boqueo_dentadura: '',
        peso:             '',
        tacto_situacion:  '',
        tacto_periodo:    '',
        vac_aftosa: '', vac_brucelosis: '', vac_carbunco: '',
        vac_clostridial: '', vac_ibr: '', vac_bvd: '',
      });
      setCargando(false);
    })
    .catch(() => setCargando(false));
}, [id]);

  const set = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }));

  const confirmarNuevoLote = () => {
    const nombre = nuevoLote.trim();
    if (!nombre || lotes.includes(nombre)) return;
    setLotes(prev => [...prev, nombre]);
    set('lote', nombre);
    setNuevoLote('');
    setAgregandoLote(false);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setGuardando(true);
  try {
    await actualizarAnimal(id, {
      caravana:          form.caravana,
      sexo:              form.sexo,
      nacimiento:        form.fechaNacimiento || null,
      lote:              form.lote || null,
      raza:              form.raza || null,
      tipo:              form.tipo || null,
      obs:               form.pelaje || null,
      establecimientoId: 1,
    });
    setExito(true);
    setTimeout(() => navigate('/animales', { replace: true }), 1500);
  } catch (err) {
    console.error(err);
  } finally {
    setGuardando(false);
  }
};

  if (cargando) return <LoadingSpinner texto="Cargando animal..." />;
  if (!form)    return (
    <div className="flex flex-col items-center justify-center py-24 gap-5">
      <p className="text-6xl">🐄</p>
      <p className="text-xl font-bold" style={{ color: '#374151' }}>Animal no encontrado</p>
      <button onClick={() => navigate('/animales')} className="btn-primary">Volver</button>
    </div>
  );

  if (exito) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-5">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl" style={{ backgroundColor: '#D1FAE5' }}>✅</div>
        <p className="text-2xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Cambios guardados</p>
        <p style={{ color: '#6B7280' }}>Redirigiendo al listado...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col" style={{ gap: '1.75rem' }}>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Editar animal</h1>
        <p className="mt-1 font-mono text-sm" style={{ color: '#9CA3AF' }}>{form.caravana}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: '1.75rem' }}>

        {/* ── Datos generales ── */}
        <Seccion titulo="Datos generales" icono="🐄">
          <CampoFijo label="Caravana electrónica" valor={form.caravana} />
          <CampoFijo label="Sexo" valor={form.sexo} />

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
                <input
                  autoFocus value={nuevoLote}
                  onChange={e => setNuevoLote(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); confirmarNuevoLote(); } }}
                  placeholder="Nombre del lote"
                  className={inputCls} style={inputSty}
                />
                <button type="button" onClick={confirmarNuevoLote}
                  className="flex items-center justify-center rounded-xl font-bold flex-shrink-0"
                  style={{ backgroundColor: 'var(--verde-medio)', color: 'white', minWidth: '3.2rem', minHeight: '3.2rem' }}>
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
                  style={{ backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB', minWidth: '3.2rem', minHeight: '3.2rem', fontSize: '1.4rem' }}>
                  +
                </button>
              </div>
            )}
          </Field>

          <Field
            label="Fecha de nacimiento"
            nota="Opcional. Si no se conoce, el boqueo determinará la edad."
          >
            <input
              type="date" value={form.fechaNacimiento}
              onChange={e => set('fechaNacimiento', e.target.value)}
              className={inputCls} style={inputSty}
            />
          </Field>

          <Field label="Pelaje">
            <input
              value={form.pelaje} onChange={e => set('pelaje', e.target.value)}
              placeholder="Ej: Negro entero, colorado overo..."
              className={inputCls} style={inputSty}
            />
          </Field>
        </Seccion>

        {/* ── Boqueo ── */}
        <Seccion titulo="Boqueo" icono="🦷">
          <Field
            label="Cantidad de dientes"
            nota={!form.fechaNacimiento ? 'Se usará para estimar la edad del animal' : undefined}
          >
            <input
              type="number" min="0" max="32"
              value={form.boqueo_dientes} onChange={e => set('boqueo_dientes', e.target.value)}
              placeholder="Ej: 8"
              className={inputCls} style={inputSty}
            />
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
            <input
              type="number" min="0"
              value={form.peso} onChange={e => set('peso', e.target.value)}
              placeholder="Ej: 420"
              className={inputCls} style={inputSty}
            />
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
            ['vac_aftosa',      'Aftosa'],
            ['vac_brucelosis',  'Brucelosis'],
            ['vac_carbunco',    'Carbunco'],
            ['vac_clostridial', 'Clostridial'],
            ['vac_ibr',         'IBR'],
            ['vac_bvd',         'BVD'],
          ].map(([campo, label]) => (
            <Field key={campo} label={label}>
              <input
                type="date" value={form[campo]}
                onChange={e => set(campo, e.target.value)}
                className={inputCls} style={inputSty}
              />
            </Field>
          ))}
        </Seccion>

        {/* ── Acciones ── */}
        <div className="flex gap-4 pb-8">
          <button type="button" onClick={() => navigate(`/animales/${id}`, { replace: true })} className="btn-secondary flex-1 justify-center">
            Cancelar
          </button>
          <button type="submit" disabled={guardando} className="btn-primary flex-1 justify-center disabled:opacity-60">
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>

      </form>
    </div>
  );
}
