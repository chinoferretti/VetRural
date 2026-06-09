import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearAnimal, getLotes, existeCaravana } from '../api/animalesApi';
import { crearEstablecimiento } from '../api/establecimientosApi';
import api from '../api/axios';
import { useEstablecimiento } from '../context/EstablecimientoContext';
import { useAuth } from '../context/AuthContext';


const RAZAS = ['Angus', 'Hereford', 'Brangus', 'Braford', 'Holstein', 'Jersey', 'Charolais', 'Limousin', 'Simmental', 'Brahman', 'Nelore', 'Gyr'];
const TIPOS = ['Ternero', 'Novillito', 'Novillo', 'Vaquillona', 'Vaca', 'Torito', 'Toro'];
const LOTES_DEFAULT = [];
const SITUACIONES_TACTO = [
  { value: 'Preñada',       label: 'Preñada' },
  { value: 'Perdonada',     label: 'Perdonada' },
  { value: 'Frigorífico',   label: 'Frigorífico' },
  { value: 'Apta_Servicio', label: 'Apta servicio' },
];
const PERIODOS_PRENEZ = [
  { value: 'Menos_3_Meses',     label: 'Menos de 3 meses' },
  { value: 'Entre_3_y_6_Meses', label: 'Entre 3 y 6 meses' },
  { value: 'Mas_6_Meses',       label: 'Más de 6 meses' },
];
const DENTADURAS = [
  { value: 'De_Leche',   label: 'De leche' },
  { value: 'Mixta',      label: 'Mixta' },
  { value: 'Permanente', label: 'Permanente' },
];
const DIENTES_OPCIONES = [
  { value: 'Dos',    label: '2' },
  { value: 'Cuatro', label: '4' },
  { value: 'Seis',   label: '6' },
  { value: 'Ocho',   label: '8 (boca llena)' },
];
const DETERIOROS = ['Nulo', 'Leve', 'Moderado', 'Severo'];

