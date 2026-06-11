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
      style={{ padding: '0.875rem 1rem', border: '1.5px solid #E5E7EB', gap: '0.75rem' }}
    >
      {/* Info — clickeable para ver detalle */}
      <button
        className="flex items-center flex-1 min-w-0 text-left"
        style={{ gap: '0.6rem' }}
        onClick={() => navigate(`/animales/${animal.id}`)}
        disabled={eliminando}
      >
        <div className="rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: '#F9FAFB', width: '3.8rem', height: '3.8rem' }}>
          <img
            src={esMacho ? toroImg : vacaImg}
            alt={esMacho ? 'Toro' : 'Vaca'}
            style={{ width: '3.6rem', height: '3.6rem' }}
            className="object-contain"
          />
        </div>
        <div className="min-w-0 flex items-baseline overflow-hidden" style={{ gap: '0.6rem' }}>
          <p className="font-bold truncate flex-shrink-0" style={{ color: 'var(--verde-oscuro)', fontSize: '1.4rem' }}>
            N° {animal.caravana}
          </p>
          {animal.apodo && (
            <p className="font-semibold truncate" style={{ color: '#9CA3AF', fontSize: '1.4rem' }}>{animal.apodo}</p>
          )}
        </div>
      </button>

      {/* Acciones */}
      <div className="flex items-center flex-shrink-0" style={{ gap: '0.4rem' }}>
        {confirmando ? (
          <>
            <button
              onClick={handleEliminar}
              disabled={eliminando}
              className="rounded-xl font-semibold transition-colors disabled:opacity-60"
              style={{ backgroundColor: '#FEE2E2', color: '#EF4444', padding: '0.4rem 0.6rem', fontSize: '0.7rem' }}
            >
              {eliminando ? 'Eliminando...' : 'Confirmar'}
            </button>
            <button
              onClick={handleCancelar}
              disabled={eliminando}
              className="rounded-xl font-semibold transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#F3F4F6', color: '#6B7280', padding: '0.4rem 0.6rem', fontSize: '0.7rem' }}
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleEditar}
              className="flex items-center justify-center rounded-xl transition-colors hover:bg-blue-50"
              style={{ border: '1.5px solid #E5E7EB', color: '#3B82F6', width: '2.2rem', height: '2.2rem' }}
              title="Editar"
            >
              <Pencil style={{ width: '0.8rem', height: '0.8rem' }} />
            </button>
            <button
              onClick={handleEliminar}
              className="flex items-center justify-center rounded-xl transition-colors hover:bg-red-50"
              style={{ border: '1.5px solid #E5E7EB', color: '#EF4444', width: '2.2rem', height: '2.2rem' }}
              title="Eliminar"
            >
              <Trash2 style={{ width: '0.8rem', height: '0.8rem' }} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
