import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, XCircle } from 'lucide-react';
import vacaImg from '../assets/vaca.png';
import toroImg from '../assets/toro.png';

const ESTADOS_BAJA = ['Vendido', 'Muerto', 'Transferido'];

export default function AnimalCard({ animal, onDarBaja }) {
  const navigate = useNavigate();
  const [bajando,   setBajando]   = useState(false);
  const [estado,    setEstado]    = useState('');
  const [motivo,    setMotivo]    = useState('');
  const [guardando, setGuardando] = useState(false);

  const esMacho = animal.sexo === 'Macho';

  const handleEditar = (e) => {
    e.stopPropagation();
    navigate(`/animales/${animal.id}/editar`);
  };

  const handleIniciarBaja = (e) => {
    e.stopPropagation();
    setBajando(true);
    setEstado('Vendido');
  };

  const handleConfirmar = async (e) => {
    e.stopPropagation();
    if (!estado) return;
    setGuardando(true);
    try {
      await onDarBaja(animal.id, { estado, motivoBaja: motivo || null });
    } catch {
      setGuardando(false);
      setBajando(false);
    }
  };

  const handleCancelar = (e) => {
    e.stopPropagation();
    setBajando(false);
    setEstado('');
    setMotivo('');
  };

  return (
    <div
      className="flex flex-col rounded-2xl bg-white"
      style={{ padding: '0.875rem 1rem', border: '1.5px solid #E5E7EB', gap: '0.6rem' }}
    >
      {/* Fila principal */}
      <div className="flex items-center justify-between" style={{ gap: '0.75rem' }}>
        {/* Info — clickeable para ver detalle */}
        <button
          className="flex items-center flex-1 min-w-0 text-left"
          style={{ gap: '0.6rem' }}
          onClick={() => navigate(`/animales/${animal.id}`)}
          disabled={guardando}
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
          <div className="min-w-0 flex flex-col" style={{ gap: '0.2rem' }}>
            <div className="flex items-baseline overflow-hidden" style={{ gap: '0.5rem' }}>
              <p className="font-bold truncate flex-shrink-0" style={{ color: 'var(--verde-oscuro)', fontSize: '1.4rem' }}>
                N° {animal.caravana}
              </p>
              {animal.apodo && (
                <p className="font-semibold truncate" style={{ color: '#9CA3AF', fontSize: '1.2rem' }}>{animal.apodo}</p>
              )}
            </div>
            {/* Chips tipo/lote */}
            {(animal.tipo || animal.lote) && (
              <div className="flex flex-wrap items-center" style={{ gap: '0.3rem' }}>
                {animal.tipo && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: '#EBF7F1', color: 'var(--verde-oscuro)' }}>
                    {animal.tipo}
                  </span>
                )}
                {animal.lote && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                    Lote: {animal.lote}
                  </span>
                )}
              </div>
            )}
          </div>
        </button>

        {/* Acciones */}
        {!bajando && (
          <div className="flex items-center flex-shrink-0" style={{ gap: '0.4rem' }}>
            <button
              onClick={handleEditar}
              className="flex items-center justify-center rounded-xl transition-colors hover:bg-green-50"
              style={{ border: '1.5px solid #E5E7EB', color: 'var(--verde-medio)', width: '2.2rem', height: '2.2rem' }}
              title="Editar"
            >
              <Pencil style={{ width: '0.8rem', height: '0.8rem' }} />
            </button>
            <button
              onClick={handleIniciarBaja}
              className="flex items-center justify-center rounded-xl transition-colors hover:bg-orange-50"
              style={{ border: '1.5px solid #E5E7EB', color: '#F59E0B', width: '2.2rem', height: '2.2rem' }}
              title="Dar de baja"
            >
              <XCircle style={{ width: '0.8rem', height: '0.8rem' }} />
            </button>
          </div>
        )}
      </div>

      {/* Panel dar de baja */}
      {bajando && (
        <div className="flex flex-col rounded-xl" style={{ gap: '0.5rem', padding: '0.75rem', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}
          onClick={e => e.stopPropagation()}>
          <p className="text-xs font-bold" style={{ color: '#92400E' }}>Dar de baja al animal</p>
          <div className="flex gap-2">
            <select
              value={estado}
              onChange={e => setEstado(e.target.value)}
              className="flex-1 rounded-lg border bg-white text-sm font-semibold"
              style={{ borderColor: '#D1D5DB', padding: '0.4rem 0.6rem', color: '#374151' }}
            >
              {ESTADOS_BAJA.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <input
            type="text"
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Motivo (opcional)"
            className="w-full rounded-lg border bg-white text-sm"
            style={{ borderColor: '#D1D5DB', padding: '0.4rem 0.6rem', color: '#374151' }}
          />
          <div className="flex gap-2">
            <button
              onClick={handleConfirmar}
              disabled={guardando}
              className="rounded-lg font-semibold transition-colors disabled:opacity-60 flex-1"
              style={{ backgroundColor: '#F59E0B', color: 'white', padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
            >
              {guardando ? 'Guardando...' : 'Confirmar baja'}
            </button>
            <button
              onClick={handleCancelar}
              disabled={guardando}
              className="rounded-lg font-semibold transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#F3F4F6', color: '#6B7280', padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
