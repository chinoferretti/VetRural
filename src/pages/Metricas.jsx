import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import animalesData from '../data/animales.json';
import { PawPrint, Scale, Clock, Heart, CircleSlash, Users } from 'lucide-react';

const VACUNAS_LISTA = ['Aftosa', 'Brucelosis', 'Clostridium', 'IBR', 'Carbunco', 'BVD'];
const LOTES_TODOS  = ['Todos', ...new Set(animalesData.map(a => a.lote))];
const SEXOS        = ['Todos', 'Hembra', 'Macho'];

function calcularEdadMeses(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  const hoy  = new Date();
  const nac  = new Date(fechaNacimiento);
  return (hoy.getFullYear() - nac.getFullYear()) * 12 + (hoy.getMonth() - nac.getMonth());
}

function formatEdad(meses) {
  if (meses === null || isNaN(meses)) return '—';
  const anios = Math.floor(meses / 12);
  const m     = meses % 12;
  if (anios === 0) return `${m} mes${m !== 1 ? 'es' : ''}`;
  if (m === 0)     return `${anios} año${anios !== 1 ? 's' : ''}`;
  return `${anios} año${anios !== 1 ? 's' : ''} ${m} mes${m !== 1 ? 'es' : ''}`;
}

function StatCard({ titulo, valor, subtexto, Icon }) {
  return (
    <div className="card flex flex-col gap-3" style={{ padding: '1.5rem' }}>
      {Icon && (
        <div className="flex items-center justify-center w-10 h-10 rounded-xl"
          style={{ backgroundColor: '#EBF7F1', border: '1.5px solid #C8E6D8' }}>
          <Icon className="w-5 h-5" style={{ color: 'var(--verde-medio)' }} />
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

export default function Metricas() {
  const [sexo, setSexo] = useState('Todos');
  const [lote, setLote] = useState('Todos');

  const filtrados = useMemo(() => animalesData.filter(a =>
    (sexo === 'Todos' || a.sexo === sexo) &&
    (lote === 'Todos' || a.lote === lote)
  ), [sexo, lote]);

  const stats = useMemo(() => {
    if (filtrados.length === 0) return null;

    const hembras    = filtrados.filter(a => a.sexo === 'Hembra');
    const prenadas   = hembras.filter(a => a.prenada);
    const vacias     = hembras.length - prenadas.length;
    const pctPrenez  = hembras.length > 0
      ? Math.round((prenadas.length / hembras.length) * 100)
      : null;

    const conPeso    = filtrados.filter(a => a.peso > 0);
    const pesoPromedio = conPeso.length > 0
      ? Math.round(conPeso.reduce((s, a) => s + a.peso, 0) / conPeso.length)
      : null;

    const conEdad    = filtrados.filter(a => a.fechaNacimiento);
    const edadPromMeses = conEdad.length > 0
      ? Math.round(conEdad.reduce((s, a) => s + calcularEdadMeses(a.fechaNacimiento), 0) / conEdad.length)
      : null;

    const vacunacion = VACUNAS_LISTA.map(v => ({
      vacuna: v,
      cantidad: filtrados.filter(a => a.vacunas?.includes(v)).length,
      total: filtrados.length,
    }));

    return { hembras: hembras.length, prenadas: prenadas.length, vacias, pctPrenez, pesoPromedio, edadPromMeses, vacunacion };
  }, [filtrados]);

  return (
    <div className="flex flex-col w-full" style={{ gap: '2rem' }}>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>Métricas</h1>
        <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>
          Últimas estadísticas registradas · {filtrados.length} animal{filtrados.length !== 1 ? 'es' : ''}
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">

        {/* Sexo */}
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-sm font-semibold" style={{ color: '#374151' }}>Sexo</label>
          <div className="flex rounded-2xl overflow-hidden" style={{ border: '2px solid #E5E7EB' }}>
            {SEXOS.map(s => (
              <button
                key={s}
                onClick={() => setSexo(s)}
                className="flex-1 font-semibold transition-colors"
                style={{
                  padding: '0.85rem 1rem',
                  fontSize: '0.95rem',
                  ...(sexo === s
                    ? { backgroundColor: 'var(--verde-oscuro)', color: 'white' }
                    : { backgroundColor: 'white', color: '#6B7280' })
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Lote */}
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-sm font-semibold" style={{ color: '#374151' }}>Lote</label>
          <select
            value={lote}
            onChange={e => setLote(e.target.value)}
            className="w-full rounded-2xl border bg-white font-semibold"
            style={{ borderColor: '#E5E7EB', padding: '0.85rem 1rem', fontSize: '0.95rem', color: '#374151', borderWidth: '2px' }}
          >
            {LOTES_TODOS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">📊</p>
          <p className="text-lg font-semibold" style={{ color: '#374151' }}>Sin animales para este filtro</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard titulo="Total animales" valor={filtrados.length} Icon={PawPrint} />
            <StatCard titulo="Peso promedio" valor={stats.pesoPromedio ? `${stats.pesoPromedio} kg` : '—'} Icon={Scale} />
            <StatCard titulo="Edad promedio" valor={formatEdad(stats.edadPromMeses)} Icon={Clock} />
            {stats.pctPrenez !== null ? (
              <StatCard titulo="% Preñez" valor={`${stats.pctPrenez}%`} subtexto={`de ${stats.hembras} hembras`} Icon={Heart} />
            ) : (
              <StatCard titulo="% Preñez" valor="—" subtexto="Sin hembras en filtro" Icon={Heart} />
            )}
          </div>

          {/* Preñez detalle — solo si hay hembras */}
          {stats.hembras > 0 && (
            <div className="card" style={{ padding: '1.75rem' }}>
              <h2 className="font-bold text-lg mb-5" style={{ color: 'var(--verde-oscuro)' }}>Preñez</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

                {/* Barra de progreso */}
                <div className="sm:col-span-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span style={{ color: 'var(--verde-medio)', fontWeight: 600 }}>Preñadas: {stats.prenadas}</span>
                    <span style={{ color: '#6B7280' }}>Vacías: {stats.vacias}</span>
                  </div>
                  <div className="w-full rounded-full h-5" style={{ backgroundColor: '#F3F4F6' }}>
                    <div
                      className="h-5 rounded-full transition-all"
                      style={{
                        width: `${stats.pctPrenez}%`,
                        backgroundColor: 'var(--verde-medio)',
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1.5">
                    <span style={{ color: 'var(--verde-medio)' }}>{stats.pctPrenez}% preñadas</span>
                    <span style={{ color: '#9CA3AF' }}>{100 - stats.pctPrenez}% vacías</span>
                  </div>
                </div>

                {/* Contadores */}
                <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: '#EBF7F1' }}>
                  <div className="flex items-center justify-center rounded-xl p-2 flex-shrink-0"
                    style={{ backgroundColor: '#EBF7F1', border: '1.5px solid #C8E6D8' }}>
                    <Heart className="w-6 h-6" style={{ color: 'var(--verde-medio)' }} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>{stats.prenadas}</p>
                    <p className="text-sm" style={{ color: '#6B7280' }}>Preñadas</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: '#F9FAFB' }}>
                  <div className="flex items-center justify-center rounded-xl p-2 flex-shrink-0"
                    style={{ backgroundColor: '#F9FAFB', border: '1.5px solid #E5E7EB' }}>
                    <CircleSlash className="w-6 h-6" style={{ color: '#6B7280' }} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold" style={{ color: '#374151' }}>{stats.vacias}</p>
                    <p className="text-sm" style={{ color: '#6B7280' }}>Vacías</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: '#EBF7F1' }}>
                  <div className="flex items-center justify-center rounded-xl p-2 flex-shrink-0"
                    style={{ backgroundColor: '#EBF7F1', border: '1.5px solid #C8E6D8' }}>
                    <Users className="w-6 h-6" style={{ color: 'var(--verde-medio)' }} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>{stats.hembras}</p>
                    <p className="text-sm" style={{ color: '#6B7280' }}>Total hembras</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vacunación */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h2 className="font-bold text-lg mb-6" style={{ color: 'var(--verde-oscuro)' }}>Cobertura de vacunación</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.vacunacion} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="vacuna" tick={{ fontSize: 13 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 13 }} domain={[0, filtrados.length]} />
                <Tooltip
                  formatter={(v) => [`${v} animales`, 'Vacunados']}
                  contentStyle={{ borderRadius: '0.75rem', border: '1px solid #E5E7EB' }}
                />
                <Bar dataKey="cantidad" fill="var(--verde-medio)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
