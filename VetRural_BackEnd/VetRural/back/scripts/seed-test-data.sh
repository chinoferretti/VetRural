#!/usr/bin/env bash
# Script de seed + smoke test para VetRural.
#
# Uso:
#   1) Levantar el backend:  ./mvnw spring-boot:run
#   2) En otra terminal:     ./scripts/seed-test-data.sh
#
# Requiere: curl, jq (brew install jq)

set -e

BASE_URL="${BASE_URL:-http://localhost:8080}"

say() { printf "\n\033[1;36m▶ %s\033[0m\n" "$*"; }
ok()  { printf "  \033[0;32m✓ %s\033[0m\n" "$*"; }

# ─── Establecimientos ─────────────────────────────────────────────────────────
say "Crear establecimiento 'La Esperanza'"
EST_ID=$(curl -s -X POST "$BASE_URL/api/establecimientos" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"La Esperanza"}' | jq -r '.id')
ok "Establecimiento creado id=$EST_ID"

# ─── Usuarios ─────────────────────────────────────────────────────────────────
say "Crear veterinario"
VET_ID=$(curl -s -X POST "$BASE_URL/api/usuarios" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan","apellido":"Pérez","email":"jperez@example.com","contrasena":"secret","tipo":"Veterinario"}' \
  | jq -r '.idUsuario')
ok "Veterinario creado id=$VET_ID"

say "Crear anotador"
ANO_ID=$(curl -s -X POST "$BASE_URL/api/usuarios" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Marta","apellido":"García","email":"mgarcia@example.com","contrasena":"secret","tipo":"Anotador"}' \
  | jq -r '.idUsuario')
ok "Anotador creado id=$ANO_ID"

say "Crear productor"
PROD_ID=$(curl -s -X POST "$BASE_URL/api/usuarios" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Roberto","apellido":"Estancia","email":"restancia@example.com","contrasena":"secret","tipo":"Productor_Agropecuario"}' \
  | jq -r '.idUsuario')
ok "Productor creado id=$PROD_ID"

# ─── Asociar usuarios al establecimiento ──────────────────────────────────────
say "Asociar veterinario y anotador a 'La Esperanza'"
curl -s -X POST "$BASE_URL/api/establecimientos/$EST_ID/usuarios/$VET_ID" > /dev/null
curl -s -X POST "$BASE_URL/api/establecimientos/$EST_ID/usuarios/$ANO_ID" > /dev/null
curl -s -X POST "$BASE_URL/api/establecimientos/$EST_ID/usuarios/$PROD_ID" > /dev/null
ok "Asociaciones creadas"

say "Listar establecimientos del veterinario"
curl -s "$BASE_URL/api/usuarios/$VET_ID/establecimientos" | jq

# ─── Bovinos ──────────────────────────────────────────────────────────────────
say "Crear bovino completo 'AR123456789'"
curl -s -X POST "$BASE_URL/api/bovinos" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\":\"AR123456789\",
    \"establecimientoId\":$EST_ID,
    \"raza\":\"Angus\",
    \"tipo\":\"Vaca\",
    \"sexo\":\"Hembra\",
    \"nacimiento\":\"2021-03-15\",
    \"obs\":\"Vaca madre, segunda paricion\"
  }" | jq
ok "Bovino completo creado"

say "Crear bovino rápido 'AR987654321' (solo ID + sexo)"
curl -s -X POST "$BASE_URL/api/bovinos/rapido" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\":\"AR987654321\",
    \"establecimientoId\":$EST_ID,
    \"sexo\":\"Macho\"
  }" | jq
ok "Bovino rápido creado"

# ─── Lotes ────────────────────────────────────────────────────────────────────
say "Asignar AR123456789 al lote 'Vacas Servicio'"
curl -s -X PUT "$BASE_URL/api/bovinos/AR123456789/lote?lote=Vacas%20Servicio" > /dev/null
ok "Asignado"

say "Listar lotes existentes"
curl -s "$BASE_URL/api/bovinos/lotes" | jq

say "Listar bovinos del lote 'Vacas Servicio'"
curl -s "$BASE_URL/api/bovinos/lotes/Vacas%20Servicio" | jq

# ─── Eventos sanitarios ───────────────────────────────────────────────────────
say "Registrar tacto (Preñada, +6 meses)"
curl -s -X POST "$BASE_URL/api/manga/tacto" \
  -H "Content-Type: application/json" \
  -d "{
    \"bovinoId\":\"AR123456789\",
    \"registradoPorId\":$VET_ID,
    \"situacion\":\"Preñada\",
    \"periodo\":\"Mas_6_Meses\"
  }" | jq

say "Registrar pesaje (450 kg)"
curl -s -X POST "$BASE_URL/api/manga/pesaje" \
  -H "Content-Type: application/json" \
  -d "{
    \"bovinoId\":\"AR123456789\",
    \"registradoPorId\":$ANO_ID,
    \"peso\":450.5
  }" | jq

say "Registrar boqueo"
curl -s -X POST "$BASE_URL/api/manga/boqueo" \
  -H "Content-Type: application/json" \
  -d "{
    \"bovinoId\":\"AR123456789\",
    \"registradoPorId\":$VET_ID,
    \"dientes\":\"Ocho\",
    \"deterioro\":\"Leve\",
    \"dentadura\":\"Permanente\"
  }" | jq

say "Registrar 3 vacunaciones (Aftosa, Brucelosis, Carbunco)"
for v in Aftosa Brucelosis Carbunco; do
  curl -s -X POST "$BASE_URL/api/manga/vacunacion" \
    -H "Content-Type: application/json" \
    -d "{
      \"bovinoId\":\"AR123456789\",
      \"registradoPorId\":$ANO_ID,
      \"vacuna\":\"$v\"
    }" | jq -c
done

# ─── Validación de autorización ───────────────────────────────────────────────
say "Intentar registrar pesaje con un Productor (debe fallar con 400)"
curl -s -w "\nHTTP %{http_code}\n" -X POST "$BASE_URL/api/manga/pesaje" \
  -H "Content-Type: application/json" \
  -d "{
    \"bovinoId\":\"AR123456789\",
    \"registradoPorId\":$PROD_ID,
    \"peso\":420.0
  }"

# ─── Consultas ────────────────────────────────────────────────────────────────
say "Cronología completa del bovino"
curl -s "$BASE_URL/api/manga/AR123456789/eventos" | jq

say "Último tacto del bovino"
curl -s "$BASE_URL/api/manga/AR123456789/ultimo-tacto" | jq

say "Último pesaje del bovino"
curl -s "$BASE_URL/api/manga/AR123456789/ultimo-pesaje" | jq

say "Historial de vacunaciones"
curl -s "$BASE_URL/api/manga/AR123456789/vacunaciones" | jq

say "Bovinos del establecimiento"
curl -s "$BASE_URL/api/establecimientos/$EST_ID/bovinos" | jq

echo
ok "Seed + smoke test completado"
