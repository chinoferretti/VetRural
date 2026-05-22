import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useEstablecimiento } from '../context/EstablecimientoContext';
import { getSesiones } from '../api/sesionesApi';
import { formatFecha } from '../utils/formatters';
import { generarHTMLReporte } from '../utils/reporteUtils';
import html2pdf from 'html2pdf.js';
import { Download } from 'lucide-react';

const TRABAJO_COLORES = {
  'Boqueo':     { bg: '#EBF7F1', text: '#1B4332' },
  'Pesaje':     { bg: '#EBF7F1', text: '#1B4332' },
  'Tacto':      { bg: '#EBF7F1', text: '#1B4332' },
  'Vacunación': { bg: '#EBF7F1', text: '#1B4332' },
};

function descargarReporte(sesion) {
  const fecha = new Date(sesion.fechaHora).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const html = generarHTMLReporte({
    fecha,
    establecimiento:  sesion.establecimientoNombre,
    veterinario:      sesion.veterinarioNombre,
    anotador:         sesion.anotador,
    totalAnimales:    sesion.totalAnimales,
    trabajosDisplay:  sesion.trabajos,
    metricas:         {},
  });
  const nombre = `sesion-vetrural-${sesion.fechaHora?.slice(0, 10) ?? 'reporte'}.pdf`;
  html2pdf()
    .set({ margin: [10, 10], filename: nombre,
           html2canvas: { scale: 2, useCORS: true, logging: false },
           jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } })
    .from(html)
    .save();
}

export default function Historial() {
  const { seleccionado } = useEstablecimiento();
  const [sesiones,  setSesiones]  = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [error,     setError]     = useState(null);
  const [busqueda,  setBusqueda]  = useState('');

  useEffect(() => {
    if (!seleccionado) { setSesiones([]); setCargando(false); return; }

    setCargando(true);
    setError(null);
    getSesiones(seleccionado.id)
      .then(({ data }) => setSesiones(data))
      .catch(() => setError('No se pudo cargar el historial.'))
      .finally(() => setCargando(false));
  }, [seleccionado?.id]);

  const filtradas = busqueda
    ? sesiones.filter(s =>
        formatFecha(s.fechaHora).toLowerCase().includes(busqueda.toLowerCase()) ||
        s.trabajos?.some(t => t.toLowerCase().includes(busqueda.toLowerCase())) ||
        s.veterinarioNombre?.toLowerCase().includes(busqueda.toLowerCase())
      )
    : sesiones;

  if (cargando) return <LoadingSpinner texto="Cargando sesiones..." />;

  return (
    <div className="flex flex-col w-full" style={{ gap: '1.75rem' }}>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Sesiones</h1>
        <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>
          {seleccionado
            ? `${filtradas.length} sesiones · ${seleccionado.nombre}`
            : 'Seleccioná un establecimiento para ver sus sesiones'}
        </p>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
          {error}
        </div>
      )}

      {!seleccionado ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-5xl">🏡</p>
          <p className="text-lg font-semibold" style={{ color: '#374151' }}>Seleccioná un establecimiento</p>
        </div>
      ) : (
        <>
          {/* Búsqueda */}
          <input
            type="text"
            placeholder="Buscar por fecha, trabajo o veterinario..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full rounded-2xl border bg-white"
            style={{ borderColor: '#D1D5DB', padding: '0.875rem 1.25rem', fontSize: '1rem' }}
          />

          {/* Lista */}
          {filtradas.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-5xl mb-4">📋</p>
              <p className="text-lg font-semibold" style={{ color: '#374151' }}>Sin sesiones registradas</p>
              <p className="mt-1" style={{ color: '#6B7280' }}>Las sesiones aparecerán aquí una vez que finalices una.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtradas.map(s => (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl flex items-center gap-4"
                  style={{ border: '1.5px solid #E5E7EB', padding: '1.25rem 1.5rem' }}
                >
                  {/* Fecha y equipo */}
                  <div className="flex-shrink-0" style={{ minWidth: '8rem' }}>
                    <p className="font-bold text-base" style={{ color: 'var(--verde-oscuro)' }}>
                      {formatFecha(s.fechaHora)}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                      {s.totalAnimales} animal{s.totalAnimales !== 1 ? 'es' : ''}
                    </p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: '#6B7280', maxWidth: '8rem' }}>
                      {s.veterinarioNombre}
                    </p>
                    {s.anotador && (
                      <p className="text-xs truncate" style={{ color: '#9CA3AF', maxWidth: '8rem' }}>
                        {s.anotador}
                      </p>
                    )}
                  </div>

                  {/* Trabajos */}
                  <div className="flex flex-wrap gap-2 flex-1">
                    {(s.trabajos ?? []).map(t => {
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
                  </div>

                  {/* Botón descargar */}
                  <button
                    onClick={() => descargarReporte(s)}
                    className="flex items-center justify-center w-11 h-11 rounded-xl transition-colors hover:bg-green-50 flex-shrink-0"
                    style={{ border: '1.5px solid #E5E7EB', color: 'var(--verde-medio)' }}
                    title="Descargar reporte PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
