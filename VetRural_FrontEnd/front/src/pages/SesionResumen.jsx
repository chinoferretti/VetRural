import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Scale, Hand, Syringe, Smile, Download, Share2, CheckCircle2, AlertTriangle, PawPrint } from 'lucide-react';
import { useEstablecimiento } from '../context/EstablecimientoContext';
import { useAuth } from '../context/AuthContext';
import { generarHTMLReporte, compartirPDF, descargarPDF, nombreArchivoPDF } from '../utils/reporteUtils';
import { calcularMetricasApi } from '../api/sesionesApi';
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
const DENTADURA_LABELS = { 'De_Leche': 'De leche', 'Mixta': 'Mixta', 'Permanente': 'Permanente' };
const DIENTES_LABELS = { Dos: '2 dientes', Cuatro: '4 dientes', Seis: '6 dientes', Ocho: '8 dientes' };
const DIENTES_EDAD  = { Dos: '1.5–2 a.', Cuatro: '2.5–3 a.', Seis: '3.5–4 a.', Ocho: '> 4.5 a.' };
const TIPOS_ORDEN = ['Ternera','Vaquillona','Vaca','Ternero','Novillito','Novillo','Torito','Toro','Sin categoría'];

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

// ── Component ─────────────────────────────────────────────────────────────────

