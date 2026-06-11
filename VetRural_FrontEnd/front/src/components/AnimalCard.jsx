import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import vacaImg from '../assets/vaca.png';
import toroImg from '../assets/toro.png';

export default function AnimalCard({ animal, onEliminar }) {
  const navigate = useNavigate();
  const [confirmando, setConfirmando] = useState(false);
  const [eliminando,  setEliminando]  = useState(false);

  const esMacho = animal.sexo === 'Macho';

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
      {/* Info — clickeable para ver detalle */}
      <button
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
        onClick={() => navigate(`/animales/${animal.id}`)}
        disabled={eliminando}
      >
        <div className="rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: '#F9FAFB', width: '4.75rem', height: '4.75rem' }}>
          <img
            src={esMacho ? toroImg : vacaImg}
            alt={esMacho ? 'Toro' : 'Vaca'}
            style={{ width: '4.5rem', height: '4.5rem' }}
            className="object-contain"
          />
        </div>
        <div className="min-w-0 flex items-baseline gap-4 overflow-hidden">
          <p className="font-bold truncate flex-shrink-0" style={{ color: 'var(--verde-oscuro)', fontSize: '1.75rem' }}>
            N° {animal.caravana}
          </p>
          {animal.apodo && (
            <p className="font-semibold truncate" style={{ color: '#9CA3AF', fontSize: '1.75rem' }}>{animal.apodo}</p>
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
