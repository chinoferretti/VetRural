const DENTADURA_LABELS = { 'De_Leche': 'De leche', 'Mixta': 'Mixta', 'Permanente': 'Permanente' };

// Estimación de edad a partir de dientes + dentadura + deterioro
export function estimarEdadDesdeBoqueo(dientes, dentadura, deterioro) {
  if (!dientes) return null;

  if (dentadura === 'De_Leche')
    return { label: '< 1.5 años (de leche)', meses: 12 };

  if (dentadura === 'Mixta') {
    const map = {
      Dos:    { label: '1.5–2 años (2 d., mixta)',   meses: 21 },
      Cuatro: { label: '2.5–3 años (4 d., mixta)',   meses: 33 },
      Seis:   { label: '3.5–4 años (6 d., mixta)',   meses: 45 },
      Ocho:   { label: '4–5 años (8 d., mixta)',     meses: 54 },
    };
    return map[dientes] ?? null;
  }

  if (dentadura === 'Permanente') {
    if (dientes === 'Dos')    return { label: '~2 años (2 perm.)',  meses: 24 };
    if (dientes === 'Cuatro') return { label: '~3 años (4 perm.)',  meses: 36 };
    if (dientes === 'Seis')   return { label: '~4 años (6 perm.)',  meses: 48 };
    const porDeterioro = {
      Nulo:     { label: '5–6 años (boca llena)',        meses: 66 },
      Leve:     { label: '6–7 años (desgaste leve)',     meses: 78 },
      Moderado: { label: '7–9 años (desgaste mod.)',     meses: 96 },
      Severo:   { label: '≥ 10 años (desgaste severo)',  meses: 120 },
    };
    return (deterioro && porDeterioro[deterioro]) ?? { label: '≥ 5 años (boca llena)', meses: 66 };
  }

  // dentadura no registrada: rango por dientes solo
  const fallback = {
    Dos:    { label: '1.5–2 años (2 dientes)',   meses: 21 },
    Cuatro: { label: '2.5–3 años (4 dientes)',   meses: 33 },
    Seis:   { label: '3.5–4 años (6 dientes)',   meses: 45 },
    Ocho:   { label: '> 4.5 años (8 dientes)',   meses: 60 },
  };
  return fallback[dientes] ?? null;
}

// ── CSS bar helper ─────────────────────────────────────────────────────────────

function barraCSS(pct, color = '#2d7a4f') {
  const w = Math.max(0, Math.min(100, pct));
  return `<div style="background:#d4edda;border-radius:4px;height:13px;overflow:hidden;margin-top:3px">
    <div style="background:${color};height:100%;width:${w}%;border-radius:4px"></div>
  </div>`;
}

// ── HTML report generator ─────────────────────────────────────────────────────

const VACUNAS_LABELS = {
  vac_aftosa: 'Aftosa', vac_brucelosis: 'Brucelosis', vac_carbunco: 'Carbunco',
  vac_clostridial: 'Clostridial', vac_ibr: 'IBR', vac_bvd: 'BVD',
};

const DIST_LABELS = { cabeza: '< 3 meses', cuerpo: '3–6 meses', cola: '> 6 meses' };

