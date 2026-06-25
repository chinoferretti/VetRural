import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList,
} from 'recharts';
import { useEstablecimiento } from '../context/EstablecimientoContext';
import { useAuth } from '../context/AuthContext';
import { getMetricasEstablecimiento } from '../api/establecimientosApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { PawPrint, Scale, Clock, Heart, CircleSlash, Users, Stethoscope, CalendarDays, Activity, AlertTriangle, Download, Share2, CheckCircle2 } from 'lucide-react';
import { generarHTMLMetricas, descargarPDF, compartirPDF, nombreArchivoPDF } from '../utils/reporteUtils';

const SEXOS = ['Todos', 'Hembra', 'Macho'];

const VACUNAS_LABELS = {
  Aftosa:      'Aftosa',
  Brucelosis:  'Brucelosis',
  Carbunco:    'Carbunco',
  Clostridial: 'Clostridial',
  IBR:         'IBR',
  BVD:         'BVD',
};

const DIENTES_EDAD_LABELS = {
  Dos:    '2 dientes · 1.5–2 a.',
  Cuatro: '4 dientes · 2.5–3 a.',
  Seis:   '6 dientes · 3.5–4 a.',
  Ocho:   '8 dientes · >4.5 a.',
};
const TACTO_LABELS = {
  Preñada:       'Preñada',
  Perdonada:     'Perdonada',
  'Frigorífico': 'Frigorífico',
  Apta_Servicio: 'Apta servicio',
  No_Aplica:     'No aplica',
};
const TIPOS_ORDEN = ['Ternera','Vaquillona','Vaca','Ternero','Novillito','Novillo','Torito','Toro'];

function formatEdad(meses) {
  if (meses === null || meses === undefined) return '—';
  const anios = Math.floor(meses / 12); const m = meses % 12;
  if (anios === 0) return `${m} mes${m !== 1 ? 'es' : ''}`;
  if (m === 0)     return `${anios} año${anios !== 1 ? 's' : ''}`;
  return `${anios} a. ${m} m.`;
}

// ── Componentes UI ─────────────────────────────────────────────────────────────

