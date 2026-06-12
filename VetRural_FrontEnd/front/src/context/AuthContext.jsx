import { createContext, useContext, useState, useEffect } from 'react';
import { loginApi } from '../api/authApi';

const AuthContext = createContext(null);

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
      // 2. Fallback offline: usuarios guardados localmente en el dispositivo
      const found = getRegistrados().find(u => u.email === email && u.password === password);
      if (!found) throw new Error('Credenciales incorrectas');
      const { password: _, ...userData } = found;
      persistir(userData);
      localStorage.setItem('vetrural_token', 'local-jwt-' + userData.id);
      return userData;
    }
  };

  const registrar = ({ nombre, apellido, email, password, rol, id }) => {
    const registrados = getRegistrados();
    if (registrados.find(u => u.email === email)) return; // ya existe, ignorar
    const nuevo = { id: id ?? Date.now(), nombre: `${nombre} ${apellido}`.trim(), email, password, rol, plan: 'Básico' };
    localStorage.setItem('vetrural_usuarios_registrados', JSON.stringify([...registrados, nuevo]));
    return nuevo;
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('vetrural_usuario');
    localStorage.removeItem('vetrural_token');
  };

  const tieneRol = (...roles) => usuario && roles.includes(usuario.rol);

  return (
    <AuthContext.Provider value={{ usuario, login, registrar, logout, cargando, tieneRol }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
