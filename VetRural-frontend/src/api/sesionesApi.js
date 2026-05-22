import api from './axios';
import { calcularMetricasDesdeSesion } from '../utils/reporteUtils';

// ── Mapeos frontend → enums del backend ──────────────────────────────────────

const DIENTES_MAP = { '2': 'Dos', '4': 'Cuatro', '6': 'Seis', '8': 'Ocho' };

const SITUACION_MAP = {
  'Preñada':       'Preñada',
  'Perdonada':     'Perdonada',
  'Frigorífico':   'Frigorífico',
  'Apta servicio': 'Apta_Servicio',
};

const PERIODO_MAP = {
  '-3 meses':    'Menos_3_Meses',
  '3 a 6 meses': 'Entre_3_y_6_Meses',
  '+6 meses':    'Mas_6_Meses',
};

const DETERIORO_MAP = {
  'Nulo': 'Nulo', 'Leve': 'Leve', 'Moderado': 'Moderado', 'Severo': 'Severo',
};

const DENTADURA_MAP = {
  'De leche': 'De_Leche', 'Mixta': 'Mixta', 'Permanente': 'Permanente',
};

const VACUNA_MAP = {
  vac_aftosa:      'Aftosa',
  vac_brucelosis:  'Brucelosis',
  vac_carbunco:    'Carbunco',
  vac_clostridial: 'Clostridial',
  vac_ibr:         'IBR_BVD',
  vac_bvd:         'IBR_BVD',
};

// ── POST /api/sesiones ────────────────────────────────────────────────────────
// Crea la sesión (veterinario + anotador + establecimiento) y devuelve { id, ... }
export async function guardarSesion(sesionData) {
  return api.post('/sesiones', sesionData);
}

// ── POST /api/manga/* ─────────────────────────────────────────────────────────
// Registra todos los eventos de los registros usando el sesionId creado.
export async function registrarEventosSesion(sesionId, registros) {
  const llamadas = [];

  for (const registro of registros) {
    const { animal, trabajosEfectivos, form } = registro;
    const bovinoId = animal.id;

    if (trabajosEfectivos.includes('pesaje') && form.peso) {
      llamadas.push(
        api.post('/manga/pesaje', {
          bovinoId,
          sesionId,
          peso: parseFloat(form.peso),
        })
      );
    }

    if (trabajosEfectivos.includes('tacto') && form.tacto_situacion) {
      const payload = {
        bovinoId,
        sesionId,
        situacion: SITUACION_MAP[form.tacto_situacion] ?? form.tacto_situacion,
      };
      if (form.tacto_situacion === 'Preñada' && form.tacto_periodo) {
        payload.periodo = PERIODO_MAP[form.tacto_periodo] ?? form.tacto_periodo;
      }
      llamadas.push(api.post('/manga/tacto', payload));
    }

    if (trabajosEfectivos.includes('boqueo') && form.boqueo_dientes) {
      llamadas.push(
        api.post('/manga/boqueo', {
          bovinoId,
          sesionId,
          dientes:   DIENTES_MAP[String(form.boqueo_dientes)] ?? form.boqueo_dientes,
          deterioro: DETERIORO_MAP[form.boqueo_deterioro]     ?? form.boqueo_deterioro,
          dentadura: DENTADURA_MAP[form.boqueo_dentadura]     ?? form.boqueo_dentadura,
        })
      );
    }

    if (trabajosEfectivos.includes('vacunacion')) {
      const vacunasAplicadas = new Set();
      for (const [campo, enumVal] of Object.entries(VACUNA_MAP)) {
        if (form[campo] && !vacunasAplicadas.has(enumVal)) {
          vacunasAplicadas.add(enumVal);
          llamadas.push(
            api.post('/manga/vacunacion', { bovinoId, sesionId, vacuna: enumVal })
          );
        }
      }
    }
  }

  return Promise.allSettled(llamadas);
}

// ── GET /api/sesiones?establecimientoId=X ────────────────────────────────────
export async function getSesiones(establecimientoId) {
  return api.get('/sesiones', { params: { establecimientoId } });
}

// ── POST /sesiones/calcular-metricas ─────────────────────────────────────────
// Fallback local si el backend no responde.
export async function calcularMetricasApi(registros, trabajos) {
  try {
    const { data } = await api.post('/sesiones/calcular-metricas', { registros, trabajos });
    return data;
  } catch {
    return calcularMetricasDesdeSesion(registros, trabajos);
  }
}
