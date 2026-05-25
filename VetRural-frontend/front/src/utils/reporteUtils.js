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
  animalesAtendidos, tratamientos,
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
              <span>${k}</span><span><strong>${v}</strong> (${Math.round(v / totalB * 100)}%)</span>
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
          <p style="font-size:13px;font-weight:bold;color:#856404">Tasa de reposición: ${b.tasaReposicion}% — ${b.conteos['Permanente']} ${b.conteos['Permanente'] !== 1 ? 'animales' : 'animal'} con dentadura permanente</p>
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

  // ── Sección Tratamientos (historial) ────────────────────────────────────────
  let secTratamientos = '';
  if (tratamientos && tratamientos.length > 0) {
    secTratamientos = `<section>
      <h2 style="${h2Style}">Tratamientos</h2>
      <div style="background:#f8f8f8;border-radius:8px;overflow:hidden">
        ${tratamientos.map(tr => `<div style="padding:10px;border-bottom:1px solid #e5e7eb">
          <div style="display:flex;justify-content:space-between;font-size:13px">
            <span style="font-weight:600">${tr.animal}</span>
            <span style="color:#6B7280;font-size:12px">${tr.viaAdmin}</span>
          </div>
          <div style="font-size:13px;margin-top:2px">
            <span style="color:#2d7a4f;font-weight:bold">${tr.medicamento}</span>
            <span style="color:#6B7280;margin-left:8px">${tr.dosis}</span>
          </div>
        </div>`).join('')}
      </div>
    </section>`;
  }

  const secciones = [secPesaje, secTacto, secBoqueo, secVacunacion, secOutliers, secAnimales, secTratamientos].filter(Boolean);

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <title>Reporte VetRural — ${fecha}</title>
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
    const conteos = { Preñada: 0, Perdonada: 0, Frigorífico: 0, 'Apta servicio': 0 };
    const dist = { cabeza: 0, cuerpo: 0, cola: 0 };
    const PERIODO_MAP = { '-3 meses': 'cabeza', '3 a 6 meses': 'cuerpo', '+6 meses': 'cola' };

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
      aptaServicio:      conteos['Apta servicio'],
      totalTactadas:     total,
      porcentajePreniez: total > 0 ? Math.round((conteos['Preñada'] / total) * 100) : 0,
      distribucion:      dist,
    };
  }

  let boqueo = null;
  if (trabajos.includes('boqueo')) {
    const conteos = { 'De leche': 0, 'Mixta': 0, 'Permanente': 0 };
    const deterioro = { 'Leve': 0, 'Moderado': 0, 'Severo': 0 };

    registros.forEach(r => {
      if (r.form.boqueo_dentadura && conteos[r.form.boqueo_dentadura] !== undefined)
        conteos[r.form.boqueo_dentadura]++;
      if (r.form.boqueo_deterioro && deterioro[r.form.boqueo_deterioro] !== undefined)
        deterioro[r.form.boqueo_deterioro]++;
    });

    const totalB = Object.values(conteos).reduce((a, b) => a + b, 0);
    boqueo = {
      conteos,
      deterioro,
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

  return { pesaje, tacto, boqueo, vacunacion, outliers };
}
