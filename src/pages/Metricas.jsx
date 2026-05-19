import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';
import animalesData  from '../data/animales.json';
import historialData from '../data/historial.json';
import { PawPrint, Scale, Clock, Heart, CircleSlash, Users, Stethoscope, Syringe, AlertTriangle, TrendingUp } from 'lucide-react';

// ── Constantes ────────────────────────────────────────────────────────────────

const VACUNAS_LISTA = ['Aftosa', 'Brucelosis', 'Clostridium', 'IBR', 'Carbunco', 'BVD'];
const LOTES_TODOS   = ['Todos', ...new Set(animalesData.map(a => a.lote))];
const SEXOS         = ['Todos', 'Hembra', 'Macho'];

const MESES_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcularEdadMeses(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  const hoy = new Date(); const nac = new Date(fechaNacimiento);
  return (hoy.getFullYear() - nac.getFullYear()) * 12 + (hoy.getMonth() - nac.getMonth());
}

function formatEdad(meses) {
  if (meses === null || isNaN(meses)) return '—';
  const anios = Math.floor(meses / 12); const m = meses % 12;
  if (anios === 0) return `${m} mes${m !== 1 ? 'es' : ''}`;
  if (m === 0)     return `${anios} año${anios !== 1 ? 's' : ''}`;
  return `${anios} año${anios !== 1 ? 's' : ''} ${m} mes${m !== 1 ? 'es' : ''}`;
}

function formatFecha(iso) {
  const d = new Date(iso);
  return `${MESES_ES[d.getMonth()]} ${d.getFullYear()}`;
}

// ── Componentes UI ────────────────────────────────────────────────────────────

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
  return (
    <h2 className="font-bold text-lg" style={{ color: 'var(--verde-oscuro)' }}>{children}</h2>
  );
}

// ── Métricas de sesiones (historial) ─────────────────────────────────────────

