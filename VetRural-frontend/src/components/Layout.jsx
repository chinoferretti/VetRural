import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import EstablecimientoModal from './EstablecimientoModal';
import { useEstablecimiento } from '../context/EstablecimientoContext';
import { getQueueLength, processQueue } from '../utils/offlineQueue';
import api from '../api/axios';
import { Outlet } from 'react-router-dom';

function BannerOffline({ online, pendientes }) {
  if (online && pendientes === 0) return null;

  if (!online) {
    return (
      <div className="flex items-center justify-center gap-2 py-2 px-4 text-sm font-semibold"
        style={{ backgroundColor: '#FEF3C7', color: '#92400E', borderBottom: '1px solid #FDE68A' }}>
        <span>📵</span>
        Modo sin conexión — los cambios se sincronizarán automáticamente al reconectarse
      </div>
    );
  }

  // Online pero hay cola pendiente de sincronizar
  return (
    <div className="flex items-center justify-center gap-2 py-2 px-4 text-sm font-semibold"
      style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', borderBottom: '1px solid #BFDBFE' }}>
      <span>🔄</span>
      Sincronizando {pendientes} cambio{pendientes !== 1 ? 's' : ''} pendiente{pendientes !== 1 ? 's' : ''}…
    </div>
  );
}

export default function Layout() {
  const { seleccionado } = useEstablecimiento();
  const [online,    setOnline]    = useState(navigator.onLine);
  const [pendientes,setPendientes]= useState(getQueueLength);

  useEffect(() => {
    const handleOnline = async () => {
      setOnline(true);
      const q = getQueueLength();
      if (q > 0) {
        setPendientes(q);
        await processQueue(api);
        setPendientes(0);
      }
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh', backgroundColor: 'var(--crema)' }}>
      <BannerOffline online={online} pendientes={pendientes} />
      <Navbar />
      <main className="flex flex-col flex-1"
        style={{ padding: 'clamp(1rem, 3vw, 2.5rem) clamp(1rem, 4vw, 3rem)' }}>
        <div className="flex flex-col flex-1" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <Outlet />
        </div>
      </main>

      {!seleccionado && <EstablecimientoModal onClose={() => {}} requerido={true} />}
    </div>
  );
}
