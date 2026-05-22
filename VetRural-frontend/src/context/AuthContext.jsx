import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

// Emails de cuentas demo — nunca tocan el backend
export const DEMO_EMAILS = new Set([
  'vet@vetrural.com',
  'productor@campo.com',
  'peon@campo.com',
]);

const USUARIOS_MOCK = [
  { id: 1, nombre: 'Dr. Carlos Ramírez', email: 'vet@vetrural.com',    password: '1234', rol: 'veterinario', matricula: 'MV-12345', plan: 'Pro' },
  { id: 2, nombre: 'Juan Pereyra',       email: 'productor@campo.com', password: '1234', rol: 'productor',   plan: 'Básico' },
  { id: 3, nombre: 'Pedro Martínez',     email: 'peon@campo.com',      password: '1234', rol: 'otros',       plan: 'Básico' },
];

// Mapeo rol frontend → TipoUsuarioEnum backend
const ROL_A_TIPO = {
  veterinario: 'Veterinario',
  productor:   'Productor_Agropecuario',
  otros:       'Otros',
};

function getRegistrados() {
  try { return JSON.parse(localStorage.getItem('vetrural_usuarios_registrados') || '[]'); } catch { return []; }
}

export function AuthProvider({ children }) {
  const [usuario,  setUsuario]  = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('vetrural_usuario');
    if (stored) setUsuario(JSON.parse(stored));
    setCargando(false);
  }, []);

  const login = (email, password) => {
    const todos = [...USUARIOS_MOCK, ...getRegistrados()];
    const found = todos.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Credenciales incorrectas');
    const { password: _, ...userData } = found;
    setUsuario(userData);
    localStorage.setItem('vetrural_usuario', JSON.stringify(userData));
    localStorage.setItem('vetrural_token', 'mock-jwt-' + userData.id);
    return userData;
  };

  // Llama al backend y luego guarda localmente para el login offline
  const registrar = async ({ nombre, apellido, email, password, rol }) => {
    const todos = [...USUARIOS_MOCK, ...getRegistrados()];
    if (todos.find(u => u.email === email)) throw new Error('El email ya está registrado');

    const { data } = await api.post('/usuarios', {
      nombre,
      apellido,
      email,
      contrasena: password,
      tipo: ROL_A_TIPO[rol] ?? 'Otros',
    });

    // Guardamos con el id real del backend para que los endpoints de usuario funcionen
    const nuevo = {
      id:       data.idUsuario,
      nombre:   `${nombre} ${apellido}`.trim(),
      email,
      password,   // necesario para el login local mientras no haya /auth/login
      rol,
      plan: 'Básico',
    };
    localStorage.setItem(
      'vetrural_usuarios_registrados',
      JSON.stringify([...getRegistrados(), nuevo]),
    );
    return nuevo;
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('vetrural_usuario');
    localStorage.removeItem('vetrural_token');
  };

  // Actualiza el id del usuario cuando el backend asigna uno nuevo (ej: después de reset de DB)
  const actualizarId = (nuevoId) => {
    if (!usuario || usuario.id === nuevoId) return;
    const actualizado = { ...usuario, id: nuevoId };
    setUsuario(actualizado);
    localStorage.setItem('vetrural_usuario', JSON.stringify(actualizado));
    const registrados = getRegistrados().map(u =>
      u.email === usuario.email ? { ...u, id: nuevoId } : u
    );
    localStorage.setItem('vetrural_usuarios_registrados', JSON.stringify(registrados));
  };

  const tieneRol   = (...roles) => usuario && roles.includes(usuario.rol);
  const esDemoUser = () => usuario && DEMO_EMAILS.has(usuario.email);

  return (
    <AuthContext.Provider value={{ usuario, login, registrar, logout, cargando, tieneRol, esDemoUser, actualizarId }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
