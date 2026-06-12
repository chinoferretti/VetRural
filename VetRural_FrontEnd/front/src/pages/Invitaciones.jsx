import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEstablecimiento } from '../context/EstablecimientoContext';
import { getInvitaciones, removerInvitacion } from '../api/invitacionesApi';
import { MapPin } from 'lucide-react';

export default function Invitaciones() {
  const { usuario } = useAuth();
  const { unirse } = useEstablecimiento();

  const [invitaciones, setInvitaciones] = useState(() =>
    usuario ? getInvitaciones(usuario.id) : []
  );
  const [feedback, setFeedback] = useState(null);

  const handleAceptar = (inv) => {
    removerInvitacion(usuario.id, inv.id);
    unirse(inv.establecimiento);
    setInvitaciones(prev => prev.filter(i => i.id !== inv.id));
    setFeedback({ tipo: 'ok', msg: `Te uniste a ${inv.establecimiento.nombre}` });
  };

  const handleRechazar = (inv) => {
    removerInvitacion(usuario.id, inv.id);
    setInvitaciones(prev => prev.filter(i => i.id !== inv.id));
    setFeedback({ tipo: 'info', msg: `Invitación a ${inv.establecimiento.nombre} rechazada` });
  };

  return (
    <div className="flex flex-col w-full" style={{ gap: '2rem' }}>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Invitaciones</h1>
        <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>
          Establecimientos a los que fuiste invitado a unirte
        </p>
      </div>

      {feedback && (
        <div
          className="px-4 py-3 rounded-2xl text-sm font-medium"
          style={{
            backgroundColor: feedback.tipo === 'ok' ? '#D1FAE5' : '#EFF6FF',
            color: feedback.tipo === 'ok' ? '#065F46' : '#1E40AF',
          }}
        >
          {feedback.msg}
        </div>
      )}

      {invitaciones.length === 0 ? (
        <div className="card text-center" style={{ padding: '4rem 2rem' }}>
          <p className="text-lg font-semibold mb-2" style={{ color: '#374151' }}>
            Sin invitaciones pendientes
          </p>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            Cuando un Productor te invite a su establecimiento, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {invitaciones.map(inv => (
            <div
              key={inv.id}
              className="card"
              style={{ padding: '1.5rem', border: '1.5px solid #E5E7EB' }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#EBF7F1', border: '1.5px solid #C8E6D8' }}
                >
                  <MapPin className="w-6 h-6" style={{ color: 'var(--verde-medio)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg" style={{ color: 'var(--verde-oscuro)' }}>
                    {inv.establecimiento.nombre}
                  </p>
                  <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>
                    {inv.establecimiento.ubicacion}
                  </p>
                  <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>
                    Invitado por <strong style={{ color: '#374151' }}>{inv.remitente}</strong> · {inv.fecha}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleAceptar(inv)}
                  className="btn-primary flex-1"
                  style={{ padding: '0.75rem', fontSize: '0.95rem' }}
                >
                  Aceptar invitación
                </button>
                <button
                  onClick={() => handleRechazar(inv)}
                  className="flex-1 rounded-xl font-semibold transition-colors"
                  style={{
                    backgroundColor: '#F3F4F6',
                    color: '#374151',
                    padding: '0.75rem',
                    fontSize: '0.95rem',
                    border: 'none',
                  }}
                >
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
