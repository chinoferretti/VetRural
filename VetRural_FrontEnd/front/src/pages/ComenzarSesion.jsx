import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEstablecimiento } from '../context/EstablecimientoContext';
import { useAuth } from '../context/AuthContext';
import { getVeterinarios } from '../api/usuariosApi';
import { Smile, Scale, Hand, Syringe } from 'lucide-react';

const TRABAJOS = [
  { id: 'boqueo',     label: 'Boqueo',     Icono: Smile },
  { id: 'pesaje',     label: 'Pesaje',     Icono: Scale },
  { id: 'tacto',      label: 'Tacto',      Icono: Hand },
  { id: 'vacunacion', label: 'Vacunación', Icono: Syringe },
];

const inputCls = "w-full rounded-xl border bg-white";
const inputSty = { borderColor: '#D1D5DB', padding: '0.875rem 1rem', fontSize: '1rem' };

// ── Buscador de veterinarios (combobox) ────────────────────────────────────────
function VetCombobox({ vets, value, onChange, error }) {
  const [texto,   setTexto]   = useState('');
  const [abierto, setAbierto] = useState(false);
  const wrapRef = useRef(null);

  const vetSel = vets.find(v => String(v.id) === String(value));

  const filtrados = vets.filter(v =>
    texto === '' ||
    v.nombre.toLowerCase().includes(texto.toLowerCase()) ||
    v.matricula.toLowerCase().includes(texto.toLowerCase())
  );

  const handleInput = (e) => {
    setTexto(e.target.value);
    if (value) onChange('');  // limpia selección si el usuario vuelve a escribir
    setAbierto(true);
  };

  const handleSeleccionar = (vet) => {
    onChange(String(vet.id));
    setTexto('');
    setAbierto(false);
  };

  const handleLimpiar = () => {
    onChange('');
    setTexto('');
    setAbierto(false);
  };

  // cierra el dropdown si se hace click fuera
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div className="flex gap-2">
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            value={vetSel ? vetSel.nombre : texto}
            onChange={handleInput}
            onFocus={() => setAbierto(true)}
            placeholder="Buscar por nombre o matrícula…"
            readOnly={!!vetSel}
            className={inputCls}
            style={{
              ...inputSty,
              borderColor: error ? '#EF4444' : vetSel ? 'var(--verde-medio)' : '#D1D5DB',
              backgroundColor: vetSel ? '#F0FDF4' : 'white',
              paddingRight: vetSel ? '2.5rem' : undefined,
              cursor: vetSel ? 'default' : 'text',
            }}
          />
          {vetSel && (
            <button
              type="button"
              onMouseDown={handleLimpiar}
              style={{
                position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '1rem', lineHeight: 1,
              }}
              aria-label="Limpiar selección"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {vetSel && (
        <p className="text-xs mt-1 font-semibold" style={{ color: 'var(--verde-medio)' }}>
          ✓ {vetSel.especialidad || 'Veterinario'}
        </p>
      )}

      {/* Dropdown */}
      {abierto && !vetSel && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50,
            backgroundColor: 'white', border: '1.5px solid #D1D5DB', borderRadius: '0.75rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxHeight: '200px', overflowY: 'auto',
          }}
        >
          {filtrados.length === 0 ? (
            <div style={{ padding: '0.875rem 1rem', fontSize: '0.9rem', color: '#9CA3AF' }}>
              Sin resultados para "{texto}"
            </div>
          ) : (
            filtrados.map(v => (
              <button
                key={v.id}
                type="button"
                onMouseDown={() => handleSeleccionar(v)}
                className="w-full text-left hover:bg-green-50 transition-colors"
                style={{ padding: '0.75rem 1rem', display: 'block', border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <p className="text-sm font-semibold" style={{ color: 'var(--verde-oscuro)' }}>{v.nombre}</p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>{v.especialidad}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function ComenzarSesion() {
  const navigate = useNavigate();
  const { seleccionado } = useEstablecimiento();
  const { usuario } = useAuth();

  const [trabajos,     setTrabajos]     = useState([]);
  const [vetId,        setVetId]        = useState('');
  const [anotador,     setAnotador]     = useState('');
  const [error,        setError]        = useState('');
  const [vets,         setVets]         = useState([]);
  const [cargandoVets, setCargandoVets] = useState(true);

  useEffect(() => {
    getVeterinarios()
      .then(lista => {
        // Si el usuario logueado es veterinario y no está en la lista, lo agrega
        if (usuario?.rol === 'veterinario') {
          const yaEsta = lista.some(v => String(v.id) === String(usuario.id));
          if (!yaEsta) {
            lista = [{ id: usuario.id, nombre: usuario.nombre, email: usuario.email, matricula: '', especialidad: 'Veterinario' }, ...lista];
          }
        }
        setVets(lista);
      })
      .catch(() => setVets([]))
      .finally(() => setCargandoVets(false));
  }, [usuario]);

  const toggleTrabajo = (id) => {
    setError('');
    setTrabajos(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const handleComenzar = () => {
    if (trabajos.length === 0) { setError('Seleccioná al menos un trabajo para continuar.'); return; }
    if (!vetId)                { setError('Seleccioná el veterinario responsable.'); return; }

    const vetSel = vets.find(v => String(v.id) === String(vetId));
    navigate('/sesion/animal', {
      state: {
        trabajos,
        veterinarioId:       Number(vetSel?.id ?? vetId),
        veterinario:         vetSel?.nombre ?? vetId,
        veterinarioMatricula: vetSel?.matricula ?? '',
        anotador,
        establecimiento:     seleccionado?.nombre ?? '',
        establecimientoId:   seleccionado?.id ?? 1,
      },
      replace: true,
    });
  };

  return (
    <div className="flex flex-col flex-1" style={{ gap: '1.5rem' }}>

      {/* Header con ← */}
      <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>
        <button onClick={() => navigate('/dashboard')}
          className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 transition-colors hover:bg-gray-100"
          style={{ border: '1.5px solid #E5E7EB', color: '#6B7280' }}
          aria-label="Volver al menú principal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Preparar sesión</h1>
          {seleccionado && (
            <p className="text-sm font-medium" style={{ color: 'var(--verde-medio)' }}>
              📍 {seleccionado.nombre} — {seleccionado.ubicacion}
            </p>
          )}
        </div>
      </div>

      {/* Trabajos */}
      <div className="card flex flex-col" style={{ padding: '1.5rem', gap: '1rem', flexShrink: 0 }}>
        <h2 className="font-bold" style={{ color: 'var(--verde-oscuro)' }}>Trabajos a realizar</h2>
        <div className="grid grid-cols-2 gap-3" style={{ aspectRatio: '2 / 1' }}>
          {TRABAJOS.map(({ id, label, Icono }) => {
            const activo = trabajos.includes(id);
            return (
              <button key={id} type="button" onClick={() => toggleTrabajo(id)}
                className="flex flex-col items-center justify-center rounded-2xl transition-all active:scale-[0.97] w-full h-full"
                style={{
                  border: activo ? '3px solid var(--verde-medio)' : '2px solid #E5E7EB',
                  backgroundColor: activo ? '#F0FDF4' : 'white',
                  gap: '8%', padding: '8%',
                }}>
                <div className="flex items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: activo ? 'var(--verde-medio)' : '#F3F4F6',
                    padding: 'clamp(0.5rem, 2vw, 0.9rem)',
                  }}>
                  <Icono style={{
                    color: activo ? 'white' : '#6B7280',
                    width: 'clamp(1.5rem, 5vw, 2.5rem)',
                    height: 'clamp(1.5rem, 5vw, 2.5rem)',
                  }} />
                </div>
                <p className="font-bold leading-tight"
                  style={{ color: activo ? 'var(--verde-medio)' : '#374151', fontSize: 'clamp(0.9rem, 2.5vw, 1.4rem)' }}>
                  {label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Equipo */}
      <div className="card flex flex-col" style={{ padding: '1.5rem', gap: '1.25rem', flexShrink: 0 }}>
        <h2 className="font-bold" style={{ color: 'var(--verde-oscuro)' }}>Equipo de trabajo</h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" style={{ color: '#374151' }}>
            Veterinario responsable <span style={{ color: '#EF4444' }}>*</span>
          </label>
          {cargandoVets ? (
            <div className="rounded-xl border flex items-center gap-2"
              style={{ borderColor: '#D1D5DB', padding: '0.875rem 1rem', color: '#9CA3AF', fontSize: '0.95rem' }}>
              ⏳ Cargando veterinarios…
            </div>
          ) : (
            <VetCombobox
              vets={vets}
              value={vetId}
              onChange={(id) => { setVetId(id); setError(''); }}
              error={error && !vetId}
            />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" style={{ color: '#374151' }}>Anotador</label>
          <input type="text" value={anotador}
            onChange={e => setAnotador(e.target.value)}
            placeholder="Nombre del anotador (opcional)"
            className={inputCls} style={inputSty} />
        </div>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
          {error}
        </div>
      )}

      <div style={{ flexShrink: 0, paddingBottom: '1rem' }}>
        <button onClick={handleComenzar} className="btn-primary w-full"
          style={{ padding: '1.1rem', fontSize: '1.1rem', fontWeight: '700' }}>
          Comenzar sesión →
        </button>
      </div>

    </div>
  );
}
