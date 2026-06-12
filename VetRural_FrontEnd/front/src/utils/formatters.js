export const formatFecha = (fecha) => {
  if (!fecha) return '—';
  const d = new Date(fecha + 'T00:00:00');
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatPeso = (peso) => (peso ? `${peso} kg` : '—');

export const estadoLabel = {
  sano: 'Sano',
  alerta: 'Alerta',
  critico: 'Crítico',
};

export const estadoColor = {
  sano: { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
  alerta: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  critico: { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
};

