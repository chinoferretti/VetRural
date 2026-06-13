import { useState, useEffect } from 'react';
import { useEstablecimiento } from '../context/EstablecimientoContext';
import { useAuth } from '../context/AuthContext';
import { getMiembros, removerMiembro, buscarUsuarioPorEmail } from '../api/usuariosApi';
import { asociarUsuario } from '../api/establecimientosApi';

const ROL_CONFIG = {
  veterinario: { label: 'Veterinario', color: '#065F46', bg: '#D1FAE5' },
  productor:   { label: 'Productor',   color: 'var(--verde-oscuro)', bg: '#EBF7F1' },
  otros:       { label: 'Colaborador', color: '#374151', bg: '#F3F4F6' },
};

function Badge({ valor }) {
  const cfg = ROL_CONFIG[valor];
  if (!cfg) return null;
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

export default function Miembros() {
  const { seleccionado } = useEstablecimiento();
  const { usuario } = useAuth();

  const [miembros,  setMiembros]  = useState([]);
  const [email,     setEmail]     = useState('');
  const [feedback,  setFeedback]  = useState(null);

  useEffect(() => {
    if (!seleccionado?.id) return;
    getMiembros(seleccionado.id).then(setMiembros);
  }, [seleccionado?.id]);

  const handleInvitar = async (e) => {
    e.preventDefault();
    const emailTrimmed = email.trim().toLowerCase();
    if (!emailTrimmed || !emailTrimmed.includes('@')) {
      setFeedback({ tipo: 'error', msg: 'Ingresá un email válido.' });
      return;
    }

    const invitado = await buscarUsuarioPorEmail(emailTrimmed);
    if (!invitado) {
      setFeedback({ tipo: 'error', msg: 'No se encontró ningún usuario con ese email.' });
      return;
    }

    try {
      await asociarUsuario(seleccionado.id, invitado.id);
      const actualizados = await getMiembros(seleccionado.id);
      setMiembros(actualizados);
      setEmail('');
      setFeedback({ tipo: 'ok', msg: `${invitado.nombre} fue agregado al establecimiento.` });
    } catch {
      setFeedback({ tipo: 'error', msg: 'No se pudo agregar al usuario. Intentá nuevamente.' });
    }
  };

  const handleRemoverMiembro = async (m) => {
    if (!confirm(`¿Quitarle acceso a ${m.nombre}?`)) return;
    try {
      await removerMiembro(seleccionado.id, m.id);
      setMiembros(prev => prev.filter(x => x.id !== m.id));
    } catch {
      setFeedback({ tipo: 'error', msg: 'No se pudo quitar al miembro.' });
    }
  };

  return (
    <div className="flex flex-col flex-1" style={{ minHeight: 0, overflow: 'hidden' }}>

      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Miembros</h1>
          <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>
            {seleccionado?.nombre ?? 'Establecimiento'} · {miembros.length} miembro{miembros.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 className="font-bold mb-3" style={{ color: 'var(--verde-oscuro)', fontSize: '1.05rem' }}>
            Agregar usuario
          </h2>
          <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
            Ingresá el email del usuario que querés agregar al establecimiento.
          </p>
          <form onSubmit={handleInvitar} className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setFeedback(null); }}
              placeholder="nombre@email.com"
              className="flex-1 rounded-xl border bg-white"
              style={{ borderColor: '#D1D5DB', padding: '0.875rem 1rem', fontSize: '1rem' }}
            />
            <button type="submit"
              className="btn-primary flex-shrink-0"
              style={{ padding: '0.875rem 1.5rem', fontSize: '1rem' }}>
              Agregar
            </button>
          </form>

          {feedback && (
            <div className="mt-3 px-4 py-3 rounded-xl text-sm font-medium"
              style={{
                backgroundColor: feedback.tipo === 'ok' ? '#D1FAE5' : '#FEE2E2',
                color: feedback.tipo === 'ok' ? '#065F46' : '#991B1B',
              }}>
              {feedback.msg}
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '0.5rem' }}>
        {miembros.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h2 className="font-bold mb-3" style={{ color: 'var(--verde-oscuro)', fontSize: '1.05rem' }}>
              Miembros activos
            </h2>
            <div className="flex flex-col gap-2">
              {miembros.map(m => (
                <div key={m.id}
                  className="bg-white rounded-2xl flex items-center gap-4"
                  style={{ border: '1.5px solid #E5E7EB', padding: '1rem 1.25rem' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                    style={{ backgroundColor: 'var(--verde-medio)', color: 'white', fontSize: '0.95rem' }}>
                    {m.nombre.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: '#111827' }}>{m.nombre}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: '#9CA3AF' }}>{m.email}</p>
                  </div>
                  <Badge valor={m.rol} />
                  {m.id !== usuario?.id && m.rol !== 'productor' && (
                    <button onClick={() => handleRemoverMiembro(m)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-red-50 transition-colors"
                      style={{ border: '1.5px solid #E5E7EB', color: '#EF4444' }}
                      title="Quitar miembro">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
