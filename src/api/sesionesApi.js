import api from './axios';
import { calcularMetricasDesdeSesion } from '../utils/reporteUtils';

// ── POST /sesiones/calcular-metricas ─────────────────────────────────────────
// El backend recibe los registros completos de la sesión y devuelve las métricas
// calculadas (ADPV, distribuciones, outliers, etc.). Si no hay conexión, el
// cálculo se realiza localmente como fallback.
// El backend calcula el ADPV por bovino consultando la fecha del último pesaje en la BDD.
// El fallback local usa el historial del animal para estimar los días entre pesajes.
export async function calcularMetricasApi(registros, trabajos) {
  try {
    const { data } = await api.post('/sesiones/calcular-metricas', { registros, trabajos });
    return data;
  } catch {
    return calcularMetricasDesdeSesion(registros, trabajos);
  }
}

// ── POST /sesiones ────────────────────────────────────────────────────────────
// Guarda la sesión completa. El backend persiste en la BDD del establecimiento
// y retorna la sesión con id asignado y métricas pre-calculadas.
export async function guardarSesion(sesionData) {
  return api.post('/sesiones', sesionData);
}

// ── GET /sesiones ─────────────────────────────────────────────────────────────
// Retorna solo las sesiones del establecimiento activo (multi-tenant).
export async function getSesiones(establecimientoId) {
  return api.get('/sesiones', { params: { establecimientoId } });
}
