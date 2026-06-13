import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEstablecimiento } from '../context/EstablecimientoContext';
import { getInvitacionesPendientes, aceptarInvitacion, rechazarInvitacion } from '../api/invitacionesApi';
import { MapPin } from 'lucide-react';

export default function Invitaciones() {
  const { usuario } = useAuth();
  const { recargar } = useEstablecimiento();

  const [invitaciones, setInvitaciones] = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [feedback,     setFeedback]     = useState(null);

  useEffect(() => {
    if (!usuario) return;
    getInvitacionesPendientes(usuario.id)
      .then(setInvitaciones)
      .finally(() => setCargando(false));
  }, [usuario]);

  const handleAceptar = async (inv) => {
    try {
      await aceptarInvitacion(inv.id);
      setInvitaciones(prev => prev.filter(i => i.id !== inv.id));
      setFeedback({ tipo: 'ok', msg: `Te uniste a ${inv.establecimientoNombre}` });
      recargar();
    } catch {
      setFeedback({ tipo: 'error', msg: 'No se pudo aceptar la invitación.' });
    }
  };

  const handleRechazar = async (inv) => {
    try {
      await rechazarInvitacion(inv.id);
      setInvitaciones(prev => prev.filter(i => i.id !== inv.id));
      setFeedback({ tipo: 'info', msg: `Invitación a ${inv.establecimientoNombre} rechazada` });
    } catch {
      setFeedback({ tipo: 'error', msg: 'No se pudo rechazar la invitación.' });
    }
  };

  const formatFecha = (f) => {
    if (!f) return '';
    return new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="flex flex-col flex-1" style={{ minHeight: 0, overflow: 'hidden' }}>

      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Invitaciones</h1>
          <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>
            Establecimientos a los que fuiste invitado a unirte
          </p>
        </div>

        {feedback && (
          <div className="px-4 py-3 rounded-2xl text-sm font-medium"
            style={{
              backgroundColor: feedback.tipo === 'ok' ? '#D1FAE5' : feedback.tipo === 'error' ? '#FEE2E2' : '#EFF6FF',
              color: feedback.tipo === 'ok' ? '#065F46' : feedback.tipo === 'error' ? '#991B1B' : '#1E40AF',
            }}>
            {feedback.msg}
          </div>
        )}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '0.5rem', marginTop: '1rem' }}>
        {cargando ? (
          <p className="text-sm" style={{ color: '#9CA3AF' }}>Cargando...</p>
        ) : invitaciones.length === 0 ? (
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
              <div key={inv.id} className="card" style={{ padding: '1.5rem', border: '1.5px solid #E5E7EB' }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#EBF7F1', border: '1.5px solid #C8E6D8' }}>
                    <MapPin className="w-5 h-5" style={{ color: 'var(--verde-medio)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg" style={{ color: 'var(--verde-oscuro)' }}>
                      {inv.establecimientoNombre}
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                      Invitado por <strong style={{ color: '#374151' }}>{inv.remitente}</strong>
                      {inv.fecha ? ` · ${formatFecha(inv.fecha)}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button onClick={() => handleAceptar(inv)}
                    className="btn-primary flex-1"
                    style={{ padding: '0.75rem', fontSize: '0.95rem' }}>
                    Aceptar
                  </button>
                  <button onClick={() => handleRechazar(inv)}
                    className="flex-1 rounded-xl font-semibold"
                    style={{ backgroundColor: '#F3F4F6', color: '#374151', padding: '0.75rem', fontSize: '0.95rem' }}>
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
