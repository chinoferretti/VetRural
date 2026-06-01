import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatFecha } from '../utils/formatters';
import { generarHTMLReporte } from '../utils/reporteUtils';
import { Download, Trash2 } from 'lucide-react';

const TRABAJO_COLORES = {
  'Boqueo':      { bg: '#EBF7F1', text: '#1B4332' },
  'Pesaje':      { bg: '#EBF7F1', text: '#1B4332' },
  'Tacto':       { bg: '#EBF7F1', text: '#1B4332' },
  'Vacunación':  { bg: '#EBF7F1', text: '#1B4332' },
};

function descargarMetricas(sesion) {
  const fecha = new Date(sesion.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  const html = generarHTMLReporte({
    fecha,
    establecimiento:  sesion.establecimiento,
    veterinario:      sesion.veterinario,
    anotador:         sesion.anotador,
    totalAnimales:    sesion.animalesAtendidos.length,
    trabajosDisplay:  sesion.trabajos,
    metricas:         sesion.metricas || {},
    animalesAtendidos: sesion.animalesAtendidos,
    tratamientos:     sesion.tratamientos,
  });
  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}

export default function Historial() {
  const [visitas,      setVisitas]      = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [busqueda,     setBusqueda]     = useState('');
  const [confirmando,  setConfirmando]  = useState(null); // id de la sesión a eliminar

  useEffect(() => {
    try {
      const guardadas = JSON.parse(localStorage.getItem('vetrural_historial') || '[]');
      const ordenadas = [...guardadas].sort((a, b) => b.fecha.localeCompare(a.fecha));
      setVisitas(ordenadas);
    } catch {
      setVisitas([]);
    }
    setCargando(false);
  }, []);

  const eliminarSesion = (id) => {
    const nuevas = visitas.filter(v => v.id !== id);
    setVisitas(nuevas);
    setConfirmando(null);
    try {
      localStorage.setItem('vetrural_historial', JSON.stringify(nuevas));
    } catch { /* sin espacio */ }
  };

  const filtradas = busqueda
    ? visitas.filter(v =>
        formatFecha(v.fecha).toLowerCase().includes(busqueda.toLowerCase()) ||
        v.trabajos.some(t => t.toLowerCase().includes(busqueda.toLowerCase()))
      )
    : visitas;

  if (cargando) return <LoadingSpinner texto="Cargando sesiones..." />;

  return (
    <div className="flex flex-col w-full" style={{ gap: '1.75rem' }}>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Sesiones</h1>
        <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>{filtradas.length} sesiones registradas</p>
      </div>

      {/* Búsqueda */}
      <input
        type="text"
        placeholder="Buscar por fecha o trabajo..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        className="w-full rounded-2xl border bg-white"
        style={{ borderColor: '#D1D5DB', padding: '0.875rem 1.25rem', fontSize: '1rem' }}
      />

      {/* Lista */}
      {filtradas.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-lg font-semibold" style={{ color: '#374151' }}>Sin resultados</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtradas.map(v => (
            <div
              key={v.id}
              className="bg-white rounded-2xl flex items-center gap-4"
              style={{ border: '1.5px solid #E5E7EB', padding: '1.25rem 1.5rem' }}
            >
              {/* Fecha y equipo */}
              <div className="flex-shrink-0" style={{ minWidth: '8rem' }}>
                <p className="font-bold text-base" style={{ color: 'var(--verde-oscuro)' }}>
                  {formatFecha(v.fecha)}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                  {v.animalesAtendidos.length} animal{v.animalesAtendidos.length !== 1 ? 'es' : ''}
                </p>
                <p className="text-xs mt-0.5 truncate" style={{ color: '#6B7280', maxWidth: '8rem' }}>
                  {v.veterinario}
                </p>
                {v.anotador && (
                  <p className="text-xs truncate" style={{ color: '#9CA3AF', maxWidth: '8rem' }}>
                    {v.anotador}
                  </p>
                )}
              </div>

              {/* Trabajos */}
              <div className="flex flex-wrap gap-2 flex-1">
                {v.trabajos.map(t => {
                  const col = TRABAJO_COLORES[t] || { bg: '#EBF7F1', text: '#1B4332' };
                  return (
                    <span
                      key={t}
                      className="rounded-lg text-sm font-semibold"
                      style={{ backgroundColor: col.bg, color: col.text, border: '1px solid #C8E6D8', padding: '0.25rem 0.75rem' }}
                    >
                      {t}
                    </span>
                  );
                })}
                {v.metricas?.outliers?.length > 0 && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold"
                    style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                    ⚠️ {v.metricas.outliers.length} fuera de norma
                  </span>
                )}
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {confirmando === v.id ? (
                  <>
                    <button
                      onClick={() => eliminarSesion(v.id)}
                      className="px-3 py-2 rounded-xl text-sm font-semibold"
                      style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setConfirmando(null)}
                      className="px-3 py-2 rounded-xl text-sm font-semibold"
                      style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => descargarMetricas(v)}
                      className="flex items-center justify-center w-11 h-11 rounded-xl transition-colors hover:bg-green-50"
                      style={{ border: '1.5px solid #E5E7EB', color: 'var(--verde-medio)' }}
                      title="Descargar reporte"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmando(v.id)}
                      className="flex items-center justify-center w-11 h-11 rounded-xl transition-colors hover:bg-red-50"
                      style={{ border: '1.5px solid #E5E7EB', color: '#EF4444' }}
                      title="Eliminar sesión"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
