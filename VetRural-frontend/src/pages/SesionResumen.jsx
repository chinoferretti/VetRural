import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Scale, Hand, Syringe, Smile, Download, Share2, CheckCircle2, AlertTriangle } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { useEstablecimiento } from '../context/EstablecimientoContext';
import { generarHTMLReporte } from '../utils/reporteUtils';
import { calcularMetricasApi, guardarSesion, registrarEventosSesion } from '../api/sesionesApi';
import LoadingSpinner from '../components/LoadingSpinner';

const TRABAJOS_CONFIG = {
  boqueo:     { label: 'Boqueo' },
  pesaje:     { label: 'Pesaje' },
  tacto:      { label: 'Tacto' },
  vacunacion: { label: 'Vacunación' },
};

const VACUNAS_LABELS = {
  vac_aftosa: 'Aftosa', vac_brucelosis: 'Brucelosis', vac_carbunco: 'Carbunco',
  vac_clostridial: 'Clostridial', vac_ibr: 'IBR', vac_bvd: 'BVD',
};

const DIST_LABELS = { cabeza: '< 3 meses', cuerpo: '3–6 meses', cola: '> 6 meses' };

// ── Helpers de UI ─────────────────────────────────────────────────────────────

function BarraProgreso({ pct }) {
  return (
    <div style={{ background: '#E5E7EB', borderRadius: 6, height: 10, overflow: 'hidden', marginTop: 4 }}>
      <div style={{ background: 'var(--verde-medio)', height: '100%', width: `${Math.max(0, Math.min(100, pct))}%`, borderRadius: 6 }} />
    </div>
  );
}

