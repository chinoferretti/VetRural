import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAnimalById } from '../api/animalesApi';
import { formatFecha } from '../utils/formatters';
import api from '../api/axios';

const TABS = [
  { id: 'generales', label: 'Datos generales' },
  { id: 'clinicos',  label: 'Datos clínicos'  },
];

const TIPOS = ['Novillo', 'Novillito', 'Ternero', 'Vaquillona', 'Vaca', 'Torito', 'Toro'];

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
  const [animal, setAnimal]       = useState(null);
  const [eventos, setEventos]     = useState([]);  // ← NUEVO
  const [cargando, setCargando]   = useState(true);
  const [tabActiva, setTabActiva] = useState('generales');

useEffect(() => {
  Promise.all([
    getAnimalById(id),
    api.get(`/manga/${id}/ultimo-pesaje`).catch(() => ({ data: null })),
    api.get(`/manga/${id}/ultimo-tacto`).catch(() => ({ data: null })),
    api.get(`/manga/${id}/ultimo-boqueo`).catch(() => ({ data: null })),
    api.get(`/manga/${id}/vacunaciones`).catch(() => ({ data: [] })),
  ])
    .then(([animalData, pesajeRes, tactoRes, boqueoRes, vacunasRes]) => {
      setAnimal(animalData);
      setEventos({
        pesaje:   pesajeRes.data,
        tacto:    tactoRes.data,
        boqueo:   boqueoRes.data,
        vacunas:  vacunasRes.data || [],
      });
      setCargando(false);
    })
    .catch(() => { setAnimal(null); setCargando(false); });
}, [id]);

  if (cargando) return <LoadingSpinner texto="Cargando animal..." />;

  if (!animal) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <p className="text-6xl">🐄</p>
        <p className="text-xl font-bold" style={{ color: '#374151' }}>Animal no encontrado</p>
        <button onClick={() => navigate('/animales')} className="btn-primary">Volver al listado</button>
      </div>
    );
  }

  // Datos clínicos del animal (con fallback a vacío si no existen aún)
  const ultimoPesaje = eventos.pesaje || {};
  const ultimoTacto  = eventos.tacto  || {};
  const ultimoBoqueo = eventos.boqueo || {};
  const vacunas      = eventos.vacunas || [];

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
            <Campo label="Fecha de nacimiento" valor={formatFecha(animal.nacimiento)} />
            <Campo label="Sexo"                     valor={animal.sexo} />
            <Campo label="Lote"                     valor={animal.lote} />
            <Campo label="Raza"                     valor={animal.raza} />
            <Campo label="Tipo"                valor={animal.tipo || '—'} />
          </div>
        </div>
      )}

      {/* ── Tab: Datos clínicos ── */}
      {tabActiva === 'clinicos' && (
        <div className="flex flex-col gap-5">

          {/* Boqueo */}
          <SeccionClinica titulo="Boqueo" icono="🦷">
            <Campo label="Cantidad de dientes" valor={ultimoBoqueo.dientes} />
            <Campo label="Deterioro"           valor={ultimoBoqueo.deterioro} />
            <Campo label="Tipo de dentadura"   valor={ultimoBoqueo.dentadura} />
          </SeccionClinica>

          <SeccionClinica titulo="Pesaje" icono="⚖️">
            <Campo label="Peso del animal" valor={ultimoPesaje.peso ? `${ultimoPesaje.peso} kg` : null} />
          </SeccionClinica>

          <SeccionClinica titulo="Tacto" icono="🔍">
            <Campo label="Situación" valor={ultimoTacto.situacion} />
            <Campo label="Período"   valor={ultimoTacto.situacion === 'Preñada' ? (ultimoTacto.periodo || '—') : '—'} />
          </SeccionClinica>

          <SeccionClinica titulo="Vacunación" icono="💉">
            {[
              { value: 'Aftosa',      label: 'Aftosa' },
              { value: 'Brucelosis',  label: 'Brucelosis' },
              { value: 'Carbunco',    label: 'Carbunco' },
              { value: 'Clostridial', label: 'Clostridial' },
              { value: 'IBR',         label: 'IBR' },
              { value: 'BVD',         label: 'BVD' },
            ].map(({ value, label }) => {
              const vac = vacunas.find(v => v.vacuna === value);
              return <Campo key={value} label={label} valor={vac ? formatFecha(vac.fechaHora) : null} />;
            })}
          </SeccionClinica>

        </div>
      )}

    </div>
  );
}
