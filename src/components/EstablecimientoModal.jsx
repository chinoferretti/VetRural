import { useState } from 'react';
import { useEstablecimiento } from '../context/EstablecimientoContext';

export default function EstablecimientoModal({ onClose, requerido = false }) {
  const { lista, seleccionado, seleccionar, crear, eliminar } = useEstablecimiento();
  const [modo, setModo] = useState('lista'); // 'lista' | 'nuevo'
  const [form, setForm] = useState({ nombre: '', ubicacion: '' });
  const [error, setError] = useState('');
  const [confirmEliminar, setConfirmEliminar] = useState(null);

  const handleSeleccionar = (est) => {
    seleccionar(est);
    onClose();
  };

  const handleCrear = () => {
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return; }
    const nuevo = crear(form);
    seleccionar(nuevo);
    onClose();
  };

  const handleEliminar = (id) => {
    eliminar(id);
    setConfirmEliminar(null);
  };

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
            {/* Lista de establecimientos */}
            <div className="flex flex-col gap-3 mb-5">
              {lista.length === 0 && (
                <p className="text-sm text-center py-6" style={{ color: '#9CA3AF' }}>
                  No hay establecimientos. Creá uno para comenzar.
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
                        <p className="text-sm" style={{ color: '#6B7280' }}>
                          {est.ubicacion}
                        </p>
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
                            <button
                              onClick={() => setConfirmEliminar(est.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50"
                              style={{ color: '#D1D5DB' }}
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => { setModo('nuevo'); setError(''); }}
              className="w-full py-3 rounded-xl font-semibold border-2 border-dashed transition-colors hover:bg-gray-50"
              style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
            >
              + Agregar establecimiento
            </button>
          </>
        ) : (
          <>
            {/* Formulario nuevo */}
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
              <button
                onClick={handleCrear}
                className="btn-primary flex-1 py-3"
              >
                Crear y seleccionar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
