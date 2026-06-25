import { useState, useEffect } from 'react';
import { useEstablecimiento } from '../context/EstablecimientoContext';
import { useAuth } from '../context/AuthContext';
import { getMiembros, removerMiembro, buscarUsuarioPorEmail } from '../api/usuariosApi';
import { crearInvitacion, getInvitacionesPorEstablecimiento, rechazarInvitacion } from '../api/invitacionesApi';

const ROL_LABEL = {
  veterinario: 'Veterinario',
  productor:   'Productor',
  otros:       'Colaborador',
};

export default function Miembros() {
  const { seleccionado } = useEstablecimiento();
  const { usuario } = useAuth();

  const [miembros,     setMiembros]     = useState([]);
  const [pendientes,   setPendientes]   = useState([]);
  const [email,        setEmail]        = useState('');
  const [errorInvitar, setErrorInvitar] = useState('');
  const [exito,        setExito]        = useState('');

  useEffect(() => {
    if (!seleccionado?.id) return;
    getMiembros(seleccionado.id).then(setMiembros);
    getInvitacionesPorEstablecimiento(seleccionado.id).then(setPendientes);
  }, [seleccionado?.id]);

  const handleInvitar = async (e) => {
    e.preventDefault();
    const emailTrimmed = email.trim().toLowerCase();
    if (!emailTrimmed || !emailTrimmed.includes('@')) {
      setErrorInvitar('Ingresá un email válido.');
      return;
    }

    const invitado = await buscarUsuarioPorEmail(emailTrimmed);
    if (!invitado) {
      setErrorInvitar('No se encontró ningún usuario con ese email.');
      return;
    }

    try {
      await crearInvitacion(seleccionado.id, invitado.id, usuario.id);
      setEmail('');
      setErrorInvitar('');
      setExito(`Invitación enviada a ${invitado.nombre}`);
      setTimeout(() => setExito(''), 4000);
      getInvitacionesPorEstablecimiento(seleccionado.id).then(setPendientes);
    } catch (err) {
      if (err?.response?.status === 409) {
        setErrorInvitar(`${invitado.nombre} ya es miembro o ya tiene una invitación pendiente.`);
      } else {
        setErrorInvitar('No se pudo enviar la invitación. Intentá nuevamente.');
      }
    }
  };

  const handleRemoverMiembro = async (m) => {
    if (!confirm(`¿Quitarle acceso a ${m.nombre}?`)) return;
    try {
      await removerMiembro(seleccionado.id, m.id);
      setMiembros(prev => prev.filter(x => x.id !== m.id));
    } catch {
      setErrorInvitar('No se pudo quitar al miembro.');
    }
  };

  const handleCancelarInvitacion = async (inv) => {
    try {
      await rechazarInvitacion(inv.id);
      setPendientes(prev => prev.filter(x => x.id !== inv.id));
    } catch {
      setErrorInvitar('No se pudo cancelar la invitación.');
    }
  };

  return (
    <div className="flex flex-col flex-1" style={{ minHeight: 0, overflow: 'hidden' }}>

      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

        <h1 className="text-3xl font-bold" style={{ color: 'var(--verde-oscuro)' }}>
          {seleccionado?.nombre ?? 'Establecimiento'}
        </h1>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 className="font-bold mb-4" style={{ color: 'var(--verde-oscuro)', fontSize: '1.05rem' }}>
            Agregar usuario por email
          </h2>
          <form onSubmit={handleInvitar} className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrorInvitar(''); }}
              placeholder="nombre@email.com"
              className="flex-1 rounded-xl border bg-white"
              style={{ borderColor: '#D1D5DB', padding: '0.875rem 1rem', fontSize: '1rem' }}
            />
            <button type="submit"
              className="btn-primary flex-shrink-0"
              style={{ padding: '0.875rem 1.5rem', fontSize: '1rem' }}>
              Agregar
            </button>
          </form>

          {exito && (
            <p className="mt-4 text-sm font-medium" style={{ color: '#065F46' }}>{exito}</p>
          )}
          {errorInvitar && (
            <div className="mt-4 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
              {errorInvitar}
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '0.5rem' }}>
        {miembros.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h2 className="font-bold mb-3" style={{ color: 'var(--verde-oscuro)', fontSize: '1.05rem' }}>
              Miembros activos · {miembros.length}
            </h2>
            <div className="flex flex-col gap-2">
              {miembros.map(m => (
                <div key={m.id}
                  className="bg-white rounded-2xl flex items-center gap-4"
                  style={{ border: '1.5px solid #E5E7EB', padding: '1rem 1.25rem' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                    style={{ backgroundColor: 'var(--verde-medio)', color: 'white', fontSize: '0.95rem' }}>
                    {m.nombre.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: '#111827' }}>{m.nombre}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: '#9CA3AF' }}>{m.email}</p>
                  </div>
                  {ROL_LABEL[m.rol] && (
                    <p className="text-xs flex-shrink-0" style={{ color: '#9CA3AF' }}>{ROL_LABEL[m.rol]}</p>
                  )}
                  {m.id !== usuario?.id && m.rol !== 'productor' && (
                    <button onClick={() => handleRemoverMiembro(m)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-red-50 transition-colors"
                      style={{ border: '1.5px solid #E5E7EB', color: '#EF4444' }}
                      title="Quitar miembro">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {pendientes.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h2 className="font-bold mb-3" style={{ color: 'var(--verde-oscuro)', fontSize: '1.05rem' }}>
              Invitaciones pendientes · {pendientes.length}
            </h2>
            <div className="flex flex-col gap-2">
              {pendientes.map(inv => (
                <div key={inv.id}
                  className="bg-white rounded-2xl flex items-center gap-4"
                  style={{ border: '1.5px solid #E5E7EB', padding: '1rem 1.25rem' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                    style={{ backgroundColor: '#F3F4F6', color: '#9CA3AF', fontSize: '0.95rem' }}>
                    {inv.invitadoNombre?.charAt(0) ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: '#111827' }}>{inv.invitadoNombre}</p>
                  </div>
                  <p className="text-xs flex-shrink-0" style={{ color: '#9CA3AF' }}>Pendiente</p>
                  <button onClick={() => handleCancelarInvitacion(inv)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-red-50 transition-colors"
                    style={{ border: '1.5px solid #E5E7EB', color: '#EF4444' }}
                    title="Cancelar invitación">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
