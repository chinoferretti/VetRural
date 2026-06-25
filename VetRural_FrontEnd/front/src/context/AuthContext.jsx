import { createContext, useContext, useState, useEffect } from 'react';
import { loginApi } from '../api/authApi';
import api from '../api/axios';

const AuthContext = createContext(null);

function limpiarStorage() {
  Object.keys(localStorage)
    .filter(k => k.startsWith('vetrural_') && !k.startsWith('vetrural_historial_est_'))
    .forEach(k => localStorage.removeItem(k));
}

const TIPO_A_ROL = {
  Veterinario:           'veterinario',
  Anotador:              'otros',
  Productor_Agropecuario: 'productor',
};

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('vetrural_usuario');
    if (!stored) { setCargando(false); return; }

    const userData = JSON.parse(stored);
    api.get(`/usuarios/${userData.id}`)
      .then(() => setUsuario(userData))
      .catch(() => limpiarStorage())
      .finally(() => setCargando(false));
  }, []);

  const persistir = (userData) => {
    setUsuario(userData);
    localStorage.setItem('vetrural_usuario', JSON.stringify(userData));
  };

  const login = async (email, password) => {
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
  };

  const registrar = ({ nombre, apellido, email, password, rol, id }) => {
    // Mantenido para compatibilidad, pero ya no se usa para el fallback de login
    void [nombre, apellido, email, password, rol, id];
  };

  const logout = () => {
    setUsuario(null);
    limpiarStorage();
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