export function generarHTMLReporte({
  fecha, establecimiento, veterinario, anotador,
  totalAnimales, trabajosDisplay, metricas,
  animalesAtendidos,
}) {
  const m = metricas || {};

  const h2Style = 'color:#1B4332;font-size:15px;font-weight:bold;border-left:3px solid #2d7a4f;padding-left:8px;margin-bottom:12px';
  const SEP = '<hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>';

  const badges = trabajosDisplay.map(t =>
    `<span style="display:inline-block;background:#ebf7f1;color:#1B4332;border:1px solid #C8E6D8;border-radius:6px;padding:3px 10px;margin:2px;font-size:12px">${t}</span>`
  ).join('');

  // ── Sección Pesaje ──────────────────────────────────────────────────────────
  let secPesaje = '';
  if (m.pesaje) {
    const p = m.pesaje;
    secPesaje = `<section>
      <h2 style="${h2Style}">Pesaje</h2>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px">
        ${[['Promedio', `${p.promedio} kg`], ['Mínimo', `${p.minimo} kg`], ['Máximo', `${p.maximo} kg`], ['Desvío std', `± ${p.desviacionEstandar} kg`]]
          .map(([l, v]) => `<div style="background:#f8f8f8;border-radius:8px;padding:10px;text-align:center;border:1px solid #e5e5e5">
            <div style="font-size:18px;font-weight:bold;color:#1B4332">${v}</div>
            <div style="font-size:11px;color:#777;margin-top:2px">${l}</div>
          </div>`).join('')}
      </div>
      <div style="background:#f8f8f8;border-radius:8px;padding:12px">
        ${p.adpvPromedio !== null && p.adpvPromedio !== undefined ? `<div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;border-bottom:1px solid #eee">
          <span>ADPV promedio</span><strong style="color:#2d7a4f">${p.adpvPromedio} kg/día</strong>
        </div>` : ''}
        ${p.proyeccionVenta ? `<div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0">
          <span>Proyección fecha de venta</span><strong>${p.proyeccionVenta}</strong>
        </div>` : ''}
      </div>
    </section>`;
  }

  // ── Sección Tacto ───────────────────────────────────────────────────────────
  let secTacto = '';
  if (m.tacto && m.tacto.totalTactadas > 0) {
    const t = m.tacto;
    const situaciones = [
      ['Preñadas',      t.prenadas],
      ['Perdonadas',    t.perdonadas],
      ['Frigorífico',   t.frigorifico],
      ['Apta servicio', t.aptaServicio],
    ].filter(([, v]) => v > 0);

    secTacto = `<section>
      <h2 style="${h2Style}">Tacto</h2>
      <div style="background:#f8f8f8;border-radius:10px;padding:16px;text-align:center;margin-bottom:12px">
        <div style="font-size:42px;font-weight:900;color:#1B4332">${t.porcentajePreniez}%</div>
        <div style="font-size:12px;color:#666;margin-top:2px">Porcentaje de preñez (${t.prenadas}/${t.totalTactadas})</div>
        ${barraCSS(t.porcentajePreniez)}
      </div>
      <div style="background:#f8f8f8;border-radius:8px;padding:12px;margin-bottom:12px">
        ${situaciones.map(([s, v]) => `<div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;border-bottom:1px solid #eee">
          <span>${s}</span><strong>${v} (${t.totalTactadas > 0 ? Math.round(v / t.totalTactadas * 100) : 0}%)</strong>
        </div>`).join('')}
      </div>
      ${t.prenadas > 0 && t.distribucion ? `<div style="background:#f8f8f8;border-radius:8px;padding:12px">
        <div style="font-size:12px;font-weight:bold;color:#1B4332;margin-bottom:8px">Distribución por período</div>
        ${Object.entries(DIST_LABELS).map(([k, label]) => `<div style="margin:6px 0">
          <div style="display:flex;justify-content:space-between;font-size:12px">
            <span>${label}</span><span><strong>${t.distribucion[k]}</strong> (${t.prenadas > 0 ? Math.round(t.distribucion[k] / t.prenadas * 100) : 0}%)</span>
          </div>
          ${barraCSS(t.prenadas > 0 ? (t.distribucion[k] / t.prenadas) * 100 : 0)}
        </div>`).join('')}
      </div>` : ''}
    </section>`;
  }

  // ── Sección Boqueo ──────────────────────────────────────────────────────────
  let secBoqueo = '';
  if (m.boqueo) {
    const b = m.boqueo;
    const totalB = b.conteos ? Object.values(b.conteos).reduce((a, c) => a + c, 0) : 0;
    if (totalB > 0) {
      secBoqueo = `<section>
        <h2 style="${h2Style}">Boqueo</h2>
        <div style="background:#f8f8f8;border-radius:8px;padding:12px;margin-bottom:12px">
          <div style="font-size:12px;font-weight:bold;color:#1B4332;margin-bottom:8px">Distribución dentaria</div>
          ${Object.entries(b.conteos).map(([k, v]) => `<div style="margin:6px 0">
            <div style="display:flex;justify-content:space-between;font-size:12px">
              <span>${DENTADURA_LABELS[k] || k}</span><span><strong>${v}</strong> (${Math.round(v / totalB * 100)}%)</span>
            </div>
            ${barraCSS((v / totalB) * 100)}
          </div>`).join('')}
        </div>
        ${b.deterioro && Object.values(b.deterioro).some(v => v > 0) ? `<div style="background:#f8f8f8;border-radius:8px;padding:12px;margin-bottom:12px">
          <div style="font-size:12px;font-weight:bold;color:#1B4332;margin-bottom:8px">Deterioro dental</div>
          ${Object.entries(b.deterioro).filter(([, v]) => v > 0).map(([k, v]) => `<div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;border-bottom:1px solid #eee">
            <span>${k}</span><strong>${v}</strong>
          </div>`).join('')}
        </div>` : ''}
        ${b.tasaReposicion > 0 ? `<div style="background:#fff3cd;border-radius:8px;padding:12px;border:1px solid #fde68a">
          <p style="font-size:13px;font-weight:bold;color:#856404">Tasa de reposición: ${b.tasaReposicion}% — ${b.conteos['Permanente'] || 0} ${(b.conteos['Permanente'] || 0) !== 1 ? 'animales' : 'animal'} con dentadura permanente</p>
        </div>` : ''}
      </section>`;
    }
  }

  // ── Sección Vacunación ──────────────────────────────────────────────────────
  let secVacunacion = '';
  if (m.vacunacion && m.vacunacion.totalAnimales > 0) {
    const v = m.vacunacion;
    const cobVals = v.cobertura ? Object.values(v.cobertura) : [];
    const cobProm = cobVals.length > 0 ? Math.round(cobVals.reduce((a, b) => a + b, 0) / cobVals.length) : 0;

    secVacunacion = `<section>
      <h2 style="${h2Style}">Vacunación</h2>
      <div style="display:flex;gap:10px;margin-bottom:12px">
        <div style="background:#f8f8f8;border-radius:8px;padding:12px;text-align:center;flex:1">
          <div style="font-size:28px;font-weight:900;color:#1B4332">${cobProm}%</div>
          <div style="font-size:11px;color:#777">Cobertura promedio</div>
        </div>
        <div style="background:#f8f8f8;border-radius:8px;padding:12px;text-align:center;flex:1">
          <div style="font-size:28px;font-weight:900;color:#1B4332">${v.totalAnimales}</div>
          <div style="font-size:11px;color:#777">Animales vacunados</div>
        </div>
      </div>
      <div style="background:#f8f8f8;border-radius:8px;padding:12px">
        ${Object.entries(VACUNAS_LABELS).map(([c, label]) => `<div style="margin:6px 0">
          <div style="display:flex;justify-content:space-between;font-size:12px">
            <span>${label}</span><span><strong>${v.cobertura[c]}%</strong></span>
          </div>
          ${barraCSS(v.cobertura[c])}
        </div>`).join('')}
      </div>
    </section>`;
  }

  // ── Sección Outliers ────────────────────────────────────────────────────────
  let secOutliers = '';
  if (m.outliers && m.outliers.length > 0) {
    secOutliers = `<section>
      <h2 style="color:#c0392b;font-size:15px;font-weight:bold;border-left:3px solid #EF4444;padding-left:8px;margin-bottom:12px">Animales fuera de norma</h2>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px">
        ${m.outliers.map(o => `<div style="padding:6px 0;border-bottom:1px solid #fecaca">
          <span style="font-family:monospace;font-size:12px;background:#fee2e2;color:#991B1B;padding:1px 6px;border-radius:4px">${o.caravana}</span>
          <span style="font-size:12px;margin-left:6px;font-weight:600">${o.nombre}</span>
          <p style="font-size:11px;color:#c0392b;margin:2px 0 0">${o.motivo}</p>
        </div>`).join('')}
      </div>
    </section>`;
  }

  // ── Sección Animales atendidos (historial) ──────────────────────────────────
  let secAnimales = '';
  if (animalesAtendidos && animalesAtendidos.length > 0) {
    const lista = animalesAtendidos.map(a =>
      `<span style="font-family:monospace;font-size:13px;background:#f3f4f6;border-radius:4px;padding:2px 8px;margin:2px;display:inline-block">${a}</span>`
    ).join(' ');
    secAnimales = `<section>
      <h2 style="${h2Style}">Animales atendidos</h2>
      <div style="background:#f8f8f8;border-radius:8px;padding:12px">${lista}</div>
    </section>`;
  }

  const secciones = [secPesaje, secTacto, secBoqueo, secVacunacion, secOutliers, secAnimales].filter(Boolean);

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <title>${establecimiento ? establecimiento.replace(/\s+/g,'_') : 'reporte'}_${new Date().toISOString().slice(0,10)}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;color:#111;background:#fff}
    .page{max-width:740px;margin:36px auto;padding:24px}
    section{margin:20px 0}
    @media print{body{margin:0}.page{margin:0;padding:16px}section{page-break-inside:avoid}}
  </style>
  </head><body><div class="page">

  <div style="background:#f0f7f3;border-radius:10px;padding:16px 20px;margin-bottom:20px">
    <div style="font-size:20px;font-weight:900;color:#1B4332;margin-bottom:12px">VetRural — Reporte de Sesión</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 24px">
      <div><span style="color:#666;font-size:12px">Fecha</span><div style="font-weight:bold;font-size:13px">${fecha}</div></div>
      <div><span style="color:#666;font-size:12px">Establecimiento</span><div style="font-weight:bold;font-size:13px">${establecimiento || '—'}</div></div>
      <div><span style="color:#666;font-size:12px">Veterinario</span><div style="font-weight:bold;font-size:13px">${veterinario}</div></div>
      <div><span style="color:#666;font-size:12px">Anotador</span><div style="font-weight:bold;font-size:13px">${anotador || '—'}</div></div>
    </div>
  </div>

  <div style="text-align:center;padding:20px;background:#f8fffe;border:2px solid #C8E6D8;border-radius:12px;margin-bottom:20px">
    <div style="font-size:56px;font-weight:900;color:#1B4332;line-height:1">${totalAnimales}</div>
    <p style="color:#555;font-size:14px;margin:4px 0 10px">${totalAnimales === 1 ? 'animal procesado' : 'animales procesados'}</p>
    <div>${badges}</div>
  </div>

  ${secciones.join(SEP)}

  </div><script>window.onload=()=>window.print();</script></body></html>`;
}

// ── Nombre de archivo PDF normalizado ────────────────────────────────────────

export function nombreArchivoPDF(establecimiento, fechaISO) {
  const base = (establecimiento || 'reporte')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_').toLowerCase();
  return `${base}_${fechaISO || new Date().toISOString().slice(0, 10)}.pdf`;
}

// ── Abrir HTML en ventana nueva con auto-print ────────────────────────────────

export function abrirEImprimir(htmlContent) {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}

// ── Compartir o abrir como PDF ────────────────────────────────────────────────

export async function compartirPDF(htmlContent, nombreArchivo, titulo) {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  if (navigator.share) {
    const file = new File([blob], nombreArchivo, { type: 'application/pdf' });
    const canFiles = navigator.canShare?.({ files: [file] });
    try {
      await navigator.share(canFiles ? { title: titulo, files: [file] } : { title: titulo, url: URL.createObjectURL(blob) });
      return;
    } catch (e) {
      if (e.name === 'AbortError') return;
    }
  }
  abrirEImprimir(htmlContent);
}

// ── Reporte de métricas del establecimiento (PDF) ────────────────────────────

const VACUNAS_LABELS_M = {
  Aftosa: 'Aftosa', Brucelosis: 'Brucelosis', Carbunco: 'Carbunco',
  Clostridial: 'Clostridial', IBR: 'IBR', BVD: 'BVD',
};
const TACTO_LABELS_M = {
  Preñada: 'Preñada', Perdonada: 'Perdonada', 'Frigorífico': 'Frigorífico',
  Apta_Servicio: 'Apta servicio', No_Aplica: 'No aplica',
};
const TIPOS_ORDEN_M = ['Ternera','Vaquillona','Vaca','Ternero','Novillito','Novillo','Torito','Toro'];
const DIENTES_M = { Dos: '2 dientes · 1.5–2 a.', Cuatro: '4 dientes · 2.5–3 a.', Seis: '6 dientes · 3.5–4 a.', Ocho: '8 dientes · >4.5 a.' };

function fila(label, value) {
  return `<div style="display:flex;justify-content:space-between;font-size:13px;padding:5px 0;border-bottom:1px solid #f0f0f0">
    <span style="color:#555">${label}</span><strong style="color:#1B4332">${value}</strong>
  </div>`;
}

function kpi(label, value, sub) {
  return `<div style="background:#f8fffe;border:1px solid #C8E6D8;border-radius:10px;padding:12px;text-align:center">
    <div style="font-size:26px;font-weight:900;color:#1B4332;line-height:1.1">${value}</div>
    <div style="font-size:11px;color:#2E7D57;font-weight:600;margin-top:2px">${label}</div>
    ${sub ? `<div style="font-size:10px;color:#9CA3AF;margin-top:1px">${sub}</div>` : ''}
  </div>`;
}

export function generarHTMLMetricas({ seleccionado, metricas, sesion, sexo, lote }) {
  const nombreEst   = seleccionado?.nombre || 'Establecimiento';
  const fechaHoy    = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  const filtrosText = [sexo !== 'Todos' ? `Sexo: ${sexo}` : '', lote !== 'Todos' ? `Lote: ${lote}` : ''].filter(Boolean).join(' · ') || 'Sin filtros';

  const H2 = 'color:#1B4332;font-size:15px;font-weight:bold;border-left:3px solid #2E7D57;padding-left:8px;margin:0 0 12px';
  const SEP = '<hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>';
  const m   = metricas || {};

  // ── Sesiones ────────────────────────────────────────────────────────────────
  const secSesiones = sesion && sesion.totalSesiones > 0 ? `
    <section>
      <h2 style="${H2}">Actividad de sesiones</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px">
        ${kpi('Sesiones', sesion.totalSesiones)}
        ${kpi('Animales atendidos', sesion.totalAtendidos, 'total acumulado')}
        ${sesion.adpvPromedio !== null && sesion.adpvPromedio !== undefined ? kpi('ADPV promedio', `${sesion.adpvPromedio} kg/d`, 'entre sesiones con pesaje') : ''}
      </div>
      ${sesion.trabajosChart?.length > 0 ? `
        <div style="background:#f8f8f8;border-radius:8px;padding:12px">
          <div style="font-size:12px;font-weight:bold;color:#1B4332;margin-bottom:8px">Trabajos más realizados</div>
          ${sesion.trabajosChart.map(t => `<div style="margin:5px 0">
            <div style="display:flex;justify-content:space-between;font-size:12px">
              <span>${t.trabajo}</span><strong>${t.cantidad} sesión${t.cantidad !== 1 ? 'es' : ''}</strong>
            </div>
            ${barraCSS(sesion.totalSesiones > 0 ? (t.cantidad / sesion.totalSesiones) * 100 : 0)}
          </div>`).join('')}
        </div>` : ''}
    </section>` : '';

  // ── Rodeo ───────────────────────────────────────────────────────────────────
  const secRodeo = m.totalBovinos > 0 ? `
    <section>
      <h2 style="${H2}">Estado del rodeo · ${filtrosText}</h2>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:14px">
        ${kpi('Total animales', m.totalBovinos, `${m.hembras} hembras · ${m.machos} machos`)}
        ${kpi('Peso promedio', m.pesoPromedio ? `${m.pesoPromedio} kg` : '—', m.conPeso > 0 ? `${m.conPeso} pesados` : 'Sin pesajes')}
        ${kpi('Edad promedio', m.edadPromedioMeses != null ? (Math.floor(m.edadPromedioMeses/12) + ' a. ' + (m.edadPromedioMeses%12) + ' m.') : '—')}
        ${m.totalTactadas > 0 ? kpi('Hembras tactadas', m.totalTactadas, `de ${m.hembras} hembras`) : ''}
      </div>
    </section>` : '';

  // ── Preñez ──────────────────────────────────────────────────────────────────
  const secPrenez = m.hembras > 0 && m.totalTactadas > 0 ? `
    <section>
      <h2 style="${H2}">Preñez</h2>
      <div style="background:#f0f7f3;border-radius:10px;padding:16px;margin-bottom:12px;text-align:center">
        <div style="font-size:42px;font-weight:900;color:#1B4332">${m.porcentajePrenez}%</div>
        <div style="font-size:12px;color:#555;margin-top:2px">Preñadas sobre tactadas · ${m.prenadas}/${m.totalTactadas}</div>
        ${barraCSS(m.porcentajePrenez)}
      </div>
      <div style="background:#f8f8f8;border-radius:8px;padding:12px">
        ${fila('Preñadas', `${m.prenadas} (${m.porcentajePrenez}%)`)}
        ${fila('No preñadas', `${m.totalTactadas - m.prenadas} (${100 - m.porcentajePrenez}%)`)}
        ${fila('Total hembras', m.hembras)}
      </div>
    </section>` : '';

  // ── Composición ─────────────────────────────────────────────────────────────
  let secComposicion = '';
  if (m.distribucionTipo && Object.keys(m.distribucionTipo).length > 0) {
    const total = Object.values(m.distribucionTipo).reduce((a, b) => a + b, 0);
    const entradas = TIPOS_ORDEN_M.filter(t => m.distribucionTipo[t]).concat(
      Object.keys(m.distribucionTipo).filter(t => !TIPOS_ORDEN_M.includes(t))
    );
    secComposicion = `<section>
      <h2 style="${H2}">Composición del rodeo</h2>
      <div style="background:#f8f8f8;border-radius:8px;padding:12px">
        ${entradas.map(t => {
          const label = (!t || t.includes('_')) ? 'No especificado' : t;
          return `<div style="margin:6px 0">
            <div style="display:flex;justify-content:space-between;font-size:12px">
              <span>${label}</span><span><strong>${m.distribucionTipo[t]}</strong> (${Math.round(m.distribucionTipo[t]/total*100)}%)</span>
            </div>
            ${barraCSS((m.distribucionTipo[t]/total)*100)}
          </div>`;
        }).join('')}
      </div>
    </section>`;
  }

  // ── Etaria ──────────────────────────────────────────────────────────────────
  let secEtaria = '';
  if (m.distribucionDientes && Object.keys(m.distribucionDientes).length > 0) {
    const total = Object.values(m.distribucionDientes).reduce((a, b) => a + b, 0);
    secEtaria = `<section>
      <h2 style="${H2}">Distribución etaria por boqueo</h2>
      <p style="font-size:12px;color:#9CA3AF;margin-bottom:10px">Animales con boqueo registrado · total: ${total}</p>
      <div style="background:#f8f8f8;border-radius:8px;padding:12px">
        ${['Dos','Cuatro','Seis','Ocho'].filter(k => m.distribucionDientes[k]).map(k => `<div style="margin:6px 0">
          <div style="display:flex;justify-content:space-between;font-size:12px">
            <span>${DIENTES_M[k] || k}</span><span><strong>${m.distribucionDientes[k]}</strong> (${Math.round(m.distribucionDientes[k]/total*100)}%)</span>
          </div>
          ${barraCSS((m.distribucionDientes[k]/total)*100)}
        </div>`).join('')}
      </div>
    </section>`;
  }

  // ── Tacto ───────────────────────────────────────────────────────────────────
  let secTacto = '';
  if (m.distribucionTacto && Object.keys(m.distribucionTacto).length > 0) {
    const total = Object.values(m.distribucionTacto).reduce((a, b) => a + b, 0);
    secTacto = `<section>
      <h2 style="${H2}">Situación reproductiva</h2>
      <p style="font-size:12px;color:#9CA3AF;margin-bottom:10px">Hembras con tacto registrado · total: ${total}</p>
      <div style="background:#f8f8f8;border-radius:8px;padding:12px">
        ${Object.entries(m.distribucionTacto).map(([k, v]) => `<div style="margin:6px 0">
          <div style="display:flex;justify-content:space-between;font-size:12px">
            <span>${TACTO_LABELS_M[k] || k.replace(/_/g,' ')}</span><span><strong>${v}</strong> (${Math.round(v/total*100)}%)</span>
          </div>
          ${barraCSS((v/total)*100)}
        </div>`).join('')}
      </div>
    </section>`;
  }

  // ── Vacunación ──────────────────────────────────────────────────────────────
  let secVacunacion = '';
  if (m.vacunados && m.totalBovinos > 0) {
    secVacunacion = `<section>
      <h2 style="${H2}">Cobertura de vacunación vigente</h2>
      <p style="font-size:12px;color:#9CA3AF;margin-bottom:10px">Dentro del intervalo recomendado (Aftosa: 6 m · Resto: 12 m)</p>
      <div style="background:#f8f8f8;border-radius:8px;padding:12px">
        ${Object.entries(VACUNAS_LABELS_M).map(([key, label]) => {
          const vigente = m.vacunadosVigentes?.[key] ?? 0;
          const total   = m.vacunados?.[key] ?? 0;
          const pctV    = m.totalBovinos > 0 ? Math.round(vigente / m.totalBovinos * 100) : 0;
          const pctT    = m.totalBovinos > 0 ? Math.round(total   / m.totalBovinos * 100) : 0;
          return `<div style="margin:8px 0">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
              <span style="font-weight:bold">${label}</span>
              <span><strong style="color:#2E7D57">${vigente} vigente${vigente!==1?'s':''} (${pctV}%)</strong> · ${total} total (${pctT}%)</span>
            </div>
            <div style="background:#d4edda;border-radius:4px;height:10px;overflow:hidden">
              <div style="background:#2E7D57;height:100%;width:${pctV}%;border-radius:4px"></div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </section>`;
  }

  // ── Alertas ─────────────────────────────────────────────────────────────────
  let secAlertas = '';
  if (m.alertas && m.alertas.length > 0) {
    secAlertas = `<section>
      <h2 style="color:#c0392b;font-size:15px;font-weight:bold;border-left:3px solid #EF4444;padding-left:8px;margin-bottom:12px">
        Alertas del rodeo (${m.alertas.length})
      </h2>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px">
        ${m.alertas.map(a => `<div style="padding:5px 0;border-bottom:1px solid #fecaca">
          <span style="font-family:monospace;font-size:12px;background:#fee2e2;color:#991B1B;padding:1px 6px;border-radius:4px">${a.caravana}</span>
          <span style="font-size:12px;margin-left:6px;color:#374151">${a.motivo}</span>
        </div>`).join('')}
      </div>
    </section>`;
  }

  const secciones = [secSesiones, secRodeo, secPrenez, secComposicion, secEtaria, secTacto, secVacunacion, secAlertas].filter(Boolean);

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <title>${nombreEst.replace(/\s+/g,'_')}_${new Date().toISOString().slice(0,10)}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;color:#111;background:#fff}
    .page{max-width:740px;margin:36px auto;padding:24px}
    section{margin:20px 0}
    @media print{body{margin:0}.page{margin:0;padding:16px}section{page-break-inside:avoid}}
  </style>
  </head><body><div class="page">

  <div style="background:#f0f7f3;border-radius:10px;padding:16px 20px;margin-bottom:20px">
    <div style="font-size:20px;font-weight:900;color:#1B4332;margin-bottom:8px">VetRural — Métricas del establecimiento</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 24px">
      <div><span style="font-size:11px;color:#666">Establecimiento</span><div style="font-weight:bold;font-size:13px">${nombreEst}</div></div>
      <div><span style="font-size:11px;color:#666">Fecha</span><div style="font-weight:bold;font-size:13px">${fechaHoy}</div></div>
      <div><span style="font-size:11px;color:#666">Filtros</span><div style="font-size:13px">${filtrosText}</div></div>
      <div><span style="font-size:11px;color:#666">Total animales</span><div style="font-weight:bold;font-size:13px">${m.totalBovinos ?? '—'}</div></div>
    </div>
  </div>

  ${secciones.join(SEP)}

  </div><script>window.onload=()=>window.print();</script></body></html>`;
}

// ── Live-session metric calculator (fallback offline) ─────────────────────────

const VACUNAS = [
  ['vac_aftosa', 'Aftosa'], ['vac_brucelosis', 'Brucelosis'], ['vac_carbunco', 'Carbunco'],
  ['vac_clostridial', 'Clostridial'], ['vac_ibr', 'IBR'], ['vac_bvd', 'BVD'],
];

function diasDesdeUltimoPesaje(animal) {
  const historial = animal?.historial ?? [];
  const pesajes = historial
    .filter(h => h.tipo === 'Pesaje' || (h.tipo === 'Control' && h.descripcion?.toLowerCase().includes('peso')))
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  if (!pesajes.length) return 30;
  const dias = Math.round((Date.now() - new Date(pesajes[0].fecha).getTime()) / 86400000);
  return Math.max(dias, 1);
}

export function calcularMetricasDesdeSesion(registros, trabajos) {
  const PESO_OBJETIVO = 400;

  let pesaje = null;
  if (trabajos.includes('pesaje')) {
    const conPeso = registros.filter(r =>
      (r.trabajosEfectivos || []).includes('pesaje') && r.form.peso
    );
    const pesos = conPeso.map(r => Number(r.form.peso)).filter(p => !isNaN(p) && p > 0);

    if (pesos.length > 0) {
      const promedio = pesos.reduce((a, b) => a + b, 0) / pesos.length;
      const varianza = pesos.reduce((a, b) => a + Math.pow(b - promedio, 2), 0) / pesos.length;
      const desviacionEstandar = Math.sqrt(varianza);

      const conPrevio = conPeso.filter(r => r.animal.peso && Number(r.animal.peso) > 0);
      const adpvs = conPrevio.map(r =>
        (Number(r.form.peso) - Number(r.animal.peso)) / diasDesdeUltimoPesaje(r.animal)
      );
      const adpvPromedio = adpvs.length > 0
        ? Math.round((adpvs.reduce((a, b) => a + b, 0) / adpvs.length) * 100) / 100
        : null;

      let proyeccionVenta = null;
      if (adpvPromedio !== null && adpvPromedio > 0) {
        const promedioActual = Math.round(promedio);
        if (promedioActual >= PESO_OBJETIVO) {
          proyeccionVenta = 'Ya alcanzó el peso objetivo';
        } else {
          const diasRestantes = (PESO_OBJETIVO - promedioActual) / adpvPromedio;
          const fecha = new Date();
          fecha.setDate(fecha.getDate() + Math.round(diasRestantes));
          proyeccionVenta = fecha.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
        }
      }

      pesaje = {
        promedio: Math.round(promedio),
        minimo: Math.min(...pesos),
        maximo: Math.max(...pesos),
        desviacionEstandar: Math.round(desviacionEstandar),
        adpvPromedio,
        proyeccionVenta,
      };
    }
  }

  let tacto = null;
  if (trabajos.includes('tacto')) {
    const conteos = { Preñada: 0, Perdonada: 0, Frigorífico: 0, Apta_Servicio: 0, No_Aplica: 0 };
    const dist = { cabeza: 0, cuerpo: 0, cola: 0 };
    const PERIODO_MAP = { 'Menos_3_Meses': 'cabeza', 'Entre_3_y_6_Meses': 'cuerpo', 'Mas_6_Meses': 'cola' };

    registros.forEach(r => {
      if (r.form.tacto_situacion) {
        conteos[r.form.tacto_situacion] = (conteos[r.form.tacto_situacion] || 0) + 1;
        if (r.form.tacto_situacion === 'Preñada' && r.form.tacto_periodo) {
          const k = PERIODO_MAP[r.form.tacto_periodo];
          if (k) dist[k]++;
        }
      }
    });

    const total = Object.values(conteos).reduce((a, b) => a + b, 0);
    tacto = {
      prenadas:          conteos['Preñada'],
      perdonadas:        conteos['Perdonada'],
      frigorifico:       conteos['Frigorífico'],
      aptaServicio:      conteos['Apta_Servicio'],
      noAplica:          conteos['No_Aplica'],
      totalTactadas:     total,
      porcentajePreniez: total > 0 ? Math.round((conteos['Preñada'] / total) * 100) : 0,
      distribucion:      dist,
    };
  }

  let boqueo = null;
  if (trabajos.includes('boqueo')) {
    const conteos = { 'De_Leche': 0, 'Mixta': 0, 'Permanente': 0 };
    const deterioro = { 'Leve': 0, 'Moderado': 0, 'Severo': 0 };
    const distribucionDientes = {};
    const edadEstimadaDistribucion = {};

    registros.forEach(r => {
      if (r.form.boqueo_dentadura && conteos[r.form.boqueo_dentadura] !== undefined)
        conteos[r.form.boqueo_dentadura]++;
      if (r.form.boqueo_deterioro && deterioro[r.form.boqueo_deterioro] !== undefined)
        deterioro[r.form.boqueo_deterioro]++;
      if (r.form.boqueo_dientes)
        distribucionDientes[r.form.boqueo_dientes] = (distribucionDientes[r.form.boqueo_dientes] || 0) + 1;
      const est = estimarEdadDesdeBoqueo(r.form.boqueo_dientes, r.form.boqueo_dentadura, r.form.boqueo_deterioro);
      if (est) edadEstimadaDistribucion[est.label] = (edadEstimadaDistribucion[est.label] || 0) + 1;
    });

    const totalB = Object.values(conteos).reduce((a, b) => a + b, 0);
    boqueo = {
      conteos,
      deterioro,
      distribucionDientes,
      edadEstimadaDistribucion,
      tasaReposicion: totalB > 0 ? Math.round((conteos['Permanente'] / totalB) * 100) : 0,
    };
  }

  let vacunacion = null;
  if (trabajos.includes('vacunacion')) {
    const conVac = registros.filter(r => (r.trabajosEfectivos || []).includes('vacunacion'));
    const totalV = conVac.length;
    const conteos = {};
    const cobertura = {};
    VACUNAS.forEach(([campo]) => {
      conteos[campo] = conVac.filter(r => r.form[campo]).length;
      cobertura[campo] = totalV > 0 ? Math.round((conteos[campo] / totalV) * 100) : 0;
    });

    vacunacion = { totalAnimales: totalV, conteos, cobertura };
  }

  const outliers = [];

  if (pesaje && pesaje.desviacionEstandar > 0) {
    const umbralBajo = pesaje.promedio - pesaje.desviacionEstandar;
    const umbralAlto = pesaje.promedio + pesaje.desviacionEstandar;
    registros.forEach(r => {
      if (!(r.trabajosEfectivos || []).includes('pesaje') || !r.form.peso) return;
      const p = Number(r.form.peso);
      if (p < umbralBajo)
        outliers.push({ caravana: r.animal.caravana, nombre: r.animal.nombre || '—',
          motivo: `Peso bajo: ${p} kg (promedio ${pesaje.promedio} kg, umbral ${Math.round(umbralBajo)} kg)` });
      else if (p > umbralAlto)
        outliers.push({ caravana: r.animal.caravana, nombre: r.animal.nombre || '—',
          motivo: `Peso elevado: ${p} kg (promedio ${pesaje.promedio} kg, umbral ${Math.round(umbralAlto)} kg)` });
    });
  }

  registros.forEach(r => {
    if (r.form.tacto_situacion === 'Frigorífico')
      outliers.push({ caravana: r.animal.caravana, nombre: r.animal.nombre || '—',
        motivo: 'Tacto: destinada a frigorífico' });
    if (r.form.boqueo_deterioro === 'Severo')
      outliers.push({ caravana: r.animal.caravana, nombre: r.animal.nombre || '—',
        motivo: 'Boqueo: deterioro dental severo' });
  });

  // Distribución por tipo de animal
  const distribucionTipo = {};
  registros.forEach(r => {
    const tipo = r.animal?.tipo || 'Sin categoría';
    distribucionTipo[tipo] = (distribucionTipo[tipo] || 0) + 1;
  });

  return { pesaje, tacto, boqueo, vacunacion, outliers, distribucionTipo };
}