export default function SesionResumen() {
  const navigate = useNavigate();
  const location = useLocation();
  const state    = location.state;
  const { seleccionado } = useEstablecimiento();
  const { usuario } = useAuth();
  const historialKey = `vetrural_historial_est_${seleccionado?.id || usuario?.id || 'anon'}`;
  const [metricas,      setMetricas]      = useState(null);
  const [filtroSexo,   setFiltroSexo]   = useState('Todos');
  const [descargando,  setDescargando]  = useState(false);

  const registros = state?.registros ?? [];
  const trabajos  = state?.trabajos  ?? [];

  const distribucionSesion = useMemo(() => {
    const regs = filtroSexo === 'Todos'
      ? registros
      : registros.filter(r => r.animal?.sexo === filtroSexo);
    const dist = {};
    regs.forEach(r => {
      const tipo = r.tipoAnimal || r.animal?.tipo || 'Sin categoría';
      dist[tipo] = (dist[tipo] || 0) + 1;
    });
    return dist;
  }, [registros, filtroSexo]);
  const sesionIdRef = useRef(Date.now().toString());

  useEffect(() => {
    if (!state?.registros) { navigate('/historial', { replace: true }); return; }
    window.history.pushState({ sesionResumen: true }, '');
    const onPop = () => navigate('/historial', { replace: true });
    window.addEventListener('popstate', onPop);
    calcularMetricasApi(registros, trabajos).then(m => {
      setMetricas(m);
      try {
        const previas = JSON.parse(localStorage.getItem(historialKey) || '[]');
        if (previas.find(s => s.id === sesionIdRef.current)) return;
        const numId = previas.length > 0
          ? Math.max(...previas.map(s => s.numId ?? 0)) + 1
          : 1;
        const sesion = {
          id:                   sesionIdRef.current,
          numId,
          fecha:                new Date().toISOString().slice(0, 10),
          veterinario:          state.veterinario ?? '',
          veterinarioMatricula: state.veterinarioMatricula ?? '',
          anotador:             state.anotador ?? '',
          establecimiento:      state.establecimiento ?? '',
          animalesAtendidos:    registros.map(r => r.animal.caravana),
          trabajos:             trabajos.map(t => TRABAJOS_CONFIG[t]?.label ?? t),
          metricas:             m,
        };
        localStorage.setItem(historialKey, JSON.stringify([sesion, ...previas]));
      } catch { /* sin espacio en disco */ }
    });
    return () => window.removeEventListener('popstate', onPop);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!state?.registros || !metricas) {
    return <LoadingSpinner texto="Calculando métricas..." />;
  }

  const { veterinario, veterinarioMatricula, anotador } = state;
  const est  = state.establecimiento || seleccionado?.nombre || '';
  const total = registros.length;
  const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  const fechaISO = new Date().toISOString().slice(0, 10);
  const nombreArchivo = nombreArchivoPDF(est, fechaISO);
  const titulo = `Sesión VetRural — ${fecha}`;
  const trabajosDisplay = trabajos.map(t => TRABAJOS_CONFIG[t]?.label || t);

  const m = metricas;
  const totalB = m.boqueo?.conteos ? Object.values(m.boqueo.conteos).reduce((a, b) => a + b, 0) : 0;

  const getHTML = () => generarHTMLReporte({
    fecha, establecimiento: est, veterinario, anotador,
    totalAnimales: total, trabajosDisplay, metricas: m,
  });

  const handleDescargarPDF = async () => {
    if (descargando) return;
    setDescargando(true);
    try { await descargarPDF(getHTML(), nombreArchivo); }
    finally { setDescargando(false); }
  };

  const handleCompartir = () => compartirPDF(getHTML(), nombreArchivo, titulo);

  return (
    <div className="flex flex-col flex-1" style={{ minHeight: 0, overflow: 'hidden' }}>

      {/* Header fijo */}
      <div style={{ flexShrink: 0, paddingBottom: '0.75rem' }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="font-bold" style={{ color: 'var(--verde-oscuro)', fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', marginLeft: '0.25rem' }}>
                Sesión finalizada
              </h1>
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--verde-medio)' }} />
            </div>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>
              {fecha}{est ? ` · ${est}` : ''}{veterinario ? ` · ${veterinario}` : ''}
              {anotador ? ` · ${anotador}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={handleDescargarPDF} disabled={descargando}
              className="flex items-center gap-1.5 rounded-xl font-semibold transition-colors hover:bg-gray-100"
              style={{ border: '2px solid var(--verde-medio)', padding: '0.45rem 0.75rem', fontSize: '0.8rem', color: '#374151', backgroundColor: 'white', whiteSpace: 'nowrap', opacity: descargando ? 0.6 : 1 }}
              title={descargando ? 'Generando PDF…' : 'Descargar reporte PDF'}>
              {descargando
                ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" /></svg>
                : <Download className="w-4 h-4" />}
              PDF
            </button>
            <button onClick={handleCompartir}
              className="flex items-center gap-1.5 rounded-xl font-semibold transition-colors hover:bg-green-50"
              style={{ border: '2px solid var(--verde-medio)', padding: '0.45rem 0.75rem', fontSize: '0.8rem', color: 'var(--verde-oscuro)', backgroundColor: 'white', whiteSpace: 'nowrap' }}
              title="Compartir">
              <Share2 className="w-4 h-4" />
              Compartir
            </button>
          </div>
        </div>
      </div>

      {/* Contenido scrolleable */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Total */}
        <div className="card text-center" style={{ padding: 'clamp(1.25rem, 4vw, 2rem)' }}>
          <p style={{ fontSize: 'clamp(3.5rem, 12vw, 5.5rem)', fontWeight: 900, color: 'var(--verde-oscuro)', lineHeight: 1 }}>
            {total}
          </p>
          <p className="font-semibold mt-2" style={{ color: '#6B7280', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}>
            {total === 1 ? 'Animal procesado' : 'Animales procesados'}
          </p>
        </div>

        {/* Equipo + Trabajos */}
        <div className="card" style={{ padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
          <div className="flex flex-col mb-3" style={{ gap: '0.4rem' }}>
            <RowMetrica label="Veterinario" value={veterinario} />
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
                ['No aplica',     m.tacto.noAplica],
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
                    data={Object.entries(m.boqueo.conteos).map(([name, v]) => ({ name: DENTADURA_LABELS[name] || name, v }))}
                    margin={{ top: 0, right: 10, bottom: 0, left: -20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="v" fill="var(--verde-medio)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                {/* Edad estimada — usa distribución precisa (dentadura+deterioro) si disponible, sino fallback por dientes */}
                {(() => {
                  const edadDist = m.boqueo.edadEstimadaDistribucion;
                  if (edadDist && Object.keys(edadDist).length > 0) {
                    const total = Object.values(edadDist).reduce((a, b) => a + b, 0);
                    return (
                      <div className="flex flex-col mt-3" style={{ gap: '0.4rem' }}>
                        <p className="text-xs font-semibold" style={{ color: '#6B7280' }}>Edad estimada (dentadura + deterioro)</p>
                        {Object.entries(edadDist).map(([label, v]) => (
                          <div key={label}>
                            <RowMetrica label={label} value={`${v} (${Math.round(v / total * 100)}%)`} />
                            <BarraProgreso pct={v / total * 100} />
                          </div>
                        ))}
                      </div>
                    );
                  }
                  // Fallback para sesiones antiguas sin edadEstimadaDistribucion
                  if (m.boqueo.distribucionDientes && Object.keys(m.boqueo.distribucionDientes).length > 0) {
                    const totalD = Object.values(m.boqueo.distribucionDientes).reduce((a, b) => a + b, 0);
                    return (
                      <div className="flex flex-col mt-3" style={{ gap: '0.4rem' }}>
                        <p className="text-xs font-semibold" style={{ color: '#6B7280' }}>Edad estimada por dientes</p>
                        {['Dos','Cuatro','Seis','Ocho'].filter(k => m.boqueo.distribucionDientes[k]).map(k => (
                          <div key={k}>
                            <RowMetrica
                              label={`${DIENTES_LABELS[k]} · ${DIENTES_EDAD[k]}`}
                              value={`${m.boqueo.distribucionDientes[k]} (${Math.round(m.boqueo.distribucionDientes[k] / totalD * 100)}%)`}
                            />
                            <BarraProgreso pct={m.boqueo.distribucionDientes[k] / totalD * 100} />
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()}

                {Object.values(m.boqueo.deterioro).some(v => v > 0) && (
                  <div className="flex flex-col mt-3" style={{ gap: '0.4rem' }}>
                    <p className="text-xs font-semibold" style={{ color: '#6B7280' }}>Deterioro dental</p>
                    {Object.entries(m.boqueo.deterioro).filter(([, v]) => v > 0).map(([k, v]) => (
                      <RowMetrica key={k} label={k} value={v} />
                    ))}
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

        {/* Composición de la sesión */}
        {registros.length > 0 && (() => {
          const totalSesion = Object.values(distribucionSesion).reduce((a, b) => a + b, 0);
          const entradas = TIPOS_ORDEN
            .filter(t => distribucionSesion[t])
            .map(t => [t, distribucionSesion[t]])
            .concat(Object.entries(distribucionSesion).filter(([t]) => !TIPOS_ORDEN.includes(t)));
          return (
            <SecMetrica titulo="Composición de la sesión" Icon={PawPrint}>
              {/* Filtro sexo */}
              <div className="col-span-full flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold flex-shrink-0" style={{ color: '#6B7280' }}>Sexo</span>
                <div className="flex rounded-xl overflow-hidden" style={{ border: '1.5px solid #E5E7EB' }}>
                  {['Todos', 'Hembra', 'Macho'].map(s => (
                    <button key={s} onClick={() => setFiltroSexo(s)}
                      className="font-semibold transition-colors"
                      style={{
                        padding: '0.3rem 0.75rem', fontSize: '0.8rem',
                        ...(filtroSexo === s
                          ? { backgroundColor: 'var(--verde-oscuro)', color: 'white' }
                          : { backgroundColor: 'white', color: '#6B7280' })
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
                {filtroSexo !== 'Todos' && (
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>
                    {totalSesion} de {registros.length} animales
                  </span>
                )}
              </div>
              {totalSesion === 0 ? (
                <p className="text-sm col-span-full" style={{ color: '#9CA3AF' }}>
                  Sin animales {filtroSexo === 'Hembra' ? 'hembras' : 'machos'} en esta sesión
                </p>
              ) : (
                entradas.map(([tipo, cnt]) => (
                  <div key={tipo} className="col-span-full">
                    <RowMetrica
                      label={tipo}
                      value={`${cnt} (${Math.round(cnt / totalSesion * 100)}%)`}
                    />
                    <BarraProgreso pct={cnt / totalSesion * 100} />
                  </div>
                ))
              )}
            </SecMetrica>
          );
        })()}

        {/* Outliers */}
        {m.outliers && m.outliers.length > 0 && (
          <div className="rounded-2xl" style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', backgroundColor: '#FEF2F2' }}>
            <p className="font-bold mb-3 text-sm" style={{ color: '#991B1B' }}>Animales fuera de norma</p>
            <div className="flex flex-col" style={{ gap: '0.35rem' }}>
              {m.outliers.map((o, i) => (
                <p key={i} className="text-sm" style={{ color: '#374151' }}>
                  <span className="font-semibold">N° {o.caravana}</span> — {o.motivo}
                </p>
              ))}
            </div>
          </div>
        )}

      </div>


    </div>
  );
}
