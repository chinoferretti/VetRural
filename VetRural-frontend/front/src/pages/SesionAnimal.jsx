import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import animalesData from '../data/animales.json';

// Impide que el usuario use los botones de navegación del browser durante la sesión.
// Cualquier intento de "atrás / adelante" redirige al menú principal para evitar
// estados inconsistentes en los datos de la sesión.
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

function ModalNuevoAnimal({ caravanaInicial, onConfirmar, onCancelar }) {
  const [caravana, setCaravana] = useState(caravanaInicial);
  const [sexo, setSexo]         = useState('Hembra');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
      <div className="bg-white rounded-2xl w-full flex flex-col"
        style={{ maxWidth: '420px', padding: '2rem', gap: '1.5rem' }}>

        <div>
          <p className="text-lg font-bold" style={{ color: 'var(--verde-oscuro)' }}>Animal no registrado</p>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Completá los datos mínimos para continuar</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" style={{ color: '#374151' }}>Caravana</label>
          <input
            value={caravana}
            onChange={e => setCaravana(e.target.value.toUpperCase())}
            className="w-full rounded-xl border bg-white"
            style={{ borderColor: '#D1D5DB', padding: '0.875rem 1rem', fontSize: '1rem', fontFamily: 'monospace' }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" style={{ color: '#374151' }}>Sexo <span style={{ color: '#EF4444' }}>*</span></label>
          <div className="flex rounded-xl overflow-hidden" style={{ border: '2px solid #E5E7EB' }}>
            {[{ valor: 'Hembra', icono: '♀' }, { valor: 'Macho', icono: '♂' }].map(({ valor, icono }) => (
              <button key={valor} type="button" onClick={() => setSexo(valor)}
                className="flex-1 flex flex-col items-center justify-center font-bold transition-colors"
                style={{
                  padding: '1.1rem 0.5rem',
                  fontSize: '1.05rem',
                  gap: '0.25rem',
                  ...(sexo === valor
                    ? { backgroundColor: 'var(--verde-oscuro)', color: 'white' }
                    : { backgroundColor: 'white', color: '#6B7280' })
                }}>
                <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{icono}</span>
                {valor}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onCancelar}
            className="flex-1 py-3 rounded-xl font-semibold"
            style={{ backgroundColor: '#F3F4F6', color: '#374151' }}>
            Cancelar
          </button>
          <button onClick={() => onConfirmar({ caravana: caravana.trim(), sexo, nuevo: true })}
            className="btn-primary flex-1 py-3"
            disabled={!caravana.trim()}>
            Continuar →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SesionAnimal() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const sesion    = location.state;
  const inputRef  = useRef(null);
  useSessionGuard();

  const [caravana, setCaravana] = useState('');
  const [modalNuevo, setModalNuevo] = useState(false);

  if (!sesion?.trabajos) {
    navigate('/sesion', { replace: true });
    return null;
  }

  const buscar = () => {
    const q = caravana.trim().toUpperCase();
    if (!q) return;
    const animal = animalesData.find(a => a.caravana.toUpperCase() === q);
    if (animal) {
      continuar(animal);
    } else {
      setModalNuevo(true);
    }
  };

  const continuar = (animal) => {
    navigate('/sesion/registro', { state: { ...sesion, animal }, replace: true });
  };

  const limpiar = () => {
    setCaravana('');
    setModalNuevo(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const cancelarSesion = () => navigate('/dashboard', { replace: true });

  return (
    <div className="flex flex-col flex-1" style={{ gap: '1.25rem' }}>

      {/* Header */}
      <div className="flex items-center justify-between" style={{ flexShrink: 0 }}>
        <div>
          <h1 className="font-bold" style={{ color: 'var(--verde-oscuro)', fontSize: 'clamp(1.2rem, 3vw, 1.75rem)' }}>
            Identificar animal
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>
            {sesion.trabajos.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' · ')}
          </p>
        </div>
        <button onClick={cancelarSesion}
          className="px-5 py-3 rounded-xl font-semibold flex-shrink-0"
          style={{ backgroundColor: '#FEE2E2', color: '#EF4444', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
          Cancelar sesión
        </button>
      </div>

      {/* Input caravana — ocupa el espacio central */}
      <div className="card flex flex-col items-center justify-center flex-1"
        style={{ padding: 'clamp(1.5rem, 5vw, 3rem)', gap: '1.5rem' }}>
        <p className="font-semibold text-center" style={{ color: '#6B7280', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}>
          Ingresá la caravana del bovino
        </p>
        <input
          ref={inputRef}
          type="text"
          value={caravana}
          onChange={e => setCaravana(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && buscar()}
          placeholder="000000000000000"
          autoFocus
          className="w-full rounded-2xl border text-center"
          style={{
            borderColor: '#D1D5DB',
            padding: 'clamp(0.9rem, 2.5vw, 1.25rem)',
            fontSize: 'clamp(1.2rem, 4vw, 2rem)',
            fontFamily: 'monospace',
            letterSpacing: '0.1em',
            maxWidth: '480px',
          }}
        />
        <button onClick={buscar}
          className="btn-primary w-full"
          style={{ maxWidth: '480px', padding: 'clamp(0.9rem, 2.5vw, 1.2rem)', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)' }}>
          Buscar
        </button>
      </div>

      {/* Modal nuevo animal */}
      {modalNuevo && (
        <ModalNuevoAnimal
          caravanaInicial={caravana}
          onConfirmar={(animal) => { setModalNuevo(false); continuar(animal); }}
          onCancelar={() => { setModalNuevo(false); }}
        />
      )}
    </div>
  );
}
