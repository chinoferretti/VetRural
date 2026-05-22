export default function LoadingSpinner({ texto = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div
        className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--verde-claro)', borderTopColor: 'transparent' }}
      />
      <p className="text-sm" style={{ color: '#6B7280' }}>{texto}</p>
    </div>
  );
}
