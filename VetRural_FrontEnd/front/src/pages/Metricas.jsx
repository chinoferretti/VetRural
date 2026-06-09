import { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';
import { useEstablecimiento } from '../context/EstablecimientoContext';
import { useAuth } from '../context/AuthContext';
import { getMetricasEstablecimiento } from '../api/establecimientosApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { PawPrint, Scale, Clock, Heart, CircleSlash, Users, Stethoscope } from 'lucide-react';

const SEXOS = ['Todos', 'Hembra', 'Macho'];

const VACUNAS_LABELS = {
  Aftosa:      'Aftosa',
  Brucelosis:  'Brucelosis',
  Carbunco:    'Carbunco',
  Clostridial: 'Clostridial',
  IBR:         'IBR',
  BVD:         'BVD',
};

const MESES_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function formatEdad(meses) {
  if (meses === null || meses === undefined) return '—';
  const anios = Math.floor(meses / 12); const m = meses % 12;
  if (anios === 0) return `${m} mes${m !== 1 ? 'es' : ''}`;
  if (m === 0)     return `${anios} año${anios !== 1 ? 's' : ''}`;
  return `${anios} a. ${m} m.`;
}

function formatFecha(iso) {
  const d = new Date(iso);
  return `${MESES_ES[d.getMonth()]} ${d.getFullYear()}`;
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
      const totalTratamientos = sesiones.reduce((s, v) => s + (v.tratamientos?.length ?? 0), 0);
      const totalOutliers     = sesiones.reduce((s, v) => s + (v.metricas?.outliers?.length ?? 0), 0);

      const conPesaje = sesiones.filter(v => v.metricas?.pesaje?.adpvPromedio != null);
      const adpvPromedio = conPesaje.length > 0
        ? +(conPesaje.reduce((s, v) => s + v.metricas.pesaje.adpvPromedio, 0) / conPesaje.length).toFixed(2)
        : null;

      const evolucionPeso = sesiones
        .filter(v => v.metricas?.pesaje?.promedio)
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        .map(v => ({ fecha: formatFecha(v.fecha), promedio: v.metricas.pesaje.promedio, adpv: v.metricas.pesaje.adpvPromedio }));

      const trabajosCount = {};
      sesiones.forEach(v => (v.trabajos ?? []).forEach(t => { trabajosCount[t] = (trabajosCount[t] || 0) + 1; }));
      const trabajosChart = Object.entries(trabajosCount)
        .map(([trabajo, cantidad]) => ({ trabajo, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad);

      return { totalSesiones, totalAtendidos, totalTratamientos, totalOutliers, adpvPromedio, evolucionPeso, trabajosChart };
    } catch {
      return { totalSesiones: 0, totalAtendidos: 0, totalTratamientos: 0, totalOutliers: 0, adpvPromedio: null, evolucionPeso: [], trabajosChart: [] };
    }
  }, [historialKey]);
}

// ── Componente principal ───────────────────────────────────────────────────────

