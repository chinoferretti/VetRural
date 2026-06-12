import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEstablecimiento } from '../context/EstablecimientoContext';
import { PawPrint, ClipboardList, Stethoscope, BarChart2, MapPin } from 'lucide-react';

const ACCIONES = [
  {
    label: 'Gestionar animales',
    descripcion: 'Ver, editar y administrar el rodeo',
    Icono: PawPrint,
    to: '/animales',
  },
  {
    label: 'Visualizar sesiones',
    descripcion: 'Consultar el historial de visitas veterinarias',
    Icono: ClipboardList,
    to: '/historial',
  },
  {
    label: 'Comenzar sesión',
    descripcion: 'Registrar trabajos sobre el rodeo',
    Icono: Stethoscope,
    to: '/sesion',
  },
  {
    label: 'Visualizar métricas',
    descripcion: 'Indicadores y estadísticas del establecimiento',
    Icono: BarChart2,
    to: '/metricas',
  },
];

function saludo() {
  const h = new Date().getHours();
  if (h >= 5 && h < 13) return 'Buen día';
  if (h >= 13 && h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function Dashboard() {
  const { usuario } = useAuth();
  const { seleccionado } = useEstablecimiento();
  const navigate = useNavigate();
  const esProductor = usuario?.rol === 'productor';

  return (
    <div className="flex flex-col flex-1" style={{ gap: '1rem' }}>

      {/* Header */}
      <div style={{ flexShrink: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>
          {saludo()}, {usuario?.nombre?.split(' ')[0]}
        </h1>
        {seleccionado && (
          <p className="mt-0.5 text-sm font-medium" style={{ color: '#6B7280' }}>
            {seleccionado.nombre}{seleccionado.ubicacion ? ` · ${seleccionado.ubicacion}` : ''}
          </p>
        )}
      </div>

      {/* Banner de gestión — solo para Productor, encima de la grilla */}
      {esProductor && (
        <button
          onClick={() => navigate('/miembros')}
          className="w-full rounded-2xl flex items-center gap-4 transition-all active:scale-[0.99] hover:shadow-md"
          style={{
            backgroundColor: 'var(--verde-oscuro)',
            padding: '1.1rem 1.5rem',
            flexShrink: 0,
          }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <MapPin className="w-6 h-6" style={{ color: 'white' }} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-white" style={{ fontSize: '1rem' }}>
              Gestionar mi establecimiento
            </p>
            <p className="text-sm" style={{ color: 'var(--acento)' }}>
              Miembros, invitaciones y configuración del campo
            </p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}
            style={{ width: '1.2rem', height: '1.2rem', flexShrink: 0, opacity: 0.7 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Grilla 2×2 */}
      <div
        className="grid sm:grid-cols-2"
        style={{
          flex: 1,
          gap: '0.75rem',
          gridTemplateRows: 'repeat(2, 1fr)',
          minHeight: 0,
        }}
      >
        {ACCIONES.map(({ label, descripcion, Icono, to }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="rounded-2xl transition-all active:scale-[0.98] hover:shadow-md flex flex-col items-center justify-center text-center"
            style={{
              backgroundColor: 'white',
              border: '2px solid #C8E6D8',
              padding: '1.5rem',
              width: '100%',
              height: '100%',
              gap: '0.75rem',
            }}
          >
            <div
              className="flex items-center justify-center rounded-2xl"
              style={{
                backgroundColor: '#EBF7F1',
                border: '2px solid #C8E6D8',
                width: 'min(44%, 7rem)',
                aspectRatio: '1 / 1',
              }}
            >
              <Icono style={{ color: 'var(--verde-medio)', width: 'min(22%, 3.2rem)', height: 'min(22%, 3.2rem)' }} />
            </div>
            <div>
              <p className="font-bold leading-tight" style={{ color: 'var(--verde-oscuro)', fontSize: 'clamp(1rem, 2.5vw, 1.5rem)' }}>
                {label}
              </p>
              <p className="mt-1 leading-tight" style={{ color: '#6B7280', fontSize: 'clamp(0.78rem, 1.6vw, 1rem)' }}>
                {descripcion}
              </p>
            </div>
          </button>
        ))}
      </div>

    </div>
  );
}
