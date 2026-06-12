import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PawPrint, Smile, Scale, Hand, Syringe, CheckCircle2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAnimalById, actualizarAnimal, getLotes } from '../api/animalesApi';
import api from '../api/axios';
import { useEstablecimiento } from '../context/EstablecimientoContext';
import { useAuth } from '../context/AuthContext';

const RAZAS = ['Angus', 'Hereford', 'Brangus', 'Braford', 'Holstein', 'Jersey', 'Charolais', 'Limousin', 'Simmental', 'Brahman', 'Nelore', 'Gyr'];
const TIPOS_HEMBRA = ['Ternera', 'Vaquillona', 'Vaca'];
const TIPOS_MACHO  = ['Ternero', 'Novillito', 'Novillo', 'Torito', 'Toro'];
const LOTES_DEFAULT = [];
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

function Seccion({ titulo, Icon, children }) {
  return (
    <div className="card flex flex-col" style={{ gap: '1.5rem', padding: '1.75rem' }}>
      <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: 'var(--verde-oscuro)' }}>
        {Icon && (
          <span className="flex items-center justify-center rounded-lg flex-shrink-0"
            style={{ backgroundColor: '#EBF7F1', border: '1.5px solid #C8E6D8', padding: '0.3rem' }}>
            <Icon className="w-4 h-4" style={{ color: 'var(--verde-medio)' }} />
          </span>
        )}
        {titulo}
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
        style={{ ...inputSty, backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', color: '#6B7280', fontFamily: label === 'Caravana' ? 'monospace' : undefined, fontSize: '1rem' }}
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
  const { seleccionado } = useEstablecimiento();
  const { usuario } = useAuth();
  const [cargando, setCargando]               = useState(true);
  const [guardando, setGuardando]             = useState(false);
  const [exito, setExito]                     = useState(false);
  const [form, setForm]                       = useState(null);
  const [originalClinico, setOriginalClinico] = useState({});
  const [lotes, setLotes]                     = useState(LOTES_DEFAULT);
  const [nuevoLote, setNuevoLote]             = useState('');
  const [agregandoLote, setAgregandoLote]     = useState(false);

  useEffect(() => {
    Promise.all([
      getAnimalById(id),
      api.get(`/manga/${id}/ultimo-pesaje`).catch(() => ({ data: null })),
      api.get(`/manga/${id}/ultimo-tacto`).catch(() => ({ data: null })),
      api.get(`/manga/${id}/ultimo-boqueo`).catch(() => ({ data: null })),
      api.get(`/manga/${id}/vacunaciones`).catch(() => ({ data: [] })),
    ])
      .then(([animal, pesajeRes, tactoRes, boqueoRes, vacunasRes]) => {
        if (animal.estado && animal.estado !== 'Activo') {
          navigate(`/animales/${id}`, { replace: true });
          return;
        }
        const pesaje  = pesajeRes.data  || {};
        const tacto   = tactoRes.data   || {};
        const boqueo  = boqueoRes.data  || {};
        const vacunas = vacunasRes.data  || [];

        const getVac = (nombre) => {
          const matching = vacunas.filter(v => v.vacuna === nombre);
          if (!matching.length) return '';
          const latest = matching.reduce((a, b) => (a.fechaHora > b.fechaHora ? a : b));
          return latest.fechaHora?.slice(0, 10) || '';
        };

        const clinico = {
          boqueo_dientes:   boqueo.dientes   || '',
          boqueo_deterioro: boqueo.deterioro || '',
          boqueo_dentadura: boqueo.dentadura || '',
          peso:             pesaje.peso ? String(pesaje.peso) : '',
          tacto_situacion:  tacto.situacion  || '',
          tacto_periodo:    tacto.periodo    || '',
          vac_aftosa:      getVac('Aftosa'),
          vac_brucelosis:  getVac('Brucelosis'),
          vac_carbunco:    getVac('Carbunco'),
          vac_clostridial: getVac('Clostridial'),
          vac_ibr:         getVac('IBR'),
          vac_bvd:         getVac('BVD'),
        };

        setOriginalClinico(clinico);
        setForm({
          caravana:        animal.caravana,
          sexo:            animal.sexo,
          apodo:           animal.apodo      || '',
          fechaNacimiento: animal.nacimiento || '',
          lote:            animal.lote       || '',
          raza:            animal.raza       || '',
          tipo:            animal.tipo       || '',
          pelaje:          animal.obs        || '',
          ...clinico,
        });
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, [id]);

  useEffect(() => {
    getLotes().then(data => { if (data.length > 0) setLotes(data); }).catch(() => {});
  }, []);

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
        apodo:             form.apodo || null,
        nacimiento:        form.fechaNacimiento || null,
        lote:              form.lote || null,
        raza:              form.raza || null,
        tipo:              form.tipo || null,
        obs:               form.pelaje || null,
        establecimientoId: seleccionado?.id ?? 1,
      });

      const bovinoId        = Number(id);
      const registradoPorId = usuario.id;

      if (form.peso && form.peso !== originalClinico.peso) {
        await api.post('/manga/pesaje', { bovinoId, registradoPorId, peso: Number(form.peso) });
      }

      if (form.boqueo_dientes && (
        form.boqueo_dientes   !== originalClinico.boqueo_dientes   ||
        form.boqueo_deterioro !== originalClinico.boqueo_deterioro ||
        form.boqueo_dentadura !== originalClinico.boqueo_dentadura
      )) {
        await api.post('/manga/boqueo', {
          bovinoId, registradoPorId,
          dientes:   form.boqueo_dientes,
          deterioro: form.boqueo_deterioro || null,
          dentadura: form.boqueo_dentadura || null,
        });
      }

      if (form.tacto_situacion && (
        form.tacto_situacion !== originalClinico.tacto_situacion ||
        form.tacto_periodo   !== originalClinico.tacto_periodo
      )) {
        await api.post('/manga/tacto', {
          bovinoId, registradoPorId,
          situacion: form.tacto_situacion,
          periodo:   form.tacto_periodo || null,
        });
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
        if (form[campo] && form[campo] !== originalClinico[campo]) {
          await api.post('/manga/vacunacion', { bovinoId, registradoPorId, vacuna, fechaAplicacion: form[campo] });
        }
      }

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
      <p className="text-xl font-bold" style={{ color: '#374151' }}>Animal no encontrado</p>
      <button onClick={() => navigate('/animales')} className="btn-primary">Volver</button>
    </div>
  );

  if (exito) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-5">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
          <CheckCircle2 className="w-10 h-10" style={{ color: 'var(--verde-medio)' }} />
        </div>
        <p className="text-2xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Cambios guardados</p>
        <p style={{ color: '#6B7280' }}>Redirigiendo al listado...</p>
      </div>
    );
  }

  const tiposDisponibles = form.sexo === 'Hembra' ? TIPOS_HEMBRA : TIPOS_MACHO;
  const notaClinico = 'Solo se registra si modificás el valor actual';

  return (
    <div className="w-full flex flex-col" style={{ gap: '1.75rem' }}>

      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Editar animal</h1>
        <p className="mt-1 font-mono text-sm" style={{ color: '#9CA3AF' }}>{form.caravana}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: '1.75rem' }}>

        {/* ── Datos generales ── */}
        <Seccion titulo="Datos generales" Icon={PawPrint}>
          <CampoFijo label="Caravana" valor={form.caravana} />
          <CampoFijo label="Sexo" valor={form.sexo} />

          <Field label="Apodo">
            <input
              value={form.apodo}
              onChange={e => set('apodo', e.target.value)}
              placeholder="Ej: Manchita, El Toro..."
              className={inputCls} style={inputSty}
            />
          </Field>

          <Field label="Raza">
            <select value={form.raza} onChange={e => set('raza', e.target.value)} className={inputCls} style={inputSty}>
              <option value=""></option>
              {RAZAS.map(r => <option key={r}>{r}</option>)}
            </select>
          </Field>

          <Field label="Tipo">
            <select value={form.tipo} onChange={e => set('tipo', e.target.value)} className={inputCls} style={inputSty}>
              <option value=""></option>
              {tiposDisponibles.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>

          <Field label="Pelaje">
            <input value={form.pelaje} onChange={e => set('pelaje', e.target.value)}
              placeholder="Ej: Negro entero, colorado overo..."
              className={inputCls} style={inputSty} />
          </Field>

          <Field label="Lote">
            {agregandoLote ? (
              <div className="flex gap-2">
                <input autoFocus value={nuevoLote}
                  onChange={e => setNuevoLote(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); confirmarNuevoLote(); } }}
                  placeholder="Nombre del lote" className={inputCls} style={inputSty}
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

          <Field label="Fecha de nacimiento" nota="Opcional. Si no se conoce, el boqueo determinará la edad.">
            <div className="flex gap-2">
              <input type="date" value={form.fechaNacimiento} onChange={e => set('fechaNacimiento', e.target.value)}
                className={inputCls} style={{ ...inputSty, flex: 1 }} />
              <button
                type="button"
                onClick={() => set('fechaNacimiento', fechaLocal())}
                className="flex-shrink-0 rounded-xl font-bold text-sm"
                style={{ backgroundColor: 'var(--verde-medio)', color: 'white', padding: '0 0.875rem' }}
              >
                HOY
              </button>
            </div>
          </Field>
        </Seccion>

        {/* ── Boqueo ── */}
        <Seccion titulo="Boqueo" Icon={Smile}>
          <Field label="Cantidad de dientes" nota={notaClinico}>
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
        <Seccion titulo="Pesaje" Icon={Scale}>
          <Field label="Peso del animal (kg)" nota={notaClinico}>
            <input type="number" min="0" value={form.peso} onChange={e => set('peso', e.target.value)}
              placeholder="Ej: 420" className={inputCls} style={inputSty} />
          </Field>
        </Seccion>

        {/* ── Tacto ── */}
        <Seccion titulo="Tacto" Icon={Hand}>
          <Field label="Situación" nota={notaClinico}>
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
        <Seccion titulo="Vacunación — Última dosis" Icon={Syringe}>
          {[
            ['vac_aftosa',      'Aftosa'],
            ['vac_brucelosis',  'Brucelosis'],
            ['vac_carbunco',    'Carbunco'],
            ['vac_clostridial', 'Clostridial'],
            ['vac_ibr',         'IBR'],
            ['vac_bvd',         'BVD'],
          ].map(([campo, label]) => (
            <Field key={campo} label={label}>
              <div className="flex gap-2">
                <input type="date" value={form[campo]} onChange={e => set(campo, e.target.value)}
                  className={inputCls} style={{ ...inputSty, flex: 1 }} />
                <button
                  type="button"
                  onClick={() => set(campo, fechaLocal())}
                  className="flex-shrink-0 rounded-xl font-bold text-sm"
                  style={{ backgroundColor: 'var(--verde-medio)', color: 'white', padding: '0 0.875rem' }}
                >
                  HOY
                </button>
              </div>
              {VACUNA_HINTS[campo] && (
                <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{VACUNA_HINTS[campo]}</p>
              )}
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
