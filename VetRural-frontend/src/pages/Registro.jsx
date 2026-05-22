import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'veterinario', label: 'Veterinario',  desc: 'Profesional con matrícula' },
  { value: 'productor',   label: 'Productor',    desc: 'Dueño de establecimiento'  },
  { value: 'otros',       label: 'Colaborador',  desc: 'Peón u otro trabajador'    },
];

export default function Registro() {
  const { usuario, registrar } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', confirmar: '', rol: 'veterinario' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  if (usuario) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmar) { setError('Las contraseñas no coinciden'); return; }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }

    setCargando(true);
    try {
      await registrar({
        nombre:   form.nombre,
        apellido: form.apellido,
        email:    form.email,
        password: form.password,
        rol:      form.rol,
      });
      navigate('/login', { replace: true, state: { registrado: true } });
    } catch (err) {
      setError(err.message || 'No se pudo crear la cuenta. Intente nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  const campo = (label, name, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>{label}</label>
      <input
        type={type}
        name={name}
        required
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-xl border"
        style={{ borderColor: '#D1D5DB', padding: '0.65rem 0.875rem', fontSize: '0.95rem' }}
      />
    </div>
  );

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{
        backgroundImage: 'url(/media/fondo_campo.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(20, 50, 20, 0.70)' }} />

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center mb-6">
        <img
          src="/media/Logo - VetRural.png"
          alt="VetRural"
          style={{ height: '12rem', width: 'auto' }}
        />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full bg-white rounded-2xl" style={{ maxWidth: '420px', padding: '1.75rem' }}>
        <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--verde-oscuro)' }}>Crear cuenta</h2>

        <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: '1rem' }}>

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Tipo de cuenta</label>
            <div className="flex flex-col gap-2">
              {ROLES.map(({ value, label, desc }) => {
                const activo = form.rol === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, rol: value }))}
                    className="flex items-center gap-3 rounded-xl text-left transition-colors"
                    style={{
                      padding: '0.75rem 1rem',
                      border: activo ? '2px solid var(--verde-medio)' : '2px solid #E5E7EB',
                      backgroundColor: activo ? '#F0FDF4' : 'white',
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                      style={{
                        border: activo ? '5px solid var(--verde-medio)' : '2px solid #D1D5DB',
                        backgroundColor: 'white',
                      }}
                    />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: activo ? 'var(--verde-oscuro)' : '#374151' }}>
                        {label}
                      </p>
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>{desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nombre + Apellido */}
          <div className="flex gap-3">
            {campo('Nombre', 'nombre', 'text', 'Juan')}
            {campo('Apellido', 'apellido', 'text', 'Pérez')}
          </div>

          {campo('Email', 'email', 'email', 'tu@email.com')}
          {campo('Contraseña', 'password', 'password', '••••••••')}
          {campo('Confirmar contraseña', 'confirmar', 'password', '••••••••')}

          {error && (
            <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="btn-primary w-full disabled:opacity-60"
            style={{ padding: '0.9rem', fontSize: '1rem', marginTop: '0.25rem' }}
          >
            {cargando ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t text-center" style={{ borderColor: '#F3F4F6' }}>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="font-semibold" style={{ color: 'var(--verde-medio)' }}>
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