function useSesionStats() {
  return useMemo(() => {
    const sesiones = historialData;
    const totalSesiones     = sesiones.length;
    const totalAtendidos    = sesiones.reduce((s, v) => s + v.animalesAtendidos.length, 0);
    const totalTratamientos = sesiones.reduce((s, v) => s + v.tratamientos.length, 0);

    const totalOutliers = sesiones.reduce((s, v) => s + (v.metricas?.outliers?.length ?? 0), 0);

    const conPesaje = sesiones.filter(v => v.metricas?.pesaje);
    const adpvPromedio = conPesaje.length > 0
      ? +(conPesaje.reduce((s, v) => s + v.metricas.pesaje.adpvPromedio, 0) / conPesaje.length).toFixed(2)
      : null;

    const evolucionPeso = sesiones
      .filter(v => v.metricas?.pesaje)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .map(v => ({
        fecha:    formatFecha(v.fecha),
        promedio: v.metricas.pesaje.promedio,
        adpv:     v.metricas.pesaje.adpvPromedio,
      }));

    const trabajosCount = {};
    sesiones.forEach(v => v.trabajos.forEach(t => { trabajosCount[t] = (trabajosCount[t] || 0) + 1; }));
    const trabajosChart = Object.entries(trabajosCount)
      .map(([trabajo, cantidad]) => ({ trabajo, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);

    return { totalSesiones, totalAtendidos, totalTratamientos, totalOutliers, adpvPromedio, evolucionPeso, trabajosChart };
  }, []);
}

// ── Métricas del rodeo (animales) ────────────────────────────────────────────

function useRodeoStats(filtrados) {
  return useMemo(() => {
    if (filtrados.length === 0) return null;

    const hembras   = filtrados.filter(a => a.sexo === 'Hembra');
    const prenadas  = hembras.filter(a => a.prenada);
    const vacias    = hembras.length - prenadas.length;
    const pctPrenez = hembras.length > 0 ? Math.round((prenadas.length / hembras.length) * 100) : null;

    const conPeso   = filtrados.filter(a => a.peso > 0);
    const pesoPromedio = conPeso.length > 0
      ? Math.round(conPeso.reduce((s, a) => s + a.peso, 0) / conPeso.length) : null;

    const conEdad = filtrados.filter(a => a.fechaNacimiento);
    const edadPromMeses = conEdad.length > 0
      ? Math.round(conEdad.reduce((s, a) => s + calcularEdadMeses(a.fechaNacimiento), 0) / conEdad.length) : null;

    const vacunacion = VACUNAS_LISTA.map(v => ({
      vacuna: v,
      cantidad: filtrados.filter(a => a.vacunas?.includes(v)).length,
      total: filtrados.length,
    }));

    const alertas = filtrados.filter(a => a.estadoSanitario === 'alerta').length;

    return { hembras: hembras.length, prenadas: prenadas.length, vacias, pctPrenez, pesoPromedio, edadPromMeses, vacunacion, alertas };
  }, [filtrados]);
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function Metricas() {
  const [sexo, setSexo] = useState('Todos');
  const [lote, setLote] = useState('Todos');

  const filtrados = useMemo(() =>
    animalesData.filter(a =>
      (sexo === 'Todos' || a.sexo === sexo) &&
      (lote === 'Todos' || a.lote === lote)
    ), [sexo, lote]);

  const sesion = useSesionStats();
  const rodeo  = useRodeoStats(filtrados);

  return (
    <div className="flex flex-col w-full" style={{ gap: '2.5rem' }}>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Métricas</h1>
        <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>
          Indicadores del establecimiento · {animalesData.length} animales registrados
        </p>
      </div>

      {/* ── Sección 1: Actividad de sesiones ── */}
      <section className="flex flex-col" style={{ gap: '1rem' }}>
        <SectionTitle>Actividad de sesiones</SectionTitle>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard titulo="Sesiones realizadas"   valor={sesion.totalSesiones}    Icon={Stethoscope} />
          <StatCard titulo="Animales atendidos"    valor={sesion.totalAtendidos}   Icon={PawPrint} />
          <StatCard titulo="Tratamientos aplicados" valor={sesion.totalTratamientos} Icon={Syringe}
            colorIcon={{ bg: '#EFF6FF', border: '#BFDBFE', icon: '#2563EB' }} />
          <StatCard titulo="Alertas detectadas"   valor={sesion.totalOutliers}    Icon={AlertTriangle}
            colorIcon={{ bg: '#FEF2F2', border: '#FECACA', icon: '#EF4444' }} />
        </div>

        {/* ADPV + Evolución de peso */}
        {sesion.evolucionPeso.length > 0 && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
              <div>
                <h3 className="font-bold" style={{ color: 'var(--verde-oscuro)' }}>Evolución del peso promedio por sesión</h3>
                <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>Datos de sesiones con pesaje registrado</p>
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

        {/* Trabajos más realizados */}
        {sesion.trabajosChart.length > 0 && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 className="font-bold mb-5" style={{ color: 'var(--verde-oscuro)' }}>Trabajos más realizados</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={sesion.trabajosChart} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="trabajo" tick={{ fontSize: 13 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
                <Tooltip formatter={(v) => [`${v} sesión${v !== 1 ? 'es' : ''}`, 'Realizaciones']}
                  contentStyle={{ borderRadius: '0.75rem', border: '1px solid #E5E7EB' }} />
                <Bar dataKey="cantidad" fill="var(--verde-oscuro)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* ── Sección 2: Estado del rodeo ── */}
      <section className="flex flex-col" style={{ gap: '1rem' }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <SectionTitle>Estado del rodeo</SectionTitle>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>{filtrados.length} animal{filtrados.length !== 1 ? 'es' : ''} filtrados</p>
        </div>

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
              {LOTES_TODOS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {filtrados.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📊</p>
            <p className="font-semibold" style={{ color: '#374151' }}>Sin animales para este filtro</p>
          </div>
        ) : (
          <>
            {/* KPIs del rodeo */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard titulo="Total animales"  valor={filtrados.length}
                Icon={PawPrint} />
              <StatCard titulo="Peso promedio"   valor={rodeo.pesoPromedio ? `${rodeo.pesoPromedio} kg` : '—'}
                Icon={Scale} />
              <StatCard titulo="Edad promedio"   valor={formatEdad(rodeo.edadPromMeses)}
                Icon={Clock} />
              <StatCard titulo="Con alerta"      valor={rodeo.alertas}
                Icon={AlertTriangle}
                colorIcon={rodeo.alertas > 0
                  ? { bg: '#FEF2F2', border: '#FECACA', icon: '#EF4444' }
                  : { bg: '#EBF7F1', border: '#C8E6D8', icon: 'var(--verde-medio)' }} />
            </div>

            {/* Preñez */}
            {rodeo.hembras > 0 && (
              <div className="card" style={{ padding: '1.75rem' }}>
                <h3 className="font-bold text-lg mb-5" style={{ color: 'var(--verde-oscuro)' }}>Preñez</h3>
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: 'var(--verde-medio)', fontWeight: 600 }}>Preñadas: {rodeo.prenadas}</span>
                  <span style={{ color: '#6B7280' }}>Vacías: {rodeo.vacias}</span>
                </div>
                <div className="w-full rounded-full h-5" style={{ backgroundColor: '#F3F4F6' }}>
                  <div className="h-5 rounded-full transition-all"
                    style={{ width: `${rodeo.pctPrenez}%`, backgroundColor: 'var(--verde-medio)' }} />
                </div>
                <div className="flex justify-between text-xs mt-1.5">
                  <span style={{ color: 'var(--verde-medio)' }}>{rodeo.pctPrenez}% preñadas</span>
                  <span style={{ color: '#9CA3AF' }}>{100 - rodeo.pctPrenez}% vacías</span>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-5">
                  {[
                    { label: 'Preñadas', valor: rodeo.prenadas, Icon: Heart,       bg: '#EBF7F1', border: '#C8E6D8', color: 'var(--verde-oscuro)', iconColor: 'var(--verde-medio)' },
                    { label: 'Vacías',   valor: rodeo.vacias,   Icon: CircleSlash, bg: '#F9FAFB', border: '#E5E7EB', color: '#374151',              iconColor: '#6B7280' },
                    { label: 'Hembras',  valor: rodeo.hembras,  Icon: Users,       bg: '#EBF7F1', border: '#C8E6D8', color: 'var(--verde-oscuro)', iconColor: 'var(--verde-medio)' },
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

            {rodeo.pctPrenez === null && (
              <div className="card text-center" style={{ padding: '2rem' }}>
                <Heart className="w-8 h-8 mx-auto mb-2" style={{ color: '#D1D5DB' }} />
                <p className="font-semibold" style={{ color: '#374151' }}>Sin hembras en el filtro seleccionado</p>
                <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>Cambiá el filtro de sexo para ver métricas de preñez</p>
              </div>
            )}

            {/* Vacunación */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 className="font-bold text-lg mb-6" style={{ color: 'var(--verde-oscuro)' }}>Cobertura de vacunación</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={rodeo.vacunacion} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="vacuna" tick={{ fontSize: 13 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 13 }} domain={[0, filtrados.length]} />
                  <Tooltip
                    formatter={(v) => [`${v} animales`, 'Vacunados']}
                    contentStyle={{ borderRadius: '0.75rem', border: '1px solid #E5E7EB' }} />
                  <Bar dataKey="cantidad" fill="var(--verde-medio)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </section>

    </div>
  );
}
