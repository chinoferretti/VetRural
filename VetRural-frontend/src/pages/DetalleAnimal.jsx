import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAnimalById, getHistorialAnimal } from '../api/animalesApi';
import { formatFecha } from '../utils/formatters';

const TABS = [
  { id: 'generales', label: 'Datos generales' },
  { id: 'clinicos',  label: 'Datos clínicos'  },
];

function Campo({ label, valor }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium" style={{ color: '#9CA3AF' }}>{label}</span>
      <span className="text-base font-semibold" style={{ color: '#111827' }}>{valor || '—'}</span>
    </div>
  );
}

function SeccionClinica({ titulo, icono, children }) {
  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <h3 className="font-bold text-lg mb-5 flex items-center gap-2" style={{ color: 'var(--verde-oscuro)' }}>
        <span>{icono}</span> {titulo}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {children}
      </div>
    </div>
  );
}

export default function DetalleAnimal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [animal,   setAnimal]   = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState(null);
  const [tabActiva, setTabActiva] = useState('generales');

  useEffect(() => {
    setCargando(true);
    setError(null);

    getAnimalById(id)
      .then(bovino => {
        setAnimal(bovino);
        // Carga el historial clínico usando la caravana
        return getHistorialAnimal(bovino.caravana);
      })
      .then(historial => setAnimal(historial))
      .catch(err => {
        if (err.response?.status === 404) setError('Animal no encontrado.');
        else setError('No se pudo cargar el animal.');
      })
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) return <LoadingSpinner texto="Cargando animal..." />;

  if (error || !animal) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <p className="text-6xl">🐄</p>
        <p className="text-xl font-bold" style={{ color: '#374151' }}>{error ?? 'Animal no encontrado'}</p>
        <button onClick={() => navigate('/animales')} className="btn-primary">Volver al listado</button>
      </div>
    );
  }

  const boqueo  = animal.boqueo    || {};
  const tacto   = animal.tacto     || {};
  const vacunas = animal.vacunacion || {};

  return (
    <div className="flex flex-col w-full" style={{ gap: '2rem' }}>

      {/* Header */}
      <div>
        <p className="text-sm font-medium mb-1" style={{ color: '#9CA3AF', fontFamily: 'monospace' }}>
          {animal.caravana}
        </p>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>
          {animal.nombre || animal.caravana}
        </h1>
        <p className="mt-1" style={{ color: '#6B7280' }}>
          {animal.especie} · {animal.raza}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '2px solid #E5E7EB' }}>
        <div className="flex gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id)}
              className="px-6 py-3 font-semibold text-base border-b-2 transition-colors"
              style={tabActiva === tab.id
                ? { borderColor: 'var(--verde-medio)', color: 'var(--verde-medio)', marginBottom: '-2px' }
                : { borderColor: 'transparent', color: '#9CA3AF' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab: Datos generales ── */}
      {tabActiva === 'generales' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-7">
            <Campo label="Identificador (caravana)" valor={animal.caravana} />
            <Campo label="Fecha de nacimiento"      valor={formatFecha(animal.fechaNacimiento)} />
            <Campo label="Sexo"                     valor={animal.sexo} />
            <Campo label="Lote"                     valor={animal.lote} />
            <Campo label="Raza"                     valor={animal.raza} />
            <Campo label="Tipo"                     valor={animal.tipo || '—'} />
          </div>
        </div>
      )}

      {/* ── Tab: Datos clínicos ── */}
      {tabActiva === 'clinicos' && (
        <div className="flex flex-col gap-5">

          <SeccionClinica titulo="Boqueo" icono="🦷">
            <Campo label="Cantidad de dientes" valor={boqueo.cantidadDientes} />
            <Campo label="Deterioro"           valor={boqueo.deterioro} />
            <Campo label="Tipo de dentadura"   valor={boqueo.tipoDentadura} />
          </SeccionClinica>

          <SeccionClinica titulo="Pesaje" icono="⚖️">
            <Campo label="Peso del animal" valor={animal.peso ? `${animal.peso} kg` : null} />
          </SeccionClinica>

          <SeccionClinica titulo="Tacto" icono="🔍">
            <Campo label="Situación" valor={tacto.situacion} />
            <Campo
              label="Período"
              valor={tacto.situacion === 'Preñada' ? (tacto.periodo || '—') : '—'}
            />
          </SeccionClinica>

          <SeccionClinica titulo="Vacunación" icono="💉">
            <Campo label="Aftosa"      valor={vacunas.aftosa      ? formatFecha(vacunas.aftosa)      : null} />
            <Campo label="Brucelosis"  valor={vacunas.brucelosis  ? formatFecha(vacunas.brucelosis)  : null} />
            <Campo label="Carbunco"    valor={vacunas.carbunco    ? formatFecha(vacunas.carbunco)    : null} />
            <Campo label="Clostridial" valor={vacunas.clostridial ? formatFecha(vacunas.clostridial) : null} />
            <Campo label="IBR"         valor={vacunas.ibr         ? formatFecha(vacunas.ibr)         : null} />
            <Campo label="BVD"         valor={vacunas.bvd         ? formatFecha(vacunas.bvd)         : null} />
          </SeccionClinica>

        </div>
      )}

    </div>
  );
}
