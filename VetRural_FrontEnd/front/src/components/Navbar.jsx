import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEstablecimiento } from '../context/EstablecimientoContext';
import { useAuth } from '../context/AuthContext';
import EstablecimientoModal from './EstablecimientoModal';
import { ChevronLeft, Leaf, MapPin } from 'lucide-react';

export default function Navbar() {
  const { seleccionado } = useEstablecimiento();
  const { usuario, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const enInicio = location.pathname === '/dashboard';
  const enSesionActiva = /^\/sesion(\/animal|\/registro)$/.test(location.pathname);
  const mostrarVolver = !enInicio && !enSesionActiva;

  function resolverVolver(pathname) {
    if (pathname === '/sesion/resumen') return '/historial';
    const editarMatch = pathname.match(/^\/animales\/(.+)\/editar$/);
    if (editarMatch) return `/animales/${editarMatch[1]}`;
    if (/^\/animales\/.+/.test(pathname)) return '/animales';
    if (['/animales', '/historial', '/metricas', '/partes', '/miembros', '/invitaciones'].includes(pathname)) return '/dashboard';
    if (/^\/sesion/.test(pathname)) return '/dashboard';
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header
        className="sticky top-0 z-10 flex items-center justify-between"
        style={{
          backgroundColor: 'var(--verde-oscuro)',
          padding: '0 1rem',
          height: '4.5rem',
          flexShrink: 0,
          gap: '0.5rem',
        }}
      >
        {/* Izquierda: botón volver + logo */}
        <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
          {mostrarVolver && (
            <button
              onClick={() => { const dest = resolverVolver(location.pathname); dest ? navigate(dest) : navigate(-1); }}
              className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors hover:bg-white/10 flex-shrink-0"
              style={{ color: 'white' }}
              aria-label="Volver"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 rounded-xl flex-shrink-0"
            style={{ backgroundColor: 'white', padding: '0.35rem 0.7rem' }}
          >
            <Leaf className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--verde-medio)' }} />
            <span className="font-bold text-base" style={{ color: 'var(--verde-oscuro)', letterSpacing: '-0.01em' }}>
              VetRural
            </span>
          </button>
        </div>

        {/* Derecha: establecimiento + usuario */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Establecimiento */}
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl transition-colors hover:bg-white/10"
            style={{
              border: '2px solid rgba(255,255,255,0.3)',
              padding: '0.5rem 0.75rem',
            }}
          >
            <MapPin className="w-5 h-5 flex-shrink-0" style={{ color: 'white' }} />
            <div className="hidden sm:block text-left" style={{ maxWidth: '150px' }}>
              <p className="text-xs font-medium leading-tight" style={{ color: 'rgba(255,255,255,0.6)' }}>Establecimiento</p>
              <p className="text-sm font-bold truncate leading-tight" style={{ color: seleccionado ? 'white' : '#FCA5A5' }}>
                {seleccionado ? seleccionado.nombre : 'Sin establecimiento'}
              </p>
            </div>
            {/* En móvil: solo muestra un punto rojo si no hay establecimiento */}
            {!seleccionado && (
              <span className="sm:hidden w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#FCA5A5' }} />
            )}
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Usuario */}
          {usuario && (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                className="flex items-center gap-2 p-1.5 rounded-xl transition-colors hover:bg-white/10"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: 'var(--verde-medio)', color: 'white' }}
                >
                  {usuario.nombre.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold leading-tight" style={{ color: 'white' }}>
                    {usuario.nombre.split(' ')[0]}
                  </p>
                  <p className="text-xs capitalize leading-tight" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {usuario.rol}
                  </p>
                </div>
              </button>

              {/* Dropdown usuario */}
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div
                    className="absolute right-0 top-full mt-2 rounded-2xl z-20"
                    style={{
                      backgroundColor: 'white',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      minWidth: '200px',
                      padding: '1rem',
                    }}
                  >
                    <p className="font-bold mb-3" style={{ color: 'var(--verde-oscuro)' }}>{usuario.nombre}</p>
                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 rounded-md text-sm font-semibold transition-opacity hover:opacity-85"
                      style={{ backgroundColor: 'var(--verde-oscuro)', color: 'white' }}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {modalOpen && (
        <EstablecimientoModal onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
