export const formatFecha = (fecha) => {
  if (!fecha) return '—';
  // LocalDate → "2026-05-22"  /  LocalDateTime → "2026-05-22T10:30:00"
  const str = String(fecha).includes('T') ? fecha : `${fecha}T00:00:00`;
  const d = new Date(str);
  if (isNaN(d.getTime())) return '—';
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

export const tipoParteColor = {
  Emergencia: '#FEE2E2',
  Vacunación: '#D1FAE5',
  Tratamiento: '#FEF3C7',
  Control: '#DBEAFE',
  Evaluación: '#EDE9FE',
};
