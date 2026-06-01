import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import partesData from '../data/partes.json';
import { formatFecha, tipoParteColor } from '../utils/formatters';

export default function Partes() {
  const [partes, setPartes]       = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [descargando, setDescargando] = useState(null);
  const [busqueda, setBusqueda]   = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setPartes(partesData); setCargando(false); }, 500);
    return () => clearTimeout(t);
  }, []);

  const handleDescargar = (id) => {
    setDescargando(id);
    setTimeout(() => {
      setDescargando(null);
      alert('PDF generado correctamente (simulación). En producción se descargará desde el servidor.');
    }, 1200);
  };

  const filtrados = partes.filter(p =>
    !busqueda ||
    p.numero.includes(busqueda) ||
    p.tipo.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.veterinario.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.productor.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (cargando) return <LoadingSpinner texto="Cargando partes sanitarios..." />;

  const TD = '1.375rem 1.5rem';

  return (
    <div className="flex flex-col w-full" style={{ gap: '2.5rem' }}>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>
            Partes Sanitarios
          </h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>
            {filtrados.length} partes registrados
          </p>
        </div>
        <button
          className="btn-primary self-start sm:self-auto"
          onClick={() => alert('Función disponible con conexión al backend.')}
        >
          + Nuevo parte
        </button>
      </div>

      {/* ── Resumen KPIs ── */}
      <div className="grid grid-cols-3 gap-6">
        {[
          { label: 'Total partes', valor: partes.length,                          color: 'var(--verde-medio)', icon: '📄' },
          { label: 'Firmados',      valor: partes.filter(p => p.firmado).length,   color: '#10B981',            icon: '✅' },
          { label: 'Pendientes',    valor: partes.filter(p => !p.firmado).length,  color: '#F59E0B',            icon: '⏳' },
        ].map(({ label, valor, color, icon }) => (
          <div
            key={label}
            className="card flex items-center gap-5"
            style={{ borderTop: `4px solid ${color}` }}
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: color + '1A' }}
            >
              {icon}
            </div>
            <div>
              <p className="text-3xl font-bold leading-none" style={{ color }}>{valor}</p>
              <p className="text-sm mt-2" style={{ color: '#6B7280' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Buscador ── */}
      <div className="card" style={{ padding: '1.75rem 2.25rem' }}>
        <input
          type="text"
          placeholder="Buscar por número, tipo, veterinario o productor..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full rounded-xl border"
          style={{ borderColor: '#D1D5DB', padding: '0.875rem 1.25rem', fontSize: '0.9rem' }}
        />
      </div>

      {/* ── Tabla ── */}
      <div className="card overflow-x-auto" style={{ padding: 0, marginTop: '1rem' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '2px solid #F3F4F6', backgroundColor: '#FAFAFA' }}>
              {['Nro.', 'Fecha', 'Tipo', 'Veterinario', 'Animales', 'Estado', 'Acciones'].map(h => (
                <th
                  key={h}
                  className="text-left font-semibold text-xs uppercase tracking-wide"
                  style={{ color: '#9CA3AF', padding: '1.25rem 1.5rem' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center" style={{ padding: '4rem', color: '#9CA3AF' }}>
                  Sin partes encontrados
                </td>
              </tr>
            ) : (
              filtrados.map(p => (
                <tr
                  key={p.id}
                  className="hover:bg-gray-50 transition-colors"
                  style={{ borderBottom: '1px solid #F3F4F6' }}
                >
                  <td style={{ padding: TD }}>
                    <span className="font-mono font-bold text-sm" style={{ color: 'var(--verde-oscuro)' }}>
                      {p.numero}
                    </span>
                  </td>
                  <td style={{ padding: TD }} className="text-sm font-medium">
                    {formatFecha(p.fecha)}
                  </td>
                  <td style={{ padding: TD }}>
                    <span
                      className="badge"
                      style={{ backgroundColor: tipoParteColor[p.tipo] || '#F3F4F6', color: '#374151' }}
                    >
                      {p.tipo}
                    </span>
                  </td>
                  <td style={{ padding: TD }}>
                    <p className="text-sm font-medium" style={{ color: '#374151' }}>{p.veterinario}</p>
                    <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Mat. {p.matrícula}</p>
                  </td>
                  <td style={{ padding: TD }} className="text-center">
                    <span className="text-lg font-bold" style={{ color: 'var(--verde-medio)' }}>
                      {p.animalesInvolucrados}
                    </span>
                  </td>
                  <td style={{ padding: TD }}>
                    {p.firmado ? (
                      <span className="badge" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
                        ✓ Firmado
                      </span>
                    ) : (
                      <span className="badge" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                        Pendiente
                      </span>
                    )}
                  </td>
                  <td style={{ padding: TD }}>
                    <button
                      onClick={() => handleDescargar(p.id)}
                      disabled={descargando === p.id}
                      className="btn-primary disabled:opacity-60"
                      style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                    >
                      {descargando === p.id ? '...' : '⬇ PDF'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
