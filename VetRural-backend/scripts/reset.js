/**
 * Reset de base de datos.
 * Borra vetrural.db y pone ddl-auto=create para que el backend recree el schema.
 *
 * Uso:
 *   1.  Detené el backend  (Ctrl+C)
 *   2.  node scripts/reset.js
 *   3.  Levantá el backend  (mvn spring-boot:run)
 *   4.  node scripts/seed.js
 */

const { existsSync, unlinkSync, readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const ROOT  = join(__dirname, '..');
const DB    = join(ROOT, 'vetrural.db');
const PROPS = join(ROOT, 'src', 'main', 'resources', 'application.properties');

// 1. Borrar la DB
if (existsSync(DB)) {
  try {
    unlinkSync(DB);
    console.log('✓ vetrural.db eliminada');
  } catch (e) {
    console.error('✗ No se pudo eliminar vetrural.db:', e.message);
    console.error('  ¿Está el backend corriendo? Detenelo primero (Ctrl+C)');
    process.exit(1);
  }
} else {
  console.log('~ vetrural.db no existía, nada que eliminar');
}

// 2. Cambiar ddl-auto a create
const props = readFileSync(PROPS, 'utf8');
const updated = props.replace(
  /spring\.jpa\.hibernate\.ddl-auto=\w+/,
  'spring.jpa.hibernate.ddl-auto=create'
);
writeFileSync(PROPS, updated, 'utf8');
console.log('✓ ddl-auto → create');

console.log('\n✅ Reset listo.');
console.log('   Ahora:');
console.log('   1. Levantá el backend   →  mvn spring-boot:run');
console.log('   2. Cuando arranque      →  node scripts/seed.js');
