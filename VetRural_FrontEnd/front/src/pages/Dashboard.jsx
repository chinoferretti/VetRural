import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEstablecimiento } from '../context/EstablecimientoContext';
import { PawPrint, ClipboardList, Stethoscope, BarChart2, MapPin } from 'lucide-react';

function useColumnas() {
  const get = () => window.innerWidth >= 640 ? 2 : 1;
  const [cols, setCols] = useState(get);
  useEffect(() => {
    const h = () => setCols(get());
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return cols;
}

const ACCIONES = [
  {
    label: 'Animales',
    descripcion: 'Ver, editar y administrar el rodeo',
    Icono: PawPrint,
    to: '/animales',
  },
  {
    label: 'Sesión',
    descripcion: 'Registrar trabajos sobre el rodeo',
    Icono: Stethoscope,
    to: '/sesion',
  },
  {
    label: 'Métricas Generales',
    descripcion: 'Indicadores y estadísticas del establecimiento',
    Icono: BarChart2,
    to: '/metricas',
  },
  {
    label: 'Historial de Sesiones',
    descripcion: 'Consultar el historial de visitas veterinarias',
    Icono: ClipboardList,
    to: '/historial',
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
  const cols = useColumnas();
  const filas = Math.ceil(ACCIONES.length / cols);

  return (
    <div className="flex flex-col flex-1" style={{ gap: 'clamp(0.4rem, 1.5vh, 1rem)', minHeight: 0 }}>

      {/* Header */}
      <div style={{ flexShrink: 0 }}>
        <h1 className="font-bold" style={{ color: 'var(--verde-oscuro)', fontSize: 'clamp(1.25rem, 3.5vh, 1.75rem)' }}>
          {saludo()}, {usuario?.nombre?.split(' ')[0]}
        </h1>
        {seleccionado && (
          <p className="mt-0.5 text-sm font-medium" style={{ color: '#6B7280' }}>
            {seleccionado.nombre}{seleccionado.ubicacion ? ` · ${seleccionado.ubicacion}` : ''}
          </p>
        )}
      </div>

      {/* Banner de gestión — solo para Productor */}
      {esProductor && (
        <button
          onClick={() => navigate('/miembros')}
          className="w-full rounded-2xl flex items-center gap-3 transition-all active:scale-[0.99] hover:shadow-md"
          style={{
            backgroundColor: 'var(--verde-oscuro)',
            padding: 'clamp(0.6rem, 1.5vh, 1.1rem) 1.25rem',
            flexShrink: 0,
          }}
        >
          <div className="rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', width: 'clamp(2rem, 5vh, 3rem)', height: 'clamp(2rem, 5vh, 3rem)' }}>
            <MapPin style={{ color: 'white', width: 'clamp(1rem, 2.5vh, 1.5rem)', height: 'clamp(1rem, 2.5vh, 1.5rem)' }} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-white" style={{ fontSize: 'clamp(0.85rem, 2vh, 1rem)' }}>
              Gestionar mi establecimiento
            </p>
            <p style={{ color: 'var(--acento)', fontSize: 'clamp(0.75rem, 1.5vh, 0.875rem)' }}>
              Miembros, invitaciones y configuración del campo
            </p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}
            style={{ width: '1.1rem', height: '1.1rem', flexShrink: 0, opacity: 0.7 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Grilla 2×2 (1×4 en mobile) */}
      <div
        style={{
          display: 'grid',
          flex: 1,
          gap: 'clamp(0.4rem, 1vh, 0.75rem)',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${filas}, 1fr)`,
          minHeight: 0,
        }}
      >
        {ACCIONES.map(({ label, descripcion, Icono, to }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="btn-fill rounded-2xl transition-all active:scale-[0.98] hover:shadow-md flex flex-col items-center justify-center text-center"
            style={{
              backgroundColor: 'white',
              border: '2px solid #C8E6D8',
              padding: 'clamp(0.5rem, 1.5vh, 1.5rem)',
              width: '100%',
              height: '100%',
              gap: 'clamp(0.25rem, 1vh, 0.75rem)',
              overflow: 'hidden',
            }}
          >
            <div
              className="fill-icono flex items-center justify-center"
              style={{ backgroundColor: '#EBF7F1', border: '2px solid #C8E6D8' }}
            >
              <Icono className="fill-svg" style={{ color: 'var(--verde-medio)' }} />
            </div>
            <div>
              <p className="fill-label font-bold" style={{ color: 'var(--verde-oscuro)' }}>
                {label}
              </p>
              <p className="fill-desc" style={{ color: '#6B7280' }}>
                {descripcion}
              </p>
            </div>
          </button>
        ))}
      </div>

    </div>
  );
}