export default function Metricas() {
  const { seleccionado } = useEstablecimiento();
  const [sexo, setSexo]       = useState('Todos');
  const [lote, setLote]       = useState('Todos');
  const [metricas, setMetricas] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState('');

  const sesion = useSesionStats();

  useEffect(() => {
    if (!seleccionado) return;
    setCargando(true);
    setError('');
    getMetricasEstablecimiento(seleccionado.id, { sexo, lote })
      .then(data => { setMetricas(data); setCargando(false); })
      .catch(() => { setError('No se pudieron cargar las métricas del rodeo.'); setCargando(false); });
  }, [seleccionado?.id, sexo, lote]);

  // Lotes disponibles para el filtro (de la respuesta del backend)
  const lotesOpciones = ['Todos', ...(metricas?.lotes ?? [])];

  // Datos de vacunación para el gráfico
  const vacunacionChart = metricas
    ? Object.entries(VACUNAS_LABELS).map(([key, label]) => ({
        vacuna: label,
        vacunados: metricas.vacunados?.[key] ?? 0,
        total: metricas.totalBovinos,
      }))
    : [];

  return (
    <div className="flex flex-col w-full" style={{ gap: '2.5rem' }}>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Métricas</h1>
        <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>
          {seleccionado ? seleccionado.nombre : 'Seleccioná un establecimiento'}
        </p>
      </div>

      {/* ── Sección 1: Actividad de sesiones (desde localStorage) ── */}
      <section className="flex flex-col" style={{ gap: '1rem' }}>
        <SectionTitle>Actividad de sesiones</SectionTitle>

        {sesion.evolucionPeso.length > 0 && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
              <div>
                <h3 className="font-bold" style={{ color: 'var(--verde-oscuro)' }}>Evolución del peso promedio por sesión</h3>
                <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>Sesiones con pesaje registrado</p>
              </div>
              {sesion.adpvPromedio !== null && (
                <div className="rounded-xl px-4 py-2 text-center"
                  style={{ backgroundColor: '#EBF7F1', border: '1.5px solid #C8E6D8' }}>
                  <p className="text-xs font-medium" style={{ color: '#6B7280' }}>ADPV promedio</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>{sesion.adpvPromedio}</p>
                  <p className="text-xs" style={{ color: 'var(--verde-medio)' }}>kg / día</p>
                </div>
              )}
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={sesion.evolucionPeso} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit=" kg" width={60} />
                <Tooltip formatter={(v) => [`${v} kg`, 'Peso promedio']}
                  contentStyle={{ borderRadius: '0.75rem', border: '1px solid #E5E7EB' }} />
                <Line type="monotone" dataKey="promedio" stroke="var(--verde-medio)" strokeWidth={2.5}
                  dot={{ fill: 'var(--verde-medio)', r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {sesion.trabajosChart.length > 0 && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 className="font-bold mb-5" style={{ color: 'var(--verde-oscuro)' }}>Trabajos más realizados</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={sesion.trabajosChart} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="trabajo" tick={{ fontSize: 13 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
                <Tooltip formatter={(v) => [`${v}`, 'Sesiones']}
                  contentStyle={{ borderRadius: '0.75rem', border: '1px solid #E5E7EB' }} />
                <Bar dataKey="cantidad" fill="var(--verde-oscuro)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {sesion.totalSesiones === 0 && (
          <div className="card text-center" style={{ padding: '2rem' }}>
            <p className="text-4xl mb-2">📋</p>
            <p className="font-semibold" style={{ color: '#374151' }}>Sin sesiones registradas aún</p>
            <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>Completá una sesión de manga para ver estadísticas</p>
          </div>
        )}
      </section>

      {/* ── Sección 2: Estado del rodeo (desde backend) ── */}
      <section className="flex flex-col" style={{ gap: '1rem' }}>
        <SectionTitle>Estado del rodeo</SectionTitle>

        {!seleccionado ? (
          <div className="card text-center" style={{ padding: '2rem' }}>
            <p className="text-4xl mb-2">🏡</p>
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
                <p className="text-4xl mb-2">🐄</p>
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

                {/* Vacunación */}
                {vacunacionChart.length > 0 && (
                  <div className="card" style={{ padding: '1.75rem' }}>
                    <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--verde-oscuro)' }}>Cobertura de vacunación</h3>
                    <p className="text-sm mb-5" style={{ color: '#9CA3AF' }}>
                      Animales con al menos una dosis registrada · total: {metricas.totalBovinos}
                    </p>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={vacunacionChart} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                        <XAxis dataKey="vacuna" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} domain={[0, metricas.totalBovinos]} />
                        <Tooltip
                          formatter={(v, _, { payload }) => [
                            `${v} (${metricas.totalBovinos > 0 ? Math.round(v / metricas.totalBovinos * 100) : 0}%)`,
                            'Vacunados'
                          ]}
                          contentStyle={{ borderRadius: '0.75rem', border: '1px solid #E5E7EB' }} />
                        <Bar dataKey="vacunados" fill="var(--verde-medio)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>

    </div>
  );
}
