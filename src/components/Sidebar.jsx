import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Funcionalidades compartidas por todos los roles
const NAV_BASE = [
  { to: '/dashboard', label: 'Dashboard',        icon: '🏠' },
  { to: '/animales',  label: 'Animales',          icon: '🐄' },
  { to: '/sesion',    label: 'Nueva Sesión',      icon: '🩺' },
  { to: '/historial', label: 'Historial',         icon: '📋' },
  { to: '/metricas',  label: 'Métricas',          icon: '📊' },
  { to: '/partes',    label: 'Partes Sanitarios', icon: '📄' },
];

// Exclusivas del Productor
const NAV_PRODUCTOR = [
  { to: '/miembros', label: 'Gestionar campo', icon: '🏡' },
];

const ROL_LABEL = {
  veterinario: 'Veterinario',
  productor:   'Productor Agropecuario',
  otros:       'Colaborador',
};

const PLAN_COLOR = {
  Pro:    { bg: '#D1FAE5', text: '#065F46' },
  Básico: { bg: '#DBEAFE', text: '#1E40AF' },
};

export default function Sidebar({ open, onClose }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    ...NAV_BASE,
    ...(usuario?.rol === 'productor' ? NAV_PRODUCTOR : []),
  ];

  const plan = PLAN_COLOR[usuario?.plan] ?? PLAN_COLOR.Básico;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-30 flex flex-col transition-transform duration-300
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: '17rem', backgroundColor: 'var(--verde-oscuro)', color: 'white', minHeight: '100vh' }}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: 'var(--verde-claro)' }}>
              🐄
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">VetRural</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--acento)' }}>Gestión Veterinaria</p>
            </div>
          </div>
          {usuario && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="badge text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: plan.bg, color: plan.text }}>
                Plan {usuario.plan}
              </span>
              {usuario.matricula && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'var(--acento)' }}>
                  Mat. {usuario.matricula}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-7 space-y-1 overflow-y-auto">
          {navLinks.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors
                 ${isActive ? 'text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`
              }
              style={({ isActive }) => isActive ? { backgroundColor: 'var(--verde-medio)' } : {}}>
              <span className="text-lg leading-none flex-shrink-0">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Usuario */}
        {usuario && (
          <div className="px-4 py-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: 'var(--verde-medio)' }}>
                {usuario.nombre.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{usuario.nombre}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--acento)' }}>
                  {ROL_LABEL[usuario.rol] ?? usuario.rol}
                </p>
              </div>
            </div>
            <button onClick={handleLogout}
              className="w-full py-2.5 rounded-xl text-xs font-semibold transition-colors hover:bg-red-600"
              style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#FCA5A5' }}>
              Cerrar sesión
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
