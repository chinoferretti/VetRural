import api from './axios';

// ── Tablas de conversión enum backend ↔ display frontend ─────────────────────

const DIENTES_A_NUM      = { Dos: 2, Cuatro: 4, Seis: 6, Ocho: 8 };
const DENTADURA_A_DISPLAY = { De_Leche: 'De leche', Mixta: 'Mixta', Permanente: 'Permanente' };
const DETERIORO_A_DISPLAY = { Nulo: 'Nulo', Leve: 'Leve', Moderado: 'Moderado', Severo: 'Severo' };
const SITUACION_A_DISPLAY = {
  Preñada: 'Preñada', Perdonada: 'Perdonada',
  Frigorífico: 'Frigorífico', Apta_Servicio: 'Apta servicio',
};
const PERIODO_A_DISPLAY = {
  Menos_3_Meses: '-3 meses', Entre_3_y_6_Meses: '3 a 6 meses', Mas_6_Meses: '+6 meses',
};

// Display frontend → enum backend (para enviar al API)
const SITUACION_A_ENUM  = { 'Preñada': 'Preñada', 'Perdonada': 'Perdonada', 'Frigorífico': 'Frigorífico', 'Apta servicio': 'Apta_Servicio' };
const PERIODO_A_ENUM    = { '-3 meses': 'Menos_3_Meses', '3 a 6 meses': 'Entre_3_y_6_Meses', '+6 meses': 'Mas_6_Meses' };
const DENTADURA_A_ENUM  = { 'De leche': 'De_Leche', 'Mixta': 'Mixta', 'Permanente': 'Permanente' };
const DETERIORO_A_ENUM  = { 'Nulo': 'Nulo', 'Leve': 'Leve', 'Moderado': 'Moderado', 'Severo': 'Severo' };
const DIENTES_A_ENUM    = { '2': 'Dos', '4': 'Cuatro', '6': 'Seis', '8': 'Ocho' };

// ── Adaptadores backend → forma esperada por el frontend ─────────────────────

function adaptarBovino(b) {
  return {
    ...b,
    especie: 'Bovino',
    nombre: null,                       // los bovinos no tienen nombre, se muestra la caravana
    fechaNacimiento: b.nacimiento ?? '', // el front usa fechaNacimiento, el back envía nacimiento
  };
}

function adaptarHistorial({ bovino, boqueo, pesaje, tacto, vacunaciones }) {
  const vacMap = {};
  (vacunaciones ?? []).forEach(v => {
    vacMap[v.vacuna] = v.fechaHora?.slice(0, 10) ?? null;
  });

  return {
    ...adaptarBovino(bovino),
    peso: pesaje?.peso ?? null,
    boqueo: boqueo ? {
      cantidadDientes: DIENTES_A_NUM[boqueo.dientes] ?? null,
      deterioro:       DETERIORO_A_DISPLAY[boqueo.deterioro] ?? boqueo.deterioro,
      tipoDentadura:   DENTADURA_A_DISPLAY[boqueo.dentadura] ?? boqueo.dentadura,
    } : null,
    tacto: tacto ? {
      situacion: SITUACION_A_DISPLAY[tacto.situacion] ?? tacto.situacion,
      periodo:   PERIODO_A_DISPLAY[tacto.periodo]     ?? tacto.periodo,
    } : null,
    vacunacion: {
      aftosa:      vacMap['Aftosa']      ?? null,
      brucelosis:  vacMap['Brucelosis']  ?? null,
      carbunco:    vacMap['Carbunco']    ?? null,
      clostridial: vacMap['Clostridial'] ?? null,
      ibr:         vacMap['IBR_BVD']     ?? null,
      bvd:         vacMap['IBR_BVD']     ?? null,
    },
  };
}

// ── Adaptador frontend form → body para el backend ───────────────────────────

function formAPayload(form) {
  return {
    sexo:      form.sexo                  || null,
    nacimiento: form.fechaNacimiento       || null,
    raza:      form.raza                  || null,
    tipo:      form.tipo                  || null,
    lote:      form.lote                  || null,
    obs:       form.observaciones         || null,
  };
}

// ── GET /bovinos  o  GET /establecimientos/:id/bovinos ───────────────────────
export const getAnimales = async (establecimientoId = null) => {
  const url = establecimientoId
    ? `/establecimientos/${establecimientoId}/bovinos`
    : '/bovinos';
  const { data } = await api.get(url);
  return data.map(adaptarBovino);
};

// ── GET /bovinos/:id ─────────────────────────────────────────────────────────
export const getAnimalById = async (id) => {
  const { data } = await api.get(`/bovinos/${id}`);
  return adaptarBovino(data);
};

// ── GET /bovinos/buscar?caravana=X ───────────────────────────────────────────
export const buscarAnimalPorCaravana = async (caravana) => {
  const { data } = await api.get('/bovinos/buscar', { params: { caravana } });
  return adaptarBovino(data);
};

// ── GET /bovinos/:caravana/historial ─────────────────────────────────────────
export const getHistorialAnimal = async (caravana) => {
  const { data } = await api.get(`/bovinos/${caravana}/historial`);
  return adaptarHistorial(data);
};

// ── POST /bovinos  (+  PUT /bovinos/:id/lote si se eligió lote) ──────────────
export const crearAnimal = async (form, establecimientoId) => {
  const { data } = await api.post('/bovinos', {
    caravana:         form.caravana.trim().toUpperCase(),
    establecimientoId,
    ...formAPayload(form),
  });

  if (form.lote) {
    await api.put(`/bovinos/${data.id}/lote`, null, { params: { lote: form.lote } });
    data.lote = form.lote;
  }

  return adaptarBovino(data);
};

// ── POST /bovinos/rapido ─────────────────────────────────────────────────────
// Se llama desde el modal de SesionAnimal cuando el animal no está registrado.
export const crearAnimalRapido = async ({ caravana, sexo, establecimientoId }) => {
  const { data } = await api.post('/bovinos/rapido', {
    caravana: caravana.trim().toUpperCase(),
    establecimientoId,
    sexo,
  });
  return adaptarBovino(data);
};

// ── PUT /bovinos/:id ─────────────────────────────────────────────────────────
export const actualizarAnimal = async (id, form) => {
  const { data } = await api.put(`/bovinos/${id}`, formAPayload(form));
  return adaptarBovino(data);
};

// ── DELETE /bovinos/:id ──────────────────────────────────────────────────────
export const eliminarAnimal = async (id) => {
  await api.delete(`/bovinos/${id}`);
};

// Exporta las tablas de mapeo para que otros módulos (sesionesApi) no dupliquen lógica
export { SITUACION_A_ENUM, PERIODO_A_ENUM, DENTADURA_A_ENUM, DETERIORO_A_ENUM, DIENTES_A_ENUM };
