import { useState, useEffect } from 'react';
import { useEstablecimiento } from '../context/EstablecimientoContext';
import { useAuth } from '../context/AuthContext';
import { guardarInvitacion, getMiembrosLocales } from '../api/invitacionesApi';

const ROL_CONFIG = {
  veterinario: { label: 'Veterinario', color: '#065F46', bg: '#D1FAE5' },
  productor:   { label: 'Productor',   color: 'var(--verde-oscuro)', bg: '#EBF7F1' },
  otros:       { label: 'Colaborador', color: '#374151', bg: '#F3F4F6' },
};

const ESTADO_CONFIG = {
  activo:    { label: 'Activo',    color: '#065F46', bg: '#D1FAE5' },
  pendiente: { label: 'Pendiente', color: '#92400E', bg: '#FEF3C7' },
};

function Badge({ tipo, valor }) {
  const cfg = tipo === 'rol' ? ROL_CONFIG[valor] : ESTADO_CONFIG[valor];
  if (!cfg) return null;
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      {cfg.label || valor}
    </span>
  );
}

function buscarUsuarioRegistrado(email) {
  try {
    const lista = JSON.parse(localStorage.getItem('vetrural_usuarios_registrados') || '[]');
    return lista.find(u => u.email === email) ?? null;
  } catch { return null; }
}

export default function Miembros() {
  const { seleccionado } = useEstablecimiento();
  const { usuario } = useAuth();

  const [miembros,     setMiembros]     = useState([]);
  const [invitaciones, setInvitaciones] = useState([]);
  const [email,        setEmail]        = useState('');
  const [feedback,     setFeedback]     = useState(null);

  useEffect(() => {
    setMiembros(seleccionado?.id ? getMiembrosLocales(seleccionado.id) : []);
  }, [seleccionado?.id]);

  const handleInvitar = (e) => {
    e.preventDefault();
    const emailTrimmed = email.trim().toLowerCase();
    if (!emailTrimmed || !emailTrimmed.includes('@')) {
      setFeedback({ tipo: 'error', msg: 'Ingresá un email válido.' });
      return;
    }

    const invitado = buscarUsuarioRegistrado(emailTrimmed);
    if (invitado) {
      const invitacion = {
        id: `inv-${Date.now()}`,
        establecimiento: {
          id:       seleccionado?.id ?? `mock-${Date.now()}`,
          nombre:   seleccionado?.nombre ?? 'Establecimiento',
          ubicacion: seleccionado?.ubicacion ?? '',
        },
        remitente: usuario?.nombre ?? 'Productor',
        fecha: new Date().toISOString().slice(0, 10),
      };
      guardarInvitacion(invitado.id, invitacion);
    }

    const nuevaInv = {
      id: `inv-${Date.now()}`,
      email: emailTrimmed,
      fechaEnvio: new Date().toISOString().slice(0, 10),
      estado: 'pendiente',
    };
    setInvitaciones(prev => [nuevaInv, ...prev]);
    setEmail('');
    setFeedback({ tipo: 'ok', msg: `Invitación enviada a ${emailTrimmed}` });
  };

  const handleRemoverMiembro = (m) => {
    if (!confirm(`¿Quitarle acceso a ${m.nombre}?`)) return;
    setMiembros(prev => prev.filter(x => x.id !== m.id));
  };

  const handleCancelarInvitacion = (inv) => {
    setInvitaciones(prev => prev.filter(i => i.id !== inv.id));
  };

  const invPendientes = invitaciones.filter(i => i.estado === 'pendiente');

  return (
    <div className="flex flex-col w-full" style={{ gap: '2rem' }}>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Miembros</h1>
        <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>
          {seleccionado?.nombre ?? 'Establecimiento'} · {miembros.length} miembro{miembros.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Invitar por email */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 className="font-bold mb-3" style={{ color: 'var(--verde-oscuro)', fontSize: '1.05rem' }}>
          Invitar usuario
        </h2>
        <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
          El usuario recibirá un email con un link para unirse al establecimiento. Puede ser veterinario, peón u otro colaborador.
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
            Invitar
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

      {/* Invitaciones pendientes */}
      {invPendientes.length > 0 && (
        <div>
          <h2 className="font-bold mb-3" style={{ color: 'var(--verde-oscuro)', fontSize: '1.05rem' }}>
            Invitaciones pendientes ({invPendientes.length})
          </h2>
          <div className="flex flex-col gap-2">
            {invPendientes.map(inv => (
              <div key={inv.id}
                className="bg-white rounded-2xl flex items-center gap-4"
                style={{ border: '1.5px solid #E5E7EB', padding: '1rem 1.25rem' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#EBF7F1', border: '1px solid #C8E6D8' }}>
                  <span className="text-sm font-bold" style={{ color: 'var(--verde-medio)' }}>@</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#111827' }}>{inv.email}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Enviada el {inv.fechaEnvio}</p>
                </div>
                <Badge tipo="estado" valor="pendiente" />
                <button onClick={() => handleCancelarInvitacion(inv)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}>
                  Cancelar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Miembros activos */}
      {miembros.length > 0 && (
        <div>
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
                <Badge tipo="rol" valor={m.rol} />
                {m.rol !== 'productor' && (
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
  );
}
