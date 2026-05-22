import { estadoColor, estadoLabel } from '../utils/formatters';

export default function AlertaBadge({ estado }) {
  const colors = estadoColor[estado] || estadoColor.sano;
  return (
    <span
      className="badge"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <span
        style={{ backgroundColor: colors.dot, width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0 }}
      />
      {estadoLabel[estado] || estado}
    </span>
  );
}
