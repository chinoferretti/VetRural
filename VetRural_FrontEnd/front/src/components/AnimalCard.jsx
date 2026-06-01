import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Tag } from 'lucide-react';

export default function AnimalCard({ animal, onEliminar }) {
  const navigate = useNavigate();
  const [confirmando, setConfirmando] = useState(false);
  const [eliminando,  setEliminando]  = useState(false);

  const handleEliminar = async (e) => {
    e.stopPropagation();
    if (!confirmando) { setConfirmando(true); return; }
    setEliminando(true);
    try {
      await onEliminar(animal.id);
    } catch {
      setEliminando(false);
      setConfirmando(false);
    }
  };

  const handleCancelar = (e) => {
    e.stopPropagation();
    setConfirmando(false);
  };

  const handleEditar = (e) => {
    e.stopPropagation();
    navigate(`/animales/${animal.id}/editar`);
  };

  return (
    <div
      className="flex items-center justify-between rounded-2xl bg-white"
      style={{ padding: '1.1rem 1.25rem', border: '1.5px solid #E5E7EB', gap: '1rem' }}
    >
      {/* Caravana — clickeable para ver detalle */}
      <button
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
        onClick={() => navigate(`/animales/${animal.id}`)}
        disabled={eliminando}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: '#EBF7F1' }}>
          <Tag className="w-4 h-4" style={{ color: 'var(--verde-medio)' }} />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-base tracking-wide truncate" style={{ color: 'var(--verde-oscuro)', fontFamily: 'monospace' }}>
            {animal.caravana}
          </p>
          {animal.nombre && (
            <p className="text-sm truncate" style={{ color: '#9CA3AF' }}>{animal.nombre}</p>
          )}
        </div>
      </button>

      {/* Acciones */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {confirmando ? (
          <>
            <button
              onClick={handleEliminar}
              disabled={eliminando}
              className="px-3 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
              style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}
            >
              {eliminando ? 'Eliminando...' : 'Confirmar'}
            </button>
            <button
              onClick={handleCancelar}
              disabled={eliminando}
              className="px-3 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleEditar}
              className="flex items-center justify-center w-11 h-11 rounded-xl transition-colors hover:bg-blue-50"
              style={{ border: '1.5px solid #E5E7EB', color: '#3B82F6' }}
              title="Editar"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={handleEliminar}
              className="flex items-center justify-center w-11 h-11 rounded-xl transition-colors hover:bg-red-50"
              style={{ border: '1.5px solid #E5E7EB', color: '#EF4444' }}
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
