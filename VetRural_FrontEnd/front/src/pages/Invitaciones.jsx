import { useEstablecimiento } from '../context/EstablecimientoContext';
import { MapPin } from 'lucide-react';

export default function Invitaciones() {
  const { lista, seleccionar, seleccionado, cargando } = useEstablecimiento();

  return (
    <div className="flex flex-col flex-1" style={{ minHeight: 0, overflow: 'hidden' }}>

      <div style={{ flexShrink: 0 }}>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Mis establecimientos</h1>
        <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>
          Establecimientos a los que fuiste agregado
        </p>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '0.5rem', marginTop: '1rem' }}>
        {cargando ? (
          <p className="text-sm" style={{ color: '#9CA3AF' }}>Cargando...</p>
        ) : lista.length === 0 ? (
          <div className="card text-center" style={{ padding: '4rem 2rem' }}>
            <p className="text-lg font-semibold mb-2" style={{ color: '#374151' }}>
              Sin establecimientos
            </p>
            <p className="text-sm" style={{ color: '#9CA3AF' }}>
              Cuando un Productor te agregue a su establecimiento, aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {lista.map(est => {
              const activo = seleccionado?.id === est.id;
              return (
                <div key={est.id}
                  className="card"
                  style={{
                    padding: '1.25rem 1.5rem',
                    border: activo ? '2px solid var(--verde-medio)' : '1.5px solid #E5E7EB',
                    backgroundColor: activo ? '#F0FDF4' : 'white',
                    cursor: 'pointer',
                  }}
                  onClick={() => seleccionar(est)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: activo ? '#EBF7F1' : '#F9FAFB', border: '1.5px solid #C8E6D8' }}>
                      <MapPin className="w-5 h-5" style={{ color: 'var(--verde-medio)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold" style={{ color: 'var(--verde-oscuro)' }}>{est.nombre}</p>
                      {est.ubicacion && (
                        <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>{est.ubicacion}</p>
                      )}
                    </div>
                    {activo && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                        style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
                        Activo
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
