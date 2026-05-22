/**
 * Seed script — pobla el backend con datos de prueba.
 * Requisito: el backend debe estar corriendo en localhost:8080
 * Uso:  node scripts/seed.js
 *
 * Es idempotente: si un email ya existe lo omite y reutiliza el usuario existente.
 */

const { readFileSync, writeFileSync } = require('fs');
const { join }                       = require('path');

const BASE  = 'http://localhost:8080/api';
const PROPS = join(__dirname, '..', 'src', 'main', 'resources', 'application.properties');
const data  = JSON.parse(readFileSync(join(__dirname, 'seed-data.json'), 'utf8'));

function resetDdlAuto(value) {
  const props   = readFileSync(PROPS, 'utf8');
  const updated = props.replace(/spring\.jpa\.hibernate\.ddl-auto=\w+/, `spring.jpa.hibernate.ddl-auto=${value}`);
  writeFileSync(PROPS, updated, 'utf8');
}

// ── Helpers ───────────────────────────────────────────────────────────────────
async function post(path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`POST ${path} → ${r.status}: ${text}`);
  return JSON.parse(text);
}

async function link(path) {
  const r = await fetch(`${BASE}${path}`, { method: 'POST' });
  if (!r.ok && r.status !== 409) throw new Error(`POST ${path} → ${r.status}`);
}

async function getAll(path) {
  const r = await fetch(`${BASE}${path}`);
  return r.json();
}

function peso() { return Math.round((220 + Math.random() * 280) * 10) / 10; }

// ── Seed ──────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Iniciando seed...\n');

  // ── Usuarios (todos los tipos) ────────────────────────────────────────────
  const usuariosExistentes = await getAll('/usuarios');
  const emailsExistentes   = new Map(usuariosExistentes.map(u => [u.email, u]));

  const usuarios = [];
  for (const u of data.usuarios) {
    if (emailsExistentes.has(u.email)) {
      const existente = emailsExistentes.get(u.email);
      console.log(`~ Ya existe  ${existente.nombre} ${existente.apellido}  (id: ${existente.idUsuario})`);
      usuarios.push(existente);
    } else {
      const creado = await post('/usuarios', u);
      console.log(`✓ Creado     ${creado.nombre} ${creado.apellido}  [${creado.tipo}]  (id: ${creado.idUsuario})`);
      usuarios.push(creado);
    }
  }

  // ── Establecimientos ─────────────────────────────────────────────────────
  const ests = [];
  for (const e of data.establecimientos) {
    const est = await post('/establecimientos', e);
    ests.push(est);
    console.log(`✓ Est   ${est.nombre}  (id: ${est.id})`);
  }

  // Asociar TODOS los usuarios a TODOS los establecimientos
  for (const est of ests)
    for (const u of usuarios)
      await link(`/establecimientos/${est.id}/usuarios/${u.idUsuario}`);
  console.log('✓ Todos los usuarios asociados a todos los establecimientos\n');

  // ── Bovinos ──────────────────────────────────────────────────────────────
  const [estEsp, estPor] = ests;
  const bovinosEsp = [];
  const bovinosPor = [];

  for (const b of data.bovinos.esperanza) {
    const bov = await post('/bovinos', { ...b, establecimientoId: estEsp.id });
    bovinosEsp.push(bov);
    console.log(`  🐄 ${bov.caravana}  ${bov.sexo}  ${bov.raza}  →  ${estEsp.nombre}`);
  }
  for (const b of data.bovinos.porvenir) {
    const bov = await post('/bovinos', { ...b, establecimientoId: estPor.id });
    bovinosPor.push(bov);
    console.log(`  🐄 ${bov.caravana}  ${bov.sexo}  ${bov.raza}  →  ${estPor.nombre}`);
  }

  // ── Sesiones ─────────────────────────────────────────────────────────────
  const vets = usuarios.filter(u => u.tipo === 'Veterinario');
  console.log('');

  const pares = [
    { est: estEsp, bovinos: bovinosEsp, label: 'La Esperanza' },
    { est: estPor, bovinos: bovinosPor, label: 'El Porvenir'  },
  ];

  for (const { est, bovinos, label } of pares) {

    const s1 = await post('/sesiones', {
      veterinarioId:     vets[0].idUsuario,
      anotador:          'Pedro Sánchez',
      establecimientoId: est.id,
    });
    console.log(`✓ Sesión 1  ${label}  (id: ${s1.id})`);

    for (const bov of bovinos.slice(0, 3)) {
      await post('/manga/pesaje',     { bovinoId: bov.id, sesionId: s1.id, peso: peso() });
      await post('/manga/vacunacion', { bovinoId: bov.id, sesionId: s1.id, vacuna: 'Aftosa' });
      await post('/manga/vacunacion', { bovinoId: bov.id, sesionId: s1.id, vacuna: 'Clostridial' });
    }

    const s2 = await post('/sesiones', {
      veterinarioId:     vets[1].idUsuario,
      anotador:          null,
      establecimientoId: est.id,
    });
    console.log(`✓ Sesión 2  ${label}  (id: ${s2.id})`);

    for (const bov of bovinos.slice(3, 6)) {
      await post('/manga/pesaje', { bovinoId: bov.id, sesionId: s2.id, peso: peso() });
      await post('/manga/boqueo', {
        bovinoId:  bov.id,
        sesionId:  s2.id,
        dientes:   ['Dos','Cuatro','Seis','Ocho'][Math.floor(Math.random() * 4)],
        deterioro: 'Nulo',
        dentadura: 'Permanente',
      });
      if (bov.sexo === 'Hembra') {
        await post('/manga/tacto', {
          bovinoId:  bov.id,
          sesionId:  s2.id,
          situacion: 'Preñada',
          periodo:   'Entre_3_y_6_Meses',
        });
      }
    }
  }

  // Volver ddl-auto a update para que próximos reinicios no borren los datos
  resetDdlAuto('update');
  console.log('✓ ddl-auto → update\n');

  console.log('\n🐄 Seed completado exitosamente.');
  console.log(`   Usuarios:        ${usuarios.length}  (${vets.length} vets, ${usuarios.length - vets.length} otros)`);
  console.log('   Establecimientos: 2');
  console.log('   Bovinos:         12  (6 por establecimiento)');
  console.log('   Sesiones:         4  (2 por establecimiento)');
  console.log('\nCredenciales de prueba:');
  for (const u of usuarios) {
    const pw = data.usuarios.find(d => d.email === u.email)?.contrasena ?? '—';
    console.log(`   ${u.email.padEnd(35)} pass: ${pw}  [${u.tipo}]`);
  }
}

seed().catch(err => {
  console.error('\n❌ Error en el seed:', err.message);
  console.error('   ¿Está el backend corriendo en localhost:8080?');
  process.exit(1);
});
