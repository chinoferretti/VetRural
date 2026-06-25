import { useState, useEffect } from 'react';
import { useEstablecimiento } from '../context/EstablecimientoContext';
import { useAuth } from '../context/AuthContext';
import { MapPin, Trash2, X } from 'lucide-react';
import { getInvitacionesPendientes, aceptarInvitacion, rechazarInvitacion } from '../api/invitacionesApi';

export default function EstablecimientoModal({ onClose, requerido = false }) {
  const { lista, seleccionado, seleccionar, crear, eliminar, salir, cargando, recargar } = useEstablecimiento();
  const { usuario, logout } = useAuth();
  const esProductor = usuario?.rol === 'productor';

  const [modo,            setModo]           = useState('lista');
  const [form,            setForm]           = useState({ nombre: '', ubicacion: '' });
  const [error,           setError]          = useState('');
  const [confirmEliminar, setConfirmEliminar] = useState(null);
  const [confirmSalir,    setConfirmSalir]    = useState(null);
  const [invitaciones,    setInvitaciones]    = useState([]);

  const esBloqueante = requerido && !cargando && lista.length === 0 && !esProductor;

  useEffect(() => {
    if (!esBloqueante || !usuario?.id) return;
    getInvitacionesPendientes(usuario.id).then(setInvitaciones);
  }, [esBloqueante, usuario?.id]);

  const handleAceptar = async (inv) => {
    try {
      await aceptarInvitacion(inv.id);
      setInvitaciones(prev => prev.filter(x => x.id !== inv.id));
      await recargar();
    } catch { /* ignorar */ }
  };

  const handleRechazar = async (inv) => {
    try {
      await rechazarInvitacion(inv.id);
      setInvitaciones(prev => prev.filter(x => x.id !== inv.id));
    } catch { /* ignorar */ }
  };

  const handleSeleccionar = (est) => { seleccionar(est); onClose(); };

  const handleCrear = async () => {
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return; }
    try {
      const nuevo = await crear(form);
      seleccionar(nuevo);
      onClose();
    } catch {
      setError('No se pudo crear el establecimiento. Intentá nuevamente.');
    }
  };

  const handleEliminar = (id) => { eliminar(id); setConfirmEliminar(null); };
  const handleSalir    = async (id) => { await salir(id); setConfirmSalir(null); onClose(); };

  // Vista bloqueante para vet/otros sin establecimiento asignado
  if (esBloqueante) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <div className="w-full max-w-sm rounded-2xl bg-white" style={{ padding: '2rem' }}>
          <div className="text-center" style={{ marginBottom: '1.5rem' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#EBF7F1', border: '1.5px solid #C8E6D8' }}>
              <MapPin className="w-6 h-6" style={{ color: 'var(--verde-medio)' }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--verde-oscuro)' }}>
              Sin establecimiento asignado
            </h2>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              Todavía no pertenecés a ningún establecimiento. Un Productor debe invitarte para que puedas comenzar a trabajar.
            </p>
          </div>

          {invitaciones.length > 0 ? (
            <div style={{ marginBottom: '1.25rem' }}>
              <p className="text-sm font-semibold mb-3" style={{ color: '#374151' }}>
                Invitaciones pendientes
              </p>
              <div className="flex flex-col gap-2">
                {invitaciones.map(inv => (
                  <div key={inv.id} className="rounded-xl p-3 flex flex-col gap-2"
                    style={{ border: '1.5px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#111827' }}>
                        {inv.establecimientoNombre}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                        Invitado por {inv.remitente}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAceptar(inv)}
                        className="flex-1 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                        style={{ backgroundColor: 'var(--verde-medio)', color: 'white' }}>
                        Aceptar
                      </button>
                      <button onClick={() => handleRechazar(inv)}
                        className="flex-1 py-1.5 rounded-lg text-sm font-semibold transition-colors hover:bg-red-50"
                        style={{ border: '1.5px solid #E5E7EB', color: '#EF4444' }}>
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-center mb-5" style={{ color: '#9CA3AF' }}>
              No tenés invitaciones pendientes.
            </p>
          )}

          <button onClick={logout}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-gray-100"
            style={{ color: '#6B7280', border: '1.5px solid #E5E7EB' }}>
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={requerido ? undefined : onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white"
        style={{ padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>
              {modo === 'nuevo' ? 'Nuevo establecimiento' : 'Establecimientos'}
            </h2>
            {requerido && modo === 'lista' && (
              <p className="text-sm mt-0.5" style={{ color: '#EF4444' }}>
                Seleccioná uno para continuar
              </p>
            )}
          </div>
          {modo === 'nuevo' ? (
            <button onClick={() => { setModo('lista'); setError(''); setForm({ nombre: '', ubicacion: '' }); }}
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
              style={{ color: '#6B7280', border: '1.5px solid #E5E7EB' }}>
              <X className="w-4 h-4" />
            </button>
          ) : !requerido && (
            <button onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
              style={{ color: '#6B7280', border: '1.5px solid #E5E7EB' }}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {modo === 'lista' ? (
          <div className="flex flex-col" style={{ gap: '0.75rem' }}>

            {lista.length === 0 && (
              <div className="text-center py-8 rounded-2xl" style={{ border: '1.5px dashed #E5E7EB' }}>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>
                  {esProductor ? 'No hay establecimientos. Creá uno para comenzar.' : 'No pertenecés a ningún establecimiento aún.'}
                </p>
              </div>
            )}

            {lista.map(est => {
              const activo   = seleccionado?.id === est.id;
              const enAccion = confirmEliminar === est.id || confirmSalir === est.id;
              return (
                <div key={est.id}
                  onClick={() => { if (!activo && !enAccion) handleSeleccionar(est); }}
                  className="rounded-2xl"
                  style={{
                    border: activo ? '2px solid var(--verde-medio)' : '1.5px solid #E5E7EB',
                    backgroundColor: activo ? '#F0FDF4' : 'white',
                    padding: '0.875rem 1rem',
                    cursor: (!activo && !enAccion) ? 'pointer' : 'default',
                  }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: activo ? '#EBF7F1' : '#F9FAFB', border: '1px solid #E5E7EB' }}>
                      <MapPin className="w-4 h-4" style={{ color: 'var(--verde-medio)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate" style={{ color: 'var(--verde-oscuro)' }}>{est.nombre}</p>
                      {est.ubicacion && (
                        <p className="text-xs mt-0.5 truncate" style={{ color: '#9CA3AF' }}>{est.ubicacion}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {enAccion ? (
                        <>
                          <button
                            onClick={e => { e.stopPropagation(); confirmSalir === est.id ? handleSalir(est.id) : handleEliminar(est.id); }}
                            className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                            style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}>
                            Confirmar
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setConfirmEliminar(null); setConfirmSalir(null); }}
                            className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                            style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                            Cancelar
                          </button>
                        </>
                      ) : esProductor ? (
                        <button
                          onClick={e => { e.stopPropagation(); setConfirmEliminar(est.id); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50"
                          style={{ color: '#D1D5DB' }} title="Eliminar establecimiento">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={e => { e.stopPropagation(); setConfirmSalir(est.id); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50"
                          style={{ color: '#D1D5DB' }} title="Salir del establecimiento">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {esProductor && (
              <button
                onClick={() => { setModo('nuevo'); setError(''); }}
                className="w-full py-3 rounded-2xl font-semibold transition-colors hover:bg-gray-50"
                style={{ borderColor: '#D1D5DB', color: '#6B7280', border: '1.5px dashed #D1D5DB', marginTop: '0.25rem' }}>
                + Nuevo establecimiento
              </button>
            )}
          </div>

        ) : (
          <div className="flex flex-col" style={{ gap: '1rem' }}>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>
                Nombre <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="La Esperanza"
                value={form.nombre}
                onChange={e => { setForm(f => ({ ...f, nombre: e.target.value })); setError(''); }}
                className="w-full rounded-xl border"
                style={{ borderColor: error ? '#EF4444' : '#D1D5DB', padding: '0.75rem 1rem', fontSize: '1rem' }}
                autoFocus
              />
              {error && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{error}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>
                Ubicación
              </label>
              <input
                type="text"
                placeholder="Córdoba"
                value={form.ubicacion}
                onChange={e => setForm(f => ({ ...f, ubicacion: e.target.value }))}
                className="w-full rounded-xl border"
                style={{ borderColor: '#D1D5DB', padding: '0.75rem 1rem', fontSize: '1rem' }}
              />
            </div>

            <button onClick={handleCrear} className="btn-primary w-full" style={{ padding: '0.875rem', marginTop: '0.25rem' }}>
              Crear establecimiento
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
