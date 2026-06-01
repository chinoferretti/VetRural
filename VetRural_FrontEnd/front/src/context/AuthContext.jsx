import { createContext, useContext, useState, useEffect } from 'react';
import { loginApi } from '../api/authApi';

const AuthContext = createContext(null);

const DEMO_IDS = new Set([1, 2, 3]);

const USUARIOS_MOCK = [
  { id: 1, nombre: 'Dr. Carlos Ramírez', email: 'vet@vetrural.com',       password: '1234', rol: 'veterinario', plan: 'Pro' },
  { id: 2, nombre: 'Juan Pereyra',       email: 'productor@campo.com',    password: '1234', rol: 'productor',   plan: 'Básico' },
  { id: 3, nombre: 'Pedro Martínez',     email: 'peon@campo.com',         password: '1234', rol: 'otros',       plan: 'Básico' },
];

const TIPO_A_ROL = {
  Veterinario:           'veterinario',
  Anotador:              'otros',
  Productor_Agropecuario: 'productor',
};

function getRegistrados() {
  try { return JSON.parse(localStorage.getItem('vetrural_usuarios_registrados') || '[]'); } catch { return []; }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('vetrural_usuario');
    if (stored) setUsuario(JSON.parse(stored));
    setCargando(false);
  }, []);

  const persistir = (userData) => {
    setUsuario(userData);
    localStorage.setItem('vetrural_usuario', JSON.stringify(userData));
  };

  const login = async (email, password) => {
    // 1. Intentar login contra el backend
    try {
      const data = await loginApi(email, password);
      const userData = {
        id:     data.idUsuario,
        nombre: `${data.nombre} ${data.apellido}`.trim(),
        email:  data.email,
        rol:    TIPO_A_ROL[data.tipo] || 'otros',
        plan:   'Básico',
      };
      persistir(userData);
      localStorage.setItem('vetrural_token', 'jwt-' + data.idUsuario);
      return userData;
    } catch {
      // 2. Fallback: usuarios demo y usuarios guardados localmente
      const todos = [...USUARIOS_MOCK, ...getRegistrados()];
      const found = todos.find(u => u.email === email && u.password === password);
      if (!found) throw new Error('Credenciales incorrectas');
      const { password: _, ...userData } = found;
      persistir(userData);
      localStorage.setItem('vetrural_token', 'mock-jwt-' + userData.id);
      return userData;
    }
  };

  const registrar = ({ nombre, apellido, email, password, rol }) => {
    const todos = [...USUARIOS_MOCK, ...getRegistrados()];
    if (todos.find(u => u.email === email)) throw new Error('El email ya está registrado');
    const nuevo = { id: Date.now(), nombre: `${nombre} ${apellido}`.trim(), email, password, rol, plan: 'Básico' };
    localStorage.setItem('vetrural_usuarios_registrados', JSON.stringify([...getRegistrados(), nuevo]));
    return nuevo;
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('vetrural_usuario');
    localStorage.removeItem('vetrural_token');
  };

  const tieneRol   = (...roles) => usuario && roles.includes(usuario.rol);
  const esDemoUser = () => usuario && DEMO_IDS.has(usuario.id);

  return (
    <AuthContext.Provider value={{ usuario, login, registrar, logout, cargando, tieneRol, esDemoUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