const INICIAL = {
  // Obligatorios
  caravana: '',
  sexo: 'Hembra',
  // Generales opcionales
  fechaNacimiento: '',
  lote: '',
  raza: '',
  tipo: '',
  pelaje: '',
  // Boqueo
  boqueo_dientes: '',
  boqueo_deterioro: '',
  boqueo_dentadura: '',
  // Pesaje
  peso: '',
  // Tacto
  tacto_situacion: '',
  tacto_periodo: '',
  // Vacunación (fechas)
  vac_aftosa: '',
  vac_brucelosis: '',
  vac_carbunco: '',
  vac_clostridial: '',
  vac_ibr: '',
  vac_bvd: '',
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
  const { usuario } = useAuth();
  const [form, setForm]           = useState(INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito]         = useState(false);
  const [errores, setErrores]     = useState({});
  const [errorSubmit, setErrorSubmit] = useState('');
  const [lotes, setLotes]         = useState(LOTES_DEFAULT);
  const [nuevoLote, setNuevoLote] = useState('');
  const [agregandoLote, setAgregandoLote] = useState(false);
  const [caravanaExiste, setCaravanaExiste] = useState(false);

  // Cargar lotes del backend al montar
  useEffect(() => {
    getLotes().then(data => { if (data.length > 0) setLotes(data); }).catch(() => {});
  }, []);

  // Validar caravana duplicada con debounce
  useEffect(() => {
    if (!form.caravana || form.caravana.length < 3) { setCaravanaExiste(false); return; }
    const timer = setTimeout(() => {
      existeCaravana(form.caravana)
        .then(existe => setCaravanaExiste(existe))
        .catch(() => setCaravanaExiste(false));
    }, 500);
    return () => clearTimeout(timer);
  }, [form.caravana]);

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
    else if (caravanaExiste)   e.caravana = 'Esta caravana ya está registrada en el sistema';
    if (!form.sexo)            e.sexo     = 'El sexo es obligatorio';
    return e;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const e2 = validar();
  if (Object.keys(e2).length) { setErrores(e2); return; }
  setGuardando(true);
  try {
    // Resolver establecimientoId: si es string (local) o numérico que no existe en backend, crearlo
    let establecimientoId = seleccionado?.id;
    if (typeof establecimientoId !== 'number') {
      const est = await crearEstablecimiento(seleccionado.nombre);
      establecimientoId = est.id;
    }

    // 1. Crear el animal (con retry si el establecimiento numérico no existe en el backend)
    let animal;
    try {
      animal = await crearAnimal({
        caravana:  form.caravana,
        sexo:      form.sexo,
        nacimiento: form.fechaNacimiento || null,
        raza:      form.raza || null,
        tipo:      form.tipo || null,
        obs:       form.pelaje || null,
        establecimientoId,
      });
    } catch (err404) {
      if (err404?.response?.status === 404) {
        const est = await crearEstablecimiento(seleccionado.nombre);
        establecimientoId = est.id;
        animal = await crearAnimal({
          caravana:  form.caravana,
          sexo:      form.sexo,
          nacimiento: form.fechaNacimiento || null,
          raza:      form.raza || null,
          tipo:      form.tipo || null,
          obs:       form.pelaje || null,
          establecimientoId,
        });
      } else {
        throw err404;
      }
    }

    const bovinoId = animal.id;
    const registradoPorId = usuario.id;

    // 2. Lote (si seleccionó uno)
    if (form.lote) {
      await api.put(`/bovinos/${bovinoId}/lote`, null, { params: { lote: form.lote } });
    }

    // 4. Pesaje (si completó el peso)
    if (form.peso) {
      await api.post('/manga/pesaje', { bovinoId, registradoPorId, peso: Number(form.peso) });
    }

    // 5. Tacto (si completó situación)
    if (form.tacto_situacion) {
      await api.post('/manga/tacto', {
        bovinoId,
        registradoPorId,
        situacion: form.tacto_situacion,
        periodo:   form.tacto_periodo || null,
      });
    }

    // 6. Boqueo (si completó dientes)
    if (form.boqueo_dientes) {
      await api.post('/manga/boqueo', {
        bovinoId,
        registradoPorId,
        dientes:   form.boqueo_dientes,
        deterioro: form.boqueo_deterioro || null,
        dentadura: form.boqueo_dentadura || null,
      });
    }

    // 7. Vacunaciones (una por cada vacuna con fecha)
    const vacunas = [
      ['vac_aftosa',      'Aftosa'],
      ['vac_brucelosis',  'Brucelosis'],
      ['vac_carbunco',    'Carbunco'],
      ['vac_clostridial', 'Clostridial'],
      ['vac_ibr',         'IBR'],
      ['vac_bvd',         'BVD'],
    ];
    for (const [campo, vacuna] of vacunas) {
      if (form[campo]) {
        await api.post('/manga/vacunacion', { bovinoId, registradoPorId, vacuna });
      }
    }

    setExito(true);
    setTimeout(() => navigate('/animales', { replace: true }), 1500);
  } catch (err) {
    const data = err?.response?.data;
    const status = err?.response?.status;
    const msg = data?.message || data?.error
      || (typeof data === 'string' ? data : null)
      || (status ? `Error ${status} del servidor` : 'Sin conexión con el servidor');
    setErrorSubmit(msg);
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

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Nuevo animal</h1>
        <p className="mt-1" style={{ color: '#6B7280' }}>Los campos con <span style={{ color: '#EF4444' }}>*</span> son obligatorios</p>
      </div>

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
              style={{ ...inputSty, borderColor: errores.caravana || caravanaExiste ? '#EF4444' : '#D1D5DB', fontFamily: 'monospace', fontSize: '1rem' }}
            />
            {caravanaExiste && !errores.caravana && (
              <p className="text-xs mt-1" style={{ color: '#EF4444' }}>Esta caravana ya está registrada en el sistema</p>
            )}
            {errores.caravana && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errores.caravana}</p>}
          </Field>

          <Field label="Sexo" required>
            <select
              value={form.sexo}
              onChange={e => set('sexo', e.target.value)}
              className={inputCls}
              style={{ ...inputSty, borderColor: errores.sexo ? '#EF4444' : '#D1D5DB' }}
            >
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
                <input
                  autoFocus
                  value={nuevoLote}
                  onChange={e => setNuevoLote(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); confirmarNuevoLote(); } }}
                  placeholder="Nombre del lote"
                  className={inputCls} style={inputSty}
                />
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
            <input
              type="date"
              value={form.fechaNacimiento}
              onChange={e => set('fechaNacimiento', e.target.value)}
              className={inputCls}
              style={inputSty}
            />
          </Field>

          <Field label="Pelaje">
            <input
              value={form.pelaje}
              onChange={e => set('pelaje', e.target.value)}
              placeholder="Ej: Negro entero, colorado overo..."
              className={inputCls}
              style={inputSty}
            />
          </Field>
        </Seccion>

        {/* ── Boqueo ── */}
        <Seccion titulo="Boqueo" icono="🦷">
          <Field label="Cantidad de dientes">
            <select value={form.boqueo_dientes} onChange={e => set('boqueo_dientes', e.target.value)} className={inputCls} style={inputSty}>
              <option value=""></option>
              {DIENTES_OPCIONES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
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
              {DENTADURAS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </Field>
        </Seccion>

        {/* ── Pesaje ── */}
        <Seccion titulo="Pesaje" icono="⚖️">
          <Field label="Peso del animal (kg)">
            <input
              type="number" min="0"
              value={form.peso}
              onChange={e => set('peso', e.target.value)}
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
              {SITUACIONES_TACTO.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>

          {form.tacto_situacion === 'Preñada' && (
            <Field label="Período de preñez">
              <select value={form.tacto_periodo} onChange={e => set('tacto_periodo', e.target.value)} className={inputCls} style={inputSty}>
                <option value=""></option>
                {PERIODOS_PRENEZ.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
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
                type="date"
                value={form[campo]}
                onChange={e => set(campo, e.target.value)}
                className={inputCls} style={inputSty}
              />
            </Field>
          ))}
        </Seccion>

        {/* ── Acciones ── */}
        {errorSubmit && (
          <div className="rounded-2xl px-4 py-3 text-sm font-semibold" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
            {errorSubmit}
          </div>
        )}
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
