import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, usuario } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  if (usuario) {
    return <Navigate to={usuario.rol === 'productor' ? '/productor' : '/dashboard'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const user = login(form.email, form.password);
      navigate(user.rol === 'productor' ? '/productor' : '/dashboard', { replace: true });
    } catch {
      setError('Email o contraseña incorrectos');
    } finally {
      setCargando(false);
    }
  };

  const completarDemo = (email) => setForm({ email, password: '1234' });

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
      {/* Overlay */}
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(20, 50, 20, 0.70)' }} />

      {/* Logo fuera del card */}
      <div className="relative z-10 flex flex-col items-center mb-6">
        <img
          src="/media/Logo - VetRural.png"
          alt="VetRural"
          style={{ height: '20rem', width: 'auto' }}
        />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full bg-white rounded-2xl" style={{ maxWidth: '360px', padding: '1.5rem' }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--verde-oscuro)' }}>Iniciar sesión</h2>

        <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: '1rem' }}>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="tu@email.com"
              className="w-full rounded-xl border"
              style={{ borderColor: '#D1D5DB', padding: '0.65rem 0.875rem', fontSize: '0.95rem' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Contraseña</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              className="w-full rounded-xl border"
              style={{ borderColor: '#D1D5DB', padding: '0.65rem 0.875rem', fontSize: '0.95rem' }}
            />
          </div>

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
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {/* Demo */}
        <div className="mt-5 pt-4 border-t" style={{ borderColor: '#F3F4F6' }}>
          <p className="text-xs font-medium mb-2" style={{ color: '#9CA3AF' }}>Acceso rápido (demo):</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Veterinario', email: 'vet@vetrural.com' },
              { label: 'Productor',   email: 'productor@campo.com' },
              { label: 'Admin',       email: 'admin@vetrural.com' },
            ].map(({ label, email }) => (
              <button
                key={email}
                type="button"
                onClick={() => completarDemo(email)}
                className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-gray-50"
                style={{ borderColor: '#D1D5DB', color: '#374151' }}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>Contraseña: <strong>1234</strong></p>
        </div>
      </div>
    </div>
  );
}
