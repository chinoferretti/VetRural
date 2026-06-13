import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatFecha } from '../utils/formatters';
import { generarHTMLReporte } from '../utils/reporteUtils';
import { Download, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEstablecimiento } from '../context/EstablecimientoContext';

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
  });
  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}

export default function Historial() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { seleccionado } = useEstablecimiento();
  const historialKey = `vetrural_historial_est_${seleccionado?.id || usuario?.id || 'anon'}`;

  const [visitas,      setVisitas]      = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [busqueda,     setBusqueda]     = useState('');
  const [confirmando,  setConfirmando]  = useState(null); // id de la sesión a eliminar

  useEffect(() => {
    window.history.pushState({ historial: true }, '');
    const onPop = () => navigate('/dashboard', { replace: true });
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [navigate]);

  useEffect(() => {
    try {
      const guardadas = JSON.parse(localStorage.getItem(historialKey) || '[]');
      const ordenadas = [...guardadas].sort((a, b) => b.fecha.localeCompare(a.fecha));
      setVisitas(ordenadas);
    } catch {
      setVisitas([]);
    }
    setCargando(false);
  }, [historialKey]);

  const eliminarSesion = (id) => {
    const nuevas = visitas.filter(v => v.id !== id);
    setVisitas(nuevas);
    setConfirmando(null);
    try {
      localStorage.setItem(historialKey, JSON.stringify(nuevas));
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
    <div className="flex flex-col flex-1" style={{ minHeight: 0, overflow: 'hidden' }}>

      {/* Header + Búsqueda (fijo) */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '0.75rem' }}>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Sesiones</h1>
          <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>{filtradas.length} sesiones registradas</p>
        </div>

        <input
          type="text"
          placeholder="Buscar por fecha o trabajo..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full rounded-2xl border bg-white"
          style={{ borderColor: '#D1D5DB', padding: '0.875rem 1.25rem', fontSize: '1rem' }}
        />
      </div>

      {/* Lista (scrolleable) */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '0.5rem' }}>
      {filtradas.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-lg font-semibold" style={{ color: '#374151' }}>Sin resultados</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtradas.map(v => (
            <div
              key={v.id}
              className="bg-white rounded-2xl flex flex-col"
              style={{ border: '1.5px solid #E5E7EB', padding: '1rem 1.25rem', gap: '0.625rem' }}
            >
              {/* Fila 1: fecha/info + acciones */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-base" style={{ color: 'var(--verde-oscuro)' }}>
                    {v.numId != null ? `#${v.numId} · ` : ''}{formatFecha(v.fecha)}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                    {v.animalesAtendidos.length} animal{v.animalesAtendidos.length !== 1 ? 'es' : ''}
                    {' · '}{v.veterinario}
                    {v.anotador ? ` · ${v.anotador}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {confirmando === v.id ? (
                    <>
                      <button
                        onClick={() => eliminarSesion(v.id)}
                        className="px-3 py-1.5 rounded-xl text-sm font-semibold"
                        style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => setConfirmando(null)}
                        className="px-3 py-1.5 rounded-xl text-sm font-semibold"
                        style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => descargarMetricas(v)}
                        className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors hover:bg-green-50"
                        style={{ border: '1.5px solid #E5E7EB', color: 'var(--verde-medio)' }}
                        title="Descargar reporte"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmando(v.id)}
                        className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors hover:bg-red-50"
                        style={{ border: '1.5px solid #E5E7EB', color: '#EF4444' }}
                        title="Eliminar sesión"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Fila 2: trabajos (ancho completo) */}
              <div className="flex flex-wrap gap-1.5">
                {v.trabajos.map(t => {
                  const col = TRABAJO_COLORES[t] || { bg: '#EBF7F1', text: '#1B4332' };
                  return (
                    <span
                      key={t}
                      className="rounded-lg text-xs font-semibold"
                      style={{ backgroundColor: col.bg, color: col.text, border: '1px solid #C8E6D8', padding: '0.2rem 0.625rem' }}
                    >
                      {t}
                    </span>
                  );
                })}
                {v.metricas?.outliers?.length > 0 && (
                  <span className="flex items-center gap-1 rounded-xl text-xs font-semibold"
                    style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.2rem 0.5rem' }}>
                    <AlertTriangle className="w-3 h-3" /> {v.metricas.outliers.length} fuera de norma
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
