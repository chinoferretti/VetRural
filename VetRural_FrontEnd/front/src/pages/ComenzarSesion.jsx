import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEstablecimiento } from '../context/EstablecimientoContext';
import { useAuth } from '../context/AuthContext';
import { getVeterinarios } from '../api/usuariosApi';
import { sincronizarUsuario } from '../utils/usuarioSync';
import { Smile, Scale, Hand, Syringe } from 'lucide-react';

const TRABAJOS = [
  { id: 'boqueo',     label: 'Boqueo',     Icono: Smile },
  { id: 'pesaje',     label: 'Pesaje',     Icono: Scale },
  { id: 'tacto',      label: 'Tacto',      Icono: Hand },
  { id: 'vacunacion', label: 'Vacunación', Icono: Syringe },
];

const inputCls = "w-full rounded-xl border bg-white";
const inputSty = { borderColor: '#D1D5DB', padding: 'clamp(0.5rem, 1.5vh, 0.875rem) 1rem', fontSize: '1rem' };

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

// ── Layout responsive para la grilla de trabajos ─────────────────────────────
function useLayoutTrabajos() {
  const get = () => {
    const w = window.innerWidth;
    if (w < 640)  return 'col';
    if (w < 1024) return '2x2';
    return 'row';
  };
  const [v, setV] = useState(get);
  useEffect(() => {
    const h = () => setV(get());
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return v;
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function ComenzarSesion() {
  const navigate = useNavigate();
  const { seleccionado } = useEstablecimiento();
  const { usuario } = useAuth();

  const [trabajos,          setTrabajos]          = useState([]);
  const [vetId,             setVetId]             = useState('');
  const [anotador,          setAnotador]          = useState('');
  const [error,             setError]             = useState('');
  const [vets,              setVets]              = useState([]);
  const [cargandoVets,      setCargandoVets]      = useState(true);
  const [especificarEquipo, setEspecificarEquipo] = useState(true);

  const layout = useLayoutTrabajos();
  const [containerStyle, btnStyle] = {
    col: [
      { display: 'flex', flexDirection: 'column', gap: 'clamp(0.35rem, 1vh, 0.5rem)' },
      { flexDirection: 'row', width: '100%', height: 'clamp(3rem, 8vh, 3.75rem)', padding: '0 clamp(0.75rem, 2vw, 1rem)', gap: 'clamp(0.4rem, 3vh, 0.75rem)', justifyContent: 'flex-start' },
    ],
    '2x2': [
      { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'clamp(0.4rem, 1.5vh, 0.75rem)', justifyItems: 'center' },
      { flexDirection: 'column', justifyContent: 'center', width: 'clamp(6rem, 20vh, 9rem)', aspectRatio: '1 / 1', padding: 'clamp(0.4rem, 1.2vh, 0.75rem)', gap: 'clamp(0.25rem, 0.8vh, 0.5rem)' },
    ],
    row: [
      { display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', gap: 'clamp(0.4rem, 1.5vh, 0.75rem)' },
      { flexDirection: 'column', justifyContent: 'center', flex: '0 0 auto', width: 'clamp(4.5rem, 13vh, 6rem)', aspectRatio: '1 / 1', padding: 'clamp(0.3rem, 0.8vh, 0.55rem)', gap: 'clamp(0.15rem, 0.5vh, 0.3rem)' },
    ],
  }[layout];

  useEffect(() => {
    const cargar = async () => {
      try {
        let lista = await getVeterinarios();
        if (usuario?.rol === 'veterinario') {
          try {
            const backendId = await sincronizarUsuario(usuario);
            const yaEsta = lista.some(v => String(v.id) === String(backendId));
            if (!yaEsta) {
              lista = [{ id: backendId, nombre: usuario.nombre, email: usuario.email, matricula: '', especialidad: 'Veterinario' }, ...lista];
            }
          } catch {
            // Si no se puede sincronizar, el veterinario deberá buscarse de la lista
          }
        }
        setVets(lista);
      } catch {
        setVets([]);
      } finally {
        setCargandoVets(false);
      }
    };
    cargar();
  }, [usuario]);

  const toggleTrabajo = (id) => {
    setError('');
    setTrabajos(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const handleComenzar = () => {
    if (trabajos.length === 0) { setError('Seleccioná al menos un trabajo para continuar.'); return; }
    if (especificarEquipo && !vetId) { setError('Seleccioná el veterinario responsable.'); return; }

    const vetSel = especificarEquipo ? vets.find(v => String(v.id) === String(vetId)) : null;
    navigate('/sesion/animal', {
      state: {
        trabajos,
        veterinarioId:        vetSel ? Number(vetSel.id) : null,
        veterinario:          vetSel?.nombre ?? '',
        veterinarioMatricula: vetSel?.matricula ?? '',
        anotador:             especificarEquipo ? anotador : '',
        establecimiento:      seleccionado?.nombre ?? '',
        establecimientoId:    seleccionado?.id ?? 1,
      },
      replace: true,
    });
  };

  return (
    <div className="flex flex-col flex-1" style={{ gap: 'clamp(0.5rem, 1.5vh, 1rem)', minHeight: 0, overflow: 'hidden' }}>

      {/* Header */}
      <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Preparar sesión</h1>
      </div>

      {/* Zona central: crece para llenar el espacio entre header y botón */}
      <div className="flex flex-col flex-1" style={{ gap: 'clamp(0.5rem, 1.5vh, 1rem)', minHeight: 0 }}>

        {/* Trabajos — fila única 1×4, altura determinada por los botones cuadrados */}
        <div className="card flex flex-col" style={{ padding: 'clamp(0.6rem, 1.5vh, 1.25rem)', gap: 'clamp(0.35rem, 1vh, 0.75rem)', flexShrink: 0 }}>
          <h2 className="font-semibold" style={{ color: 'var(--verde-oscuro)', fontSize: 'clamp(0.85rem, 1.8vh, 1rem)' }}>
            Trabajos a realizar
          </h2>
          <div style={containerStyle}>
            {TRABAJOS.map(({ id, label, Icono }) => {
              const activo = trabajos.includes(id);
              return (
                <button key={id} type="button" onClick={() => toggleTrabajo(id)}
                  className="btn-fill rounded-2xl transition-all active:scale-[0.97]"
                  style={{
                    display: 'flex', alignItems: 'center', overflow: 'hidden',
                    border: activo ? '3px solid var(--verde-medio)' : '2px solid #E5E7EB',
                    backgroundColor: activo ? '#F0FDF4' : 'white',
                    ...btnStyle,
                  }}>
                  <div className="fill-icono flex items-center justify-center"
                    style={{ backgroundColor: activo ? 'var(--verde-medio)' : '#F3F4F6' }}>
                    <Icono className="fill-svg" style={{ color: activo ? 'white' : '#6B7280' }} />
                  </div>
                  <p className="fill-label font-bold leading-tight"
                    style={{ color: activo ? 'var(--verde-medio)' : '#374151' }}>
                    {label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Equipo */}
        <div className="card flex flex-col" style={{ padding: 'clamp(0.6rem, 1.5vh, 1.25rem)', flexShrink: 0 }}>

          {/* Header tappable con toggle */}
          <button
            type="button"
            onClick={() => { setEspecificarEquipo(v => !v); setError(''); }}
            className="flex items-center justify-between w-full"
            style={{ minHeight: 'clamp(2rem, 4vh, 2.5rem)' }}
          >
            <h2 className="font-semibold" style={{ color: 'var(--verde-oscuro)', fontSize: 'clamp(0.85rem, 1.8vh, 1rem)' }}>
              Equipo de trabajo
            </h2>
            {/* Toggle switch */}
            <div style={{
              width: '2.75rem', height: '1.5rem', borderRadius: '999px', flexShrink: 0,
              backgroundColor: especificarEquipo ? 'var(--verde-medio)' : '#D1D5DB',
              position: 'relative', transition: 'background-color 0.2s',
            }}>
              <div style={{
                position: 'absolute',
                top: '0.2rem',
                left: especificarEquipo ? '1.35rem' : '0.2rem',
                width: '1.1rem', height: '1.1rem', borderRadius: '50%',
                backgroundColor: 'white',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </div>
          </button>

          {/* Campos — visibles solo cuando el toggle está activo */}
          {especificarEquipo && (
            <div className="flex flex-col" style={{ gap: 'clamp(0.4rem, 1vh, 1rem)', marginTop: 'clamp(0.5rem, 1.2vh, 0.875rem)' }}>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold" style={{ color: '#374151' }}>
                  Veterinario responsable <span style={{ color: '#EF4444' }}>*</span>
                </label>
                {cargandoVets ? (
                  <div className="rounded-xl border flex items-center gap-2"
                    style={{ borderColor: '#D1D5DB', padding: 'clamp(0.45rem, 1.2vh, 0.75rem) 1rem', color: '#9CA3AF', fontSize: '0.9rem' }}>
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

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold" style={{ color: '#374151' }}>Anotador</label>
                <input type="text" value={anotador}
                  onChange={e => setAnotador(e.target.value)}
                  placeholder="Nombre del anotador (opcional)"
                  className={inputCls} style={inputSty} />
              </div>
            </div>
          )}
        </div>

      </div>

      {error && (
        <div className="rounded-xl px-4 py-2 text-sm font-medium" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', flexShrink: 0 }}>
          {error}
        </div>
      )}

      <div style={{ flexShrink: 0, paddingTop: '1rem' }}>
        <button onClick={handleComenzar} className="btn-primary w-full"
          style={{ padding: 'clamp(0.7rem, 1.8vh, 1.1rem)', fontSize: 'clamp(0.95rem, 2vh, 1.1rem)', fontWeight: '700' }}>
          Comenzar sesión →
        </button>
      </div>

    </div>
  );
}