function StatCard({ titulo, valor, subtexto, Icon, colorIcon }) {
  return (
    <div className="card flex flex-col gap-3" style={{ padding: '1.5rem' }}>
      {Icon && (
        <div className="flex items-center justify-center w-10 h-10 rounded-xl"
          style={{ backgroundColor: colorIcon?.bg ?? '#EBF7F1', border: `1.5px solid ${colorIcon?.border ?? '#C8E6D8'}` }}>
          <Icon className="w-5 h-5" style={{ color: colorIcon?.icon ?? 'var(--verde-medio)' }} />
        </div>
      )}
      <div>
        <p className="text-sm font-medium" style={{ color: '#6B7280' }}>{titulo}</p>
        <p className="text-4xl font-bold mt-1" style={{ color: 'var(--verde-oscuro)' }}>{valor}</p>
        {subtexto && <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>{subtexto}</p>}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 className="font-bold text-lg" style={{ color: 'var(--verde-oscuro)' }}>{children}</h2>;
}

// ── Stats de sesiones desde localStorage ──────────────────────────────────────

function useSesionStats() {
  const { usuario } = useAuth();
  const historialKey = `vetrural_historial_${usuario?.id || 'anon'}`;
  return useMemo(() => {
    try {
      const sesiones = JSON.parse(localStorage.getItem(historialKey) || '[]');
      const totalSesiones     = sesiones.length;
      const totalAtendidos    = sesiones.reduce((s, v) => s + (v.animalesAtendidos?.length ?? 0), 0);
      const totalOutliers     = sesiones.reduce((s, v) => s + (v.metricas?.outliers?.length ?? 0), 0);

      const conPesaje = sesiones.filter(v => v.metricas?.pesaje?.adpvPromedio != null);
      const adpvPromedio = conPesaje.length > 0
        ? +(conPesaje.reduce((s, v) => s + v.metricas.pesaje.adpvPromedio, 0) / conPesaje.length).toFixed(2)
        : null;

      const trabajosCount = {};
      sesiones.forEach(v => (v.trabajos ?? []).forEach(t => { trabajosCount[t] = (trabajosCount[t] || 0) + 1; }));
      const trabajosChart = Object.entries(trabajosCount)
        .map(([trabajo, cantidad]) => ({ trabajo, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad);

      return { totalSesiones, totalAtendidos, totalOutliers, adpvPromedio, trabajosChart };
    } catch {
      return { totalSesiones: 0, totalAtendidos: 0, totalOutliers: 0, adpvPromedio: null, trabajosChart: [] };
    }
  }, [historialKey]);
}

// ── Alertas agrupadas por tipo ─────────────────────────────────────────────────

function AlertasAgrupadas({ alertas }) {
  const [expandido, setExpandido] = useState(null);

  const grupos = useMemo(() => {
    const map = {};
    alertas.forEach(a => {
      if (!map[a.motivo]) map[a.motivo] = [];
      map[a.motivo].push(a.caravana);
    });
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length);
  }, [alertas]);

  return (
    <div className="card" style={{ padding: '1.75rem' }}>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5" style={{ color: '#D97706' }} />
        <h3 className="font-bold text-lg" style={{ color: 'var(--verde-oscuro)' }}>Alertas del rodeo</h3>
      </div>
      {alertas.length === 0 ? (
        <div className="flex items-center gap-2 py-3 px-4 rounded-xl" style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC' }}>
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--verde-medio)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--verde-oscuro)' }}>Sin alertas activas para este filtro</p>
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: '0.4rem' }}>
          {grupos.map(([motivo, caravanas]) => {
            const abierto = expandido === motivo;
            const esSolo = caravanas.length === 1;
            return (
              <div key={motivo}>
                <button
                  onClick={() => !esSolo && setExpandido(abierto ? null : motivo)}
                  className="w-full flex items-center justify-between py-2 text-left"
                  style={{ cursor: esSolo ? 'default' : 'pointer' }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-semibold" style={{ color: '#374151' }}>
                      {esSolo
                        ? `N° ${caravanas[0]}: ${motivo}`
                        : `${caravanas.length} animales: ${motivo}`}
                    </span>
                  </div>
                  {!esSolo && (
                    <span className="text-xs font-bold flex-shrink-0 ml-2" style={{ color: '#9CA3AF' }}>
                      {abierto ? '▲' : '▼'}
                    </span>
                  )}
                </button>
                {abierto && !esSolo && (
                  <div className="flex flex-col gap-0.5 pl-6 mb-1">
                    {caravanas.map(car => (
                      <span key={car} className="text-xs font-semibold" style={{ color: '#6B7280' }}>
                        N° {car}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────

export default function Metricas() {
  const { seleccionado } = useEstablecimiento();
  const [sexo, setSexo]       = useState('Todos');
  const [lote, setLote]       = useState('Todos');
  const [metricas, setMetricas] = useState(null);
  const [cargando,     setCargando]     = useState(false);
  const [error,        setError]        = useState('');
  const [descargando,  setDescargando]  = useState(false);

  const sesion = useSesionStats();
  const fechaISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const handleDescargarPDF = useCallback(async () => {
    if (descargando) return;
    setDescargando(true);
    try {
      const nombre = nombreArchivoPDF(seleccionado?.nombre, fechaISO);
      await descargarPDF(generarHTMLMetricas({ seleccionado, metricas, sesion, sexo, lote }), nombre);
    } finally {
      setDescargando(false);
    }
  }, [seleccionado, metricas, sesion, sexo, lote, fechaISO, descargando]);

  const handleCompartir = useCallback(async () => {
    const html = generarHTMLMetricas({ seleccionado, metricas, sesion, sexo, lote });
    const nombre = nombreArchivoPDF(seleccionado?.nombre, fechaISO);
    await compartirPDF(html, nombre, `Métricas · ${seleccionado?.nombre ?? 'VetRural'}`);
  }, [seleccionado, metricas, sesion, sexo, lote, fechaISO]);

  useEffect(() => {
    if (!seleccionado) return;
    setCargando(true);
    setError('');
    getMetricasEstablecimiento(seleccionado.id, { sexo, lote })
      .then(data => { setMetricas(data); setCargando(false); })
      .catch((err) => { console.error('[Métricas] Error al cargar:', err?.response?.status, err?.response?.data ?? err?.message); setError('No se pudieron cargar las métricas del rodeo.'); setCargando(false); });
  }, [seleccionado?.id, sexo, lote]);

  // Lotes disponibles para el filtro (de la respuesta del backend)
  const lotesOpciones = ['Todos', ...(metricas?.lotes ?? [])];

  // Vacunación: vigente (dentro del intervalo) + vencida (registrada pero fuera de plazo)
  const vacunacionChart = metricas
    ? Object.entries(VACUNAS_LABELS).map(([key, label]) => {
        const vigente = metricas.vacunadosVigentes?.[key] ?? 0;
        const alguna  = metricas.vacunados?.[key] ?? 0;
        const vencida = Math.max(0, alguna - vigente);
        const pctVigente = metricas.totalBovinos > 0 ? Math.round(vigente / metricas.totalBovinos * 100) : 0;
        return { vacuna: label, vigente, vencida, pctVigente };
      })
    : [];

  return (
    <div className="flex flex-col flex-1" style={{ minHeight: 0, overflow: 'hidden' }}>

      {/* Header fijo */}
      <div style={{ flexShrink: 0, paddingBottom: '0.75rem' }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Métricas</h1>
          </div>
          <div className="flex gap-2 mt-1">
            <button
              onClick={handleDescargarPDF}
              disabled={descargando}
              className="flex items-center gap-1.5 rounded-xl font-semibold transition-colors hover:bg-gray-100"
              style={{ border: '2px solid var(--verde-medio)', padding: '0.45rem 0.75rem', fontSize: '0.8rem', color: '#374151', backgroundColor: 'white', whiteSpace: 'nowrap', opacity: descargando ? 0.6 : 1 }}
              title={descargando ? 'Generando PDF…' : 'Descargar como PDF'}
            >
              {descargando
                ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" /></svg>
                : <Download className="w-4 h-4" />}
              PDF
            </button>
            <button
              onClick={handleCompartir}
              className="flex items-center gap-1.5 rounded-xl font-semibold transition-colors hover:bg-green-50"
              style={{ border: '2px solid var(--verde-medio)', padding: '0.45rem 0.75rem', fontSize: '0.8rem', color: 'var(--verde-oscuro)', backgroundColor: 'white', whiteSpace: 'nowrap' }}
              title="Compartir métricas"
            >
              <Share2 className="w-4 h-4" />
              Compartir
            </button>
          </div>
        </div>
      </div>

      {/* Contenido scrolleable */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '1rem' }}>
      <div className="flex flex-col" style={{ gap: '2.5rem' }}>

      {/* ── Sección 1: Actividad de sesiones (desde localStorage) ── */}
      <section className="flex flex-col" style={{ gap: '1rem' }}>
        <SectionTitle>Actividad de sesiones</SectionTitle>

        {sesion.totalSesiones === 0 ? (
          <div className="card text-center" style={{ padding: '2rem' }}>
            <p className="font-semibold" style={{ color: '#374151' }}>Sin sesiones registradas aún</p>
            <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>Completá una sesión de manga para ver estadísticas</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                titulo="Sesiones realizadas"
                valor={sesion.totalSesiones}
                Icon={CalendarDays}
                colorIcon={{ bg: '#EBF7F1', border: '#C8E6D8', icon: 'var(--verde-medio)' }}
              />
              <StatCard
                titulo="Animales atendidos"
                valor={sesion.totalAtendidos}
                subtexto="total acumulado"
                Icon={PawPrint}
                colorIcon={{ bg: '#EBF7F1', border: '#C8E6D8', icon: 'var(--verde-medio)' }}
              />
              {sesion.adpvPromedio !== null && (
                <StatCard
                  titulo="ADPV promedio"
                  valor={`${sesion.adpvPromedio} kg/d`}
                  subtexto="entre sesiones con pesaje"
                  Icon={Activity}
                  colorIcon={{ bg: '#EBF7F1', border: '#C8E6D8', icon: 'var(--verde-medio)' }}
                />
              )}
              <StatCard
                titulo="Alertas del rodeo"
                valor={metricas?.alertas?.length ?? sesion.totalOutliers}
                subtexto={metricas?.alertas ? `${metricas.alertas.length} problema${metricas.alertas.length !== 1 ? 's' : ''} detectado${metricas.alertas.length !== 1 ? 's' : ''}` : 'en sesiones registradas'}
                Icon={AlertTriangle}
                colorIcon={{ bg: '#FEF3C7', border: '#FDE68A', icon: '#D97706' }}
              />
            </div>

            {sesion.trabajosChart.length > 0 && (
              <div className="card" style={{ padding: '1.75rem' }}>
                <h3 className="font-bold mb-5" style={{ color: 'var(--verde-oscuro)' }}>Trabajos más realizados</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={sesion.trabajosChart} margin={{ top: 24, right: 8, bottom: 4, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis dataKey="trabajo" tick={{ fontSize: 13 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => [`${v}`, 'Sesiones']}
                      contentStyle={{ borderRadius: '0.75rem', border: '1px solid #E5E7EB' }} />
                    <Bar dataKey="cantidad" fill="var(--verde-oscuro)" radius={[8, 8, 0, 0]}>
                      <LabelList dataKey="cantidad" position="top" style={{ fontSize: 12, fontWeight: 700, fill: 'var(--verde-oscuro)' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── Sección 2: Estado del rodeo (desde backend) ── */}
      <section className="flex flex-col" style={{ gap: '1rem' }}>
        <SectionTitle>Estado del rodeo</SectionTitle>

        {!seleccionado ? (
          <div className="card text-center" style={{ padding: '2rem' }}>
            <p className="font-semibold" style={{ color: '#374151' }}>Seleccioná un establecimiento</p>
          </div>
        ) : (
          <>
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-semibold" style={{ color: '#374151' }}>Sexo</label>
                <div className="flex rounded-2xl overflow-hidden" style={{ border: '2px solid #E5E7EB' }}>
                  {SEXOS.map(s => (
                    <button key={s} onClick={() => setSexo(s)}
                      className="flex-1 font-semibold transition-colors"
                      style={{
                        padding: '0.85rem 1rem', fontSize: '0.95rem',
                        ...(sexo === s
                          ? { backgroundColor: 'var(--verde-oscuro)', color: 'white' }
                          : { backgroundColor: 'white', color: '#6B7280' })
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-semibold" style={{ color: '#374151' }}>Lote</label>
                <select value={lote} onChange={e => setLote(e.target.value)}
                  className="w-full rounded-2xl border bg-white font-semibold"
                  style={{ borderColor: '#E5E7EB', padding: '0.85rem 1rem', fontSize: '0.95rem', color: '#374151', borderWidth: '2px' }}>
                  {lotesOpciones.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {cargando ? (
              <LoadingSpinner texto="Calculando métricas..." />
            ) : error ? (
              <div className="rounded-2xl px-4 py-3 text-sm font-semibold" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                {error}
              </div>
            ) : metricas && metricas.totalBovinos === 0 ? (
              <div className="card text-center" style={{ padding: '2rem' }}>
                <p className="font-semibold" style={{ color: '#374151' }}>Sin animales para este filtro</p>
              </div>
            ) : metricas && (
              <>
                {/* KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard titulo="Total animales"
                    valor={metricas.totalBovinos}
                    subtexto={`${metricas.hembras} hembras · ${metricas.machos} machos`}
                    Icon={PawPrint} />
                  <StatCard titulo="Peso promedio"
                    valor={metricas.pesoPromedio ? `${metricas.pesoPromedio} kg` : '—'}
                    subtexto={metricas.conPeso > 0 ? `${metricas.conPeso} pesados` : 'Sin pesajes'}
                    Icon={Scale} />
                  <StatCard titulo="Edad promedio"
                    valor={formatEdad(metricas.edadPromedioMeses)}
                    subtexto={
                      metricas.bovinosConEdadEstimada > 0
                        ? `${metricas.bovinosConEdadEstimada} estimados por boqueo`
                        : undefined
                    }
                    Icon={Clock} />
                  <StatCard titulo="Hembras tactadas"
                    valor={metricas.totalTactadas > 0 ? `${metricas.totalTactadas}` : '—'}
                    subtexto={metricas.totalTactadas > 0 ? `de ${metricas.hembras} hembras` : 'Sin tactos'}
                    Icon={Stethoscope} />
                </div>

                {/* Preñez */}
                {metricas.hembras > 0 && metricas.totalTactadas > 0 && (
                  <div className="card" style={{ padding: '1.75rem' }}>
                    <h3 className="font-bold text-lg mb-5" style={{ color: 'var(--verde-oscuro)' }}>Preñez</h3>
                    <div className="flex justify-between text-sm mb-2">
                      <span style={{ color: 'var(--verde-medio)', fontWeight: 600 }}>Preñadas: {metricas.prenadas}</span>
                      <span style={{ color: '#6B7280' }}>Vacías / sin tacto: {metricas.hembras - metricas.prenadas}</span>
                    </div>
                    <div className="w-full rounded-full h-5" style={{ backgroundColor: '#F3F4F6' }}>
                      <div className="h-5 rounded-full transition-all"
                        style={{ width: `${metricas.porcentajePrenez}%`, backgroundColor: 'var(--verde-medio)' }} />
                    </div>
                    <div className="flex justify-between text-xs mt-1.5">
                      <span style={{ color: 'var(--verde-medio)' }}>{metricas.porcentajePrenez}% preñadas (sobre tactadas)</span>
                      <span style={{ color: '#9CA3AF' }}>{metricas.totalTactadas} hembras tactadas</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-5">
                      {[
                        { label: 'Preñadas', valor: metricas.prenadas,      Icon: Heart,       bg: '#EBF7F1', border: '#C8E6D8', color: 'var(--verde-oscuro)', iconColor: 'var(--verde-medio)' },
                        { label: 'No preñadas', valor: metricas.totalTactadas - metricas.prenadas, Icon: CircleSlash, bg: '#F9FAFB', border: '#E5E7EB', color: '#374151', iconColor: '#6B7280' },
                        { label: 'Total hembras', valor: metricas.hembras,  Icon: Users,       bg: '#EBF7F1', border: '#C8E6D8', color: 'var(--verde-oscuro)', iconColor: 'var(--verde-medio)' },
                      ].map(({ label, valor, Icon: Ic, bg, border, color, iconColor }) => (
                        <div key={label} className="flex items-center gap-3 p-4 rounded-2xl" style={{ backgroundColor: bg }}>
                          <div className="flex items-center justify-center rounded-xl p-2 flex-shrink-0"
                            style={{ backgroundColor: bg, border: `1.5px solid ${border}` }}>
                            <Ic className="w-6 h-6" style={{ color: iconColor }} />
                          </div>
                          <div>
                            <p className="text-3xl font-bold" style={{ color }}>{valor}</p>
                            <p className="text-sm" style={{ color: '#6B7280' }}>{label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Distribución por categoría */}
                {metricas.distribucionTipo && Object.keys(metricas.distribucionTipo).length > 0 && (() => {
                  const total = Object.values(metricas.distribucionTipo).reduce((a, b) => a + b, 0);
                  const entradas = TIPOS_ORDEN
                    .filter(t => metricas.distribucionTipo[t])
                    .map(t => ({ tipo: t, cantidad: metricas.distribucionTipo[t] }))
                    .concat(Object.entries(metricas.distribucionTipo)
                      .filter(([t]) => !TIPOS_ORDEN.includes(t))
                      .map(([t, c]) => ({ tipo: (!t || t.includes('_')) ? 'No especificado' : t, cantidad: c })));
                  return (
                    <div className="card" style={{ padding: '1.75rem' }}>
                      <h3 className="font-bold text-lg mb-5" style={{ color: 'var(--verde-oscuro)' }}>Composición del rodeo</h3>
                      <ResponsiveContainer width="100%" height={Math.max(160, entradas.length * 44)}>
                        <BarChart data={entradas} layout="vertical" margin={{ left: 8, right: 70, top: 4, bottom: 4 }}>
                          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="tipo" tick={{ fontSize: 12 }} width={78} axisLine={false} tickLine={false} />
                          <Tooltip
                            formatter={(v) => [`${v} (${total > 0 ? Math.round(v / total * 100) : 0}%)`, 'Animales']}
                            contentStyle={{ borderRadius: '0.75rem', border: '1px solid #E5E7EB' }} />
                          <Bar dataKey="cantidad" fill="var(--verde-medio)" radius={[0, 6, 6, 0]}>
                            <LabelList dataKey="cantidad" position="right"
                              formatter={(v) => `${v} (${total > 0 ? Math.round(v / total * 100) : 0}%)`}
                              style={{ fontSize: 11, fill: '#374151' }} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })()}

                {/* Distribución etaria por boqueo */}
                {metricas.distribucionDientes && Object.keys(metricas.distribucionDientes).length > 0 && (() => {
                  const total = Object.values(metricas.distribucionDientes).reduce((a, b) => a + b, 0);
                  const data = ['Dos','Cuatro','Seis','Ocho']
                    .filter(k => metricas.distribucionDientes[k])
                    .map(k => ({ nombre: DIENTES_EDAD_LABELS[k] || k, cantidad: metricas.distribucionDientes[k] }));
                  return (
                    <div className="card" style={{ padding: '1.75rem' }}>
                      <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--verde-oscuro)' }}>Distribución etaria por boqueo</h3>
                      <p className="text-sm mb-5" style={{ color: '#9CA3AF' }}>
                        Animales con boqueo registrado · total: {total}
                      </p>
                      <ResponsiveContainer width="100%" height={Math.max(160, data.length * 48)}>
                        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 70, top: 4, bottom: 4 }}>
                          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="nombre" tick={{ fontSize: 11 }} width={100} axisLine={false} tickLine={false} />
                          <Tooltip
                            formatter={(v) => [`${v} (${total > 0 ? Math.round(v / total * 100) : 0}%)`, 'Animales']}
                            contentStyle={{ borderRadius: '0.75rem', border: '1px solid #E5E7EB' }} />
                          <Bar dataKey="cantidad" fill="var(--verde-medio)" radius={[0, 6, 6, 0]}>
                            <LabelList dataKey="cantidad" position="right"
                              formatter={(v) => `${v} (${total > 0 ? Math.round(v / total * 100) : 0}%)`}
                              style={{ fontSize: 11, fill: '#374151' }} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })()}

                {/* Situación reproductiva (distribución completa de tacto) */}
                {metricas.distribucionTacto && Object.keys(metricas.distribucionTacto).length > 0 && (() => {
                  const total = Object.values(metricas.distribucionTacto).reduce((a, b) => a + b, 0);
                  const data = Object.entries(metricas.distribucionTacto).map(([k, v]) => ({
                    nombre: TACTO_LABELS[k] || k.replace(/_/g, ' '),
                    cantidad: v,
                  }));
                  return (
                    <div className="card" style={{ padding: '1.75rem' }}>
                      <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--verde-oscuro)' }}>Situación reproductiva</h3>
                      <p className="text-sm mb-5" style={{ color: '#9CA3AF' }}>
                        Hembras con tacto registrado · total: {total}
                      </p>
                      <ResponsiveContainer width="100%" height={Math.max(160, data.length * 44)}>
                        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 70, top: 4, bottom: 4 }}>
                          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="nombre" tick={{ fontSize: 12 }} width={80} axisLine={false} tickLine={false} />
                          <Tooltip
                            formatter={(v) => [`${v} (${total > 0 ? Math.round(v / total * 100) : 0}%)`, 'Hembras']}
                            contentStyle={{ borderRadius: '0.75rem', border: '1px solid #E5E7EB' }} />
                          <Bar dataKey="cantidad" fill="var(--verde-medio)" radius={[0, 6, 6, 0]}>
                            <LabelList dataKey="cantidad" position="right"
                              formatter={(v) => `${v} (${total > 0 ? Math.round(v / total * 100) : 0}%)`}
                              style={{ fontSize: 11, fill: '#374151' }} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })()}

                {/* Vacunación */}
                {vacunacionChart.length > 0 && (
                  <div className="card" style={{ padding: '1.75rem' }}>
                    <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--verde-oscuro)' }}>Cobertura de vacunación vigente</h3>
                    <p className="text-sm mb-5" style={{ color: '#9CA3AF' }}>
                      Vacunados dentro del intervalo recomendado · Aftosa: 6 meses · Resto: 12 meses
                    </p>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={vacunacionChart} margin={{ top: 24, right: 8, bottom: 4, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                        <XAxis dataKey="vacuna" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} domain={[0, metricas.totalBovinos]} axisLine={false} tickLine={false} />
                        <Tooltip
                          formatter={(v, name) => [
                            `${v} (${metricas.totalBovinos > 0 ? Math.round(v / metricas.totalBovinos * 100) : 0}%)`,
                            name === 'vigente' ? 'Vigente' : 'Vencida'
                          ]}
                          contentStyle={{ borderRadius: '0.75rem', border: '1px solid #E5E7EB' }} />
                        <Bar dataKey="vigente" stackId="a" fill="var(--verde-medio)" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="vencida" stackId="a" fill="#FCA5A5" radius={[8, 8, 0, 0]}>
                          <LabelList dataKey="pctVigente" position="top"
                            formatter={(v) => `${v}%`}
                            style={{ fontSize: 11, fontWeight: 700, fill: 'var(--verde-oscuro)' }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: '#6B7280' }}>
                      <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--verde-medio)' }} />Vigente</span>
                      <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#FCA5A5' }} />Vencida (registrada)</span>
                    </div>
                  </div>
                )}

                {/* Alertas agrupadas */}
                {metricas.alertas && <AlertasAgrupadas alertas={metricas.alertas} />}
              </>
            )}
          </>
        )}
      </section>

      </div>
      </div>
    </div>
  );
}
