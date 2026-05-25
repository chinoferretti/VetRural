import { useState } from 'react';
import { useEstablecimiento } from '../context/EstablecimientoContext';
import { useAuth } from '../context/AuthContext';
import { getInvitaciones, removerInvitacion } from '../api/invitacionesApi';

export default function EstablecimientoModal({ onClose, requerido = false }) {
  const { lista, seleccionado, seleccionar, crear, eliminar, unirse } = useEstablecimiento();
  const { usuario } = useAuth();
  const esProductor = usuario?.rol === 'productor';

  const [modo, setModo] = useState('lista'); // 'lista' | 'nuevo'
  const [form, setForm] = useState({ nombre: '', ubicacion: '' });
  const [error, setError] = useState('');
  const [confirmEliminar, setConfirmEliminar] = useState(null);

  // Invitaciones para vet/otros
  const [invitaciones, setInvitaciones] = useState(() =>
    !esProductor && usuario ? getInvitaciones(usuario.id) : []
  );

  const handleSeleccionar = (est) => { seleccionar(est); onClose(); };

  const handleCrear = () => {
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return; }
    const nuevo = crear(form);
    seleccionar(nuevo);
    onClose();
  };

  const handleEliminar = (id) => { eliminar(id); setConfirmEliminar(null); };

  const handleAceptar = (inv) => {
    removerInvitacion(usuario.id, inv.id);
    unirse(inv.establecimiento);
    setInvitaciones(prev => prev.filter(i => i.id !== inv.id));
    onClose();
  };

  const handleRechazar = (inv) => {
    removerInvitacion(usuario.id, inv.id);
    setInvitaciones(prev => prev.filter(i => i.id !== inv.id));
  };

  // Vista para vet/otros sin establecimientos (pantalla bloqueante)
  if (requerido && lista.length === 0 && !esProductor) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      >
        <div className="w-full max-w-lg rounded-2xl bg-white" style={{ padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">📬</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--verde-oscuro)' }}>
              Sin establecimiento asignado
            </h2>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              Todavía no pertenecés a ningún establecimiento. Un Productor debe invitarte para que puedas comenzar a trabajar.
            </p>
          </div>

          {invitaciones.length > 0 ? (
            <div>
              <h3 className="font-bold mb-3" style={{ color: 'var(--verde-oscuro)', fontSize: '1rem' }}>
                Invitaciones recibidas
              </h3>
              <div className="flex flex-col gap-3">
                {invitaciones.map(inv => (
                  <div key={inv.id} className="rounded-2xl p-4" style={{ border: '2px solid #E5E7EB' }}>
                    <div className="flex items-start gap-3 mb-3">
                      <span style={{ fontSize: '1.6rem' }}>🏡</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold" style={{ color: 'var(--verde-oscuro)' }}>{inv.establecimiento.nombre}</p>
                        <p className="text-sm" style={{ color: '#6B7280' }}>{inv.establecimiento.ubicacion}</p>
                        <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                          Invitado por {inv.remitente} · {inv.fecha}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAceptar(inv)}
                        className="btn-primary flex-1"
                        style={{ padding: '0.65rem', fontSize: '0.9rem' }}
                      >
                        Aceptar
                      </button>
                      <button
                        onClick={() => handleRechazar(inv)}
                        className="flex-1 rounded-xl font-semibold"
                        style={{ backgroundColor: '#FEE2E2', color: '#EF4444', padding: '0.65rem', fontSize: '0.9rem' }}
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: '#F9FAFB', border: '1.5px dashed #D1D5DB' }}>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>
                No tenés invitaciones pendientes. Contactá a un Productor para que te invite al establecimiento.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={requerido ? undefined : onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white"
        style={{ padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>
              Establecimientos de trabajo
            </h2>
            {requerido && (
              <p className="text-sm mt-1" style={{ color: '#EF4444' }}>
                Seleccioná un establecimiento para continuar
              </p>
            )}
          </div>
          {!requerido && (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
              style={{ color: '#6B7280', fontSize: '1.2rem' }}
            >
              ✕
            </button>
          )}
        </div>

        {modo === 'lista' ? (
          <>
            <div className="flex flex-col gap-3 mb-5">
              {lista.length === 0 && (
                <p className="text-sm text-center py-6" style={{ color: '#9CA3AF' }}>
                  {esProductor ? 'No hay establecimientos. Creá uno para comenzar.' : 'No pertenecés a ningún establecimiento aún.'}
                </p>
              )}
              {lista.map(est => {
                const activo = seleccionado?.id === est.id;
                return (
                  <div
                    key={est.id}
                    className="rounded-xl p-4"
                    style={{
                      border: activo ? '2px solid var(--verde-medio)' : '2px solid #E5E7EB',
                      backgroundColor: activo ? '#F0FDF4' : 'white',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: '1.6rem' }}>🏡</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold" style={{ color: 'var(--verde-oscuro)' }}>{est.nombre}</p>
                        <p className="text-sm" style={{ color: '#6B7280' }}>{est.ubicacion}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {confirmEliminar === est.id ? (
                          <>
                            <button
                              onClick={() => handleEliminar(est.id)}
                              className="text-sm px-5 py-3 rounded-xl font-semibold"
                              style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => setConfirmEliminar(null)}
                              className="text-sm px-5 py-3 rounded-xl font-semibold"
                              style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleSeleccionar(est)}
                              className="text-sm px-5 py-3 rounded-xl font-semibold transition-colors"
                              style={{
                                backgroundColor: activo ? 'var(--verde-medio)' : 'var(--verde-oscuro)',
                                color: 'white',
                              }}
                            >
                              {activo ? '✓ Activo' : 'Seleccionar'}
                            </button>
                            {esProductor && (
                              <button
                                onClick={() => setConfirmEliminar(est.id)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50"
                                style={{ color: '#D1D5DB' }}
                                title="Eliminar"
                              >
                                🗑️
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {esProductor && (
              <button
                onClick={() => { setModo('nuevo'); setError(''); }}
                className="w-full py-3 rounded-xl font-semibold border-2 border-dashed transition-colors hover:bg-gray-50"
                style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
              >
                + Agregar establecimiento
              </button>
            )}

            {/* Invitaciones para vet/otros en modo no bloqueante */}
            {!esProductor && invitaciones.length > 0 && (
              <div className="mt-5 pt-5" style={{ borderTop: '1.5px solid #F3F4F6' }}>
                <h3 className="font-bold mb-3" style={{ color: 'var(--verde-oscuro)', fontSize: '0.95rem' }}>
                  Invitaciones pendientes
                </h3>
                <div className="flex flex-col gap-2">
                  {invitaciones.map(inv => (
                    <div key={inv.id} className="rounded-xl p-3" style={{ border: '1.5px solid #E5E7EB' }}>
                      <div className="flex items-center gap-3">
                        <span style={{ fontSize: '1.2rem' }}>🏡</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate" style={{ color: 'var(--verde-oscuro)' }}>{inv.establecimiento.nombre}</p>
                          <p className="text-xs" style={{ color: '#6B7280' }}>{inv.establecimiento.ubicacion} · de {inv.remitente}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleAceptar(inv)}
                            className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                            style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}
                          >
                            Aceptar
                          </button>
                          <button
                            onClick={() => handleRechazar(inv)}
                            className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                            style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}
                          >
                            Rechazar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  Nombre del establecimiento *
                </label>
                <input
                  type="text"
                  placeholder="Ej: La Esperanza"
                  value={form.nombre}
                  onChange={e => { setForm(f => ({ ...f, nombre: e.target.value })); setError(''); }}
                  className="w-full px-4 py-3 rounded-xl border"
                  style={{ borderColor: error ? '#EF4444' : '#D1D5DB', fontSize: '1rem' }}
                  autoFocus
                />
                {error && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{error}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  Ubicación
                </label>
                <input
                  type="text"
                  placeholder="Ej: Córdoba"
                  value={form.ubicacion}
                  onChange={e => setForm(f => ({ ...f, ubicacion: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border"
                  style={{ borderColor: '#D1D5DB', fontSize: '1rem' }}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModo('lista')}
                className="flex-1 py-3 rounded-xl font-semibold transition-colors"
                style={{ backgroundColor: '#F3F4F6', color: '#374151' }}
              >
                Cancelar
              </button>
              <button onClick={handleCrear} className="btn-primary flex-1 py-3">
                Crear y seleccionar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
