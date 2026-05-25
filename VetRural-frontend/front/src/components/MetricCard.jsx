export default function MetricCard({ titulo, valor, subtexto, icono, color = 'var(--verde-medio)', alerta = false }) {
  return (
    <div
      className="card flex flex-col gap-4"
      style={{ borderTop: `4px solid ${color}`, padding: '2rem' }}
    >
      {/* Icono + título */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: '#6B7280' }}>{titulo}</p>
        {icono && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ backgroundColor: color + '1A' }}
          >
            {icono}
          </div>
        )}
      </div>

      {/* Valor */}
      <div>
        <p
          className="text-4xl font-bold leading-none"
          style={{ color: alerta ? '#DC2626' : color }}
        >
          {valor}
        </p>
        {subtexto && (
          <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>{subtexto}</p>
        )}
      </div>
    </div>
  );
}