function SecMetrica({ titulo, Icon, children }) {
  return (
    <div className="card" style={{ padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
      <h2 className="flex items-center gap-2 font-bold mb-3"
        style={{ color: 'var(--verde-oscuro)', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)' }}>
        {Icon && (
          <span className="flex items-center justify-center rounded-lg"
            style={{ backgroundColor: '#EBF7F1', border: '1.5px solid #C8E6D8', padding: '0.3rem', flexShrink: 0 }}>
            <Icon className="w-4 h-4" style={{ color: 'var(--verde-medio)' }} />
          </span>
        )}
        {titulo}
      </h2>
      {children}
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="text-center rounded-xl p-3" style={{ backgroundColor: '#F9FAFB', border: '1px solid #F3F4F6' }}>
      <p className="font-bold" style={{ color: 'var(--verde-oscuro)', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)' }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{label}</p>
    </div>
  );
}

function RowMetrica({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-center" style={{ padding: '4px 0', borderBottom: '1px solid #F3F4F6' }}>
      <span className="text-sm" style={{ color: '#6B7280' }}>{label}</span>
      <span className="text-sm font-semibold" style={{ color: highlight ? 'var(--verde-medio)' : '#111827' }}>{value}</span>
    </div>
  );
}

// ── PDF helpers ───────────────────────────────────────────────────────────────

const PDF_OPT = {
  margin:      [10, 10, 10, 10],
  html2canvas: { scale: 2, useCORS: true, logging: false },
  jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
};

function generarPDF(htmlContent, nombreArchivo) {
  return html2pdf()
    .set({ ...PDF_OPT, filename: nombreArchivo })
    .from(htmlContent);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SesionResumen() {
  const navigate = useNavigate();
  const location = useLocation();
  const state    = location.state;
  const { seleccionado } = useEstablecimiento();
  const [metricas, setMetricas] = useState(null);

  const registros = state?.registros ?? [];
  const trabajos  = state?.trabajos  ?? [];

  useEffect(() => {
    if (!state?.registros) { navigate('/historial', { replace: true }); return; }

    calcularMetricasApi(registros, trabajos).then(setMetricas);

    // Guardia anti-duplicado: StrictMode monta el componente dos veces en dev.
    // clientSessionId es único por sesión iniciada, así solo se guarda una vez.
    const saveKey = `sesion_guardada_${state.clientSessionId}`;
    if (!state.clientSessionId || sessionStorage.getItem(saveKey)) return;
    sessionStorage.setItem(saveKey, '1');

    if (state.veterinarioId && state.establecimientoId) {
      guardarSesion({
        veterinarioId: state.veterinarioId,
        anotador: state.anotador || null,
        establecimientoId: state.establecimientoId,
      })
        .then(res => registrarEventosSesion(res.data.id, registros))
        .catch(() => { });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!state?.registros || !metricas) {
    return <LoadingSpinner texto="Calculando métricas..." />;
  }

  const { veterinario, veterinarioMatricula, anotador } = state;
  const est  = state.establecimiento || seleccionado?.nombre || '';
  const total = registros.length;
  const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  const nombreArchivo = `sesion-vetrural-${new Date().toISOString().slice(0, 10)}.pdf`;
  const titulo = `Sesión VetRural — ${fecha}`;
  const trabajosDisplay = trabajos.map(t => TRABAJOS_CONFIG[t]?.label || t);

  const m = metricas;
  const totalB = m.boqueo?.conteos ? Object.values(m.boqueo.conteos).reduce((a, b) => a + b, 0) : 0;

  const getHTML = () => generarHTMLReporte({
    fecha, establecimiento: est, veterinario, anotador,
    totalAnimales: total, trabajosDisplay, metricas: m,
  });

  const handleDescargarPDF = () => {
    generarPDF(getHTML(), nombreArchivo).save();
  };

  const handleCompartir = async () => {
    const pdfBlob = await generarPDF(getHTML(), nombreArchivo).outputPdf('blob');
    const file    = new File([pdfBlob], nombreArchivo, { type: 'application/pdf' });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ title: titulo, files: [file] }); return; }
      catch (e) { if (e.name === 'AbortError') return; }
    }
    // Fallback: descarga directa
    const url = URL.createObjectURL(pdfBlob);
    const a   = document.createElement('a');
    a.href = url; a.download = nombreArchivo; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 15000);
  };

  return (
    <div className="flex flex-col flex-1" style={{ gap: '1rem' }}>

      {/* Header */}
      <div style={{ flexShrink: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 className="w-6 h-6" style={{ color: 'var(--verde-medio)' }} />
          <h1 className="font-bold" style={{ color: 'var(--verde-oscuro)', fontSize: 'clamp(1.2rem, 3vw, 1.75rem)' }}>
            Sesión finalizada
          </h1>
        </div>
        <p className="text-sm" style={{ color: '#9CA3AF' }}>
          {fecha}{est ? ` · ${est}` : ''} · {veterinario}
          {veterinarioMatricula ? ` (${veterinarioMatricula})` : ''}
          {anotador ? ` · ${anotador}` : ''}
        </p>
      </div>

      {/* Total */}
      <div className="card text-center" style={{ padding: 'clamp(1.25rem, 4vw, 2rem)' }}>
        <p style={{ fontSize: 'clamp(3.5rem, 12vw, 5.5rem)', fontWeight: 900, color: 'var(--verde-oscuro)', lineHeight: 1 }}>
          {total}
        </p>
        <p className="font-semibold mt-2" style={{ color: '#6B7280', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}>
          {total === 1 ? 'animal procesado' : 'animales procesados'}
        </p>
      </div>

      {/* Equipo + Trabajos */}
      <div className="card" style={{ padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
        <div className="flex flex-col mb-3" style={{ gap: '0.4rem' }}>
          <RowMetrica label="Veterinario" value={`${veterinario}${veterinarioMatricula ? ` — ${veterinarioMatricula}` : ''}`} />
          {anotador && <RowMetrica label="Anotador" value={anotador} />}
          {est && <RowMetrica label="Establecimiento" value={est} />}
        </div>
        <div className="flex flex-wrap gap-2">
          {trabajos.map(t => (
            <span key={t} className="rounded-lg text-sm font-semibold"
              style={{ backgroundColor: '#EBF7F1', color: 'var(--verde-oscuro)', border: '1px solid #C8E6D8', padding: '0.25rem 0.75rem' }}>
              {TRABAJOS_CONFIG[t]?.label}
            </span>
          ))}
        </div>
      </div>

      {/* Pesaje */}
      {m.pesaje && (
        <SecMetrica titulo="Pesaje" Icon={Scale}>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <StatBox label="Promedio"        value={`${m.pesaje.promedio} kg`} />
            <StatBox label="Mínimo"          value={`${m.pesaje.minimo} kg`} />
            <StatBox label="Máximo"          value={`${m.pesaje.maximo} kg`} />
            <StatBox label="Desvío estándar" value={`± ${m.pesaje.desviacionEstandar} kg`} />
          </div>
          <div className="flex flex-col" style={{ gap: '0.4rem' }}>
            {m.pesaje.adpvPromedio !== null && m.pesaje.adpvPromedio !== undefined && (
              <RowMetrica label="ADPV promedio" value={`${m.pesaje.adpvPromedio} kg/día`} highlight />
            )}
            {m.pesaje.proyeccionVenta && (
              <RowMetrica label="Proyección fecha de venta" value={m.pesaje.proyeccionVenta} />
            )}
          </div>
        </SecMetrica>
      )}

      {/* Tacto */}
      {m.tacto && m.tacto.totalTactadas > 0 && (
        <SecMetrica titulo="Tacto" Icon={Hand}>
          <div className="rounded-xl p-4 mb-3" style={{ backgroundColor: '#EBF7F1' }}>
            <div className="flex items-end gap-2 mb-1">
              <span style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', fontWeight: 900, color: 'var(--verde-oscuro)', lineHeight: 1 }}>
                {m.tacto.porcentajePreniez}%
              </span>
              <span className="text-sm pb-1" style={{ color: '#6B7280' }}>
                de preñez ({m.tacto.prenadas}/{m.tacto.totalTactadas})
              </span>
            </div>
            <BarraProgreso pct={m.tacto.porcentajePreniez} />
          </div>
          <div className="flex flex-col mb-3" style={{ gap: '0.4rem' }}>
            {[
              ['Preñadas',      m.tacto.prenadas],
              ['Perdonadas',    m.tacto.perdonadas],
              ['Frigorífico',   m.tacto.frigorifico],
              ['Apta servicio', m.tacto.aptaServicio],
            ].filter(([, v]) => v > 0).map(([s, v]) => (
              <RowMetrica key={s} label={s}
                value={`${v} (${m.tacto.totalTactadas > 0 ? Math.round(v / m.tacto.totalTactadas * 100) : 0}%)`} />
            ))}
          </div>
          {m.tacto.prenadas > 0 && m.tacto.distribucion && (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: '#6B7280' }}>Distribución por período</p>
              {Object.entries(DIST_LABELS).map(([k, label]) => (
                <div key={k} className="mb-2">
                  <div className="flex justify-between text-xs mb-0.5" style={{ color: '#374151' }}>
                    <span>{label}</span>
                    <span className="font-bold">
                      {m.tacto.distribucion[k]} ({m.tacto.prenadas > 0 ? Math.round(m.tacto.distribucion[k] / m.tacto.prenadas * 100) : 0}%)
                    </span>
                  </div>
                  <BarraProgreso pct={m.tacto.prenadas > 0 ? (m.tacto.distribucion[k] / m.tacto.prenadas) * 100 : 0} />
                </div>
              ))}
            </div>
          )}
        </SecMetrica>
      )}

      {/* Boqueo */}
      {m.boqueo && (
        <SecMetrica titulo="Boqueo" Icon={Smile}>
          {totalB > 0 ? (
            <>
              <p className="text-xs font-semibold mb-2" style={{ color: '#6B7280' }}>Distribución dentaria</p>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart
                  data={Object.entries(m.boqueo.conteos).map(([name, v]) => ({ name, v }))}
                  margin={{ top: 0, right: 10, bottom: 0, left: -20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="v" fill="var(--verde-medio)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              {Object.values(m.boqueo.deterioro).some(v => v > 0) && (
                <div className="flex flex-col mt-3" style={{ gap: '0.4rem' }}>
                  <p className="text-xs font-semibold" style={{ color: '#6B7280' }}>Deterioro dental</p>
                  {Object.entries(m.boqueo.deterioro).filter(([, v]) => v > 0).map(([k, v]) => (
                    <RowMetrica key={k} label={k} value={v} />
                  ))}
                </div>
              )}
              {m.boqueo.tasaReposicion > 0 && (
                <div className="rounded-xl p-3 mt-3" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}>
                  <p className="text-sm font-bold" style={{ color: '#854D0E' }}>
                    Tasa de reposición: {m.boqueo.tasaReposicion}% —{' '}
                    {m.boqueo.conteos['Permanente']} {m.boqueo.conteos['Permanente'] !== 1 ? 'animales' : 'animal'} con dentadura permanente
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm" style={{ color: '#9CA3AF' }}>Sin datos de dentadura registrados</p>
          )}
        </SecMetrica>
      )}

      {/* Vacunación */}
      {m.vacunacion && m.vacunacion.totalAnimales > 0 && (
        <SecMetrica titulo="Vacunación" Icon={Syringe}>
          <p className="text-xs font-semibold mb-2" style={{ color: '#6B7280' }}>Cobertura por vacuna</p>
          <ResponsiveContainer width="100%" height={Math.max(160, Object.keys(VACUNAS_LABELS).length * 34)}>
            <BarChart
              data={Object.entries(VACUNAS_LABELS).map(([c, name]) => ({ name, pct: m.vacunacion.cobertura[c] }))}
              layout="vertical"
              margin={{ left: 8, right: 40, top: 0, bottom: 0 }}
            >
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
              <Tooltip formatter={(v) => [`${v}%`, 'Cobertura']} />
              <Bar dataKey="pct" fill="var(--verde-medio)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SecMetrica>
      )}

      {/* Outliers */}
      {m.outliers && m.outliers.length > 0 && (
        <div className="card" style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', backgroundColor: '#FEF2F2', border: '1.5px solid #FECACA' }}>
          <h2 className="flex items-center gap-2 font-bold mb-3"
            style={{ color: '#991B1B', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)' }}>
            <AlertTriangle className="w-4 h-4" style={{ color: '#EF4444' }} />
            Animales fuera de norma
          </h2>
          <div className="flex flex-col" style={{ gap: '0.5rem' }}>
            {m.outliers.map((o, i) => (
              <div key={i} className="rounded-xl p-3" style={{ backgroundColor: 'white', border: '1px solid #FECACA' }}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-xs"
                    style={{ color: '#991B1B', background: '#FEE2E2', padding: '1px 6px', borderRadius: 4 }}>
                    {o.caravana}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: '#374151' }}>{o.nombre}</span>
                </div>
                <p className="text-xs" style={{ color: '#DC2626' }}>{o.motivo}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="flex flex-col gap-3 pb-4" style={{ flexShrink: 0 }}>
        <button onClick={handleDescargarPDF}
          className="btn-primary w-full flex items-center justify-center gap-2"
          style={{ padding: 'clamp(0.85rem, 2.5vw, 1.1rem)', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)' }}>
          <Download className="w-5 h-5" />
          Descargar reporte PDF
        </button>
        <button onClick={handleCompartir}
          className="w-full rounded-xl font-semibold flex items-center justify-center gap-2"
          style={{ backgroundColor: '#EBF7F1', color: 'var(--verde-oscuro)', border: '1.5px solid #C8E6D8',
            padding: 'clamp(0.85rem, 2.5vw, 1.1rem)', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)' }}>
          <Share2 className="w-5 h-5" />
          Compartir
        </button>
        <button onClick={() => navigate('/historial', { replace: true })}
          className="w-full rounded-xl font-semibold"
          style={{ backgroundColor: '#F3F4F6', color: '#374151',
            padding: 'clamp(0.75rem, 2vw, 1rem)', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
          ← Volver al historial
        </button>
      </div>

    </div>
  );
}
