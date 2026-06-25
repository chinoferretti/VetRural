#!/usr/bin/env python3
"""
Pobla VetRural con 420 bovinos realistas (campo argentino).
Uso: python poblar_rodeo.py

Requisito: pip install requests
"""
import random
import sys
from datetime import date, timedelta

try:
    import requests
except ImportError:
    print("ERROR: pip install requests")
    sys.exit(1)

# ─── Configuración ────────────────────────────────────────────────────────────
BASE = "http://localhost:8080/api"
HDR  = {"Authorization": "Bearer jwt-2", "Content-Type": "application/json"}
HOY  = date.today()
RNG  = random.Random(2025)          # seed fijo → reproducible

# ─── Helpers ─────────────────────────────────────────────────────────────────
def get(path):
    r = requests.get(f"{BASE}{path}", headers=HDR, timeout=10)
    r.raise_for_status()
    return r.json()

def post(path, body):
    r = requests.post(f"{BASE}{path}", headers=HDR, json=body, timeout=10)
    r.raise_for_status()
    return r.json()

def put(path, **params):
    r = requests.put(f"{BASE}{path}", headers=HDR, params=params, timeout=10)
    r.raise_for_status()

def fecha(min_dias, max_dias):
    return str(HOY - timedelta(days=RNG.randint(min_dias, max_dias)))

def warn(msg):
    print(f"    ⚠ {msg}")

# ─── Descubrimiento automático ───────────────────────────────────────────────
print("Conectando al backend...")
try:
    usuarios = get("/usuarios")
    estabs   = get("/establecimientos")
except Exception as e:
    print(f"ERROR al conectar: {e}")
    sys.exit(1)

if not usuarios:
    print("ERROR: No hay usuarios en la BD.")
    sys.exit(1)
if not estabs:
    print("ERROR: No hay establecimientos en la BD.")
    sys.exit(1)

USR_ID = usuarios[0]["idUsuario"]
EST_ID = estabs[0]["id"]
print(f"  → Usuario     : {usuarios[0]['nombre']} {usuarios[0]['apellido']}  (id={USR_ID})")
print(f"  → Establecimiento : {estabs[0]['nombre']}  (id={EST_ID})")

# ─── Plan del rodeo ──────────────────────────────────────────────────────────
#   tipo          sexo      cant  nac_min nac_max  kg_min kg_max  lote
PLAN = [
    ("Vaca",       "Hembra", 150, 1460, 4380,  310, 660,  "Cría"),
    ("Ternera",    "Hembra",  60,  120,  365,   55, 275,  "Recría"),
    ("Vaquillona", "Hembra",  30,  547, 1095,  175, 390,  "Recría"),
    ("Ternero",    "Macho",   70,  120,  365,   60, 285,  "Recría"),
    ("Novillito",  "Macho",   40,  365,  730,  155, 370,  "Invernada"),
    ("Novillo",    "Macho",   50,  730, 1460,  265, 520,  "Invernada"),
    ("Torito",     "Macho",   10,  365,  730,  155, 400,  "Reproductores"),
    ("Toro",       "Macho",   10, 1460, 3650,  380, 880,  "Reproductores"),
]
# Total: 420 bovinos

RAZAS_H = ["Angus", "Hereford", "Brangus", "Braford", "Limousin"]
RAZAS_M = ["Angus", "Hereford", "Brangus", "Braford", "Limousin", "Charolais"]

PESO_RAZA = {          # multiplicador de peso por raza
    "Angus":    1.05, "Hereford": 1.00, "Brangus": 1.08,
    "Braford":  1.06, "Limousin": 1.10, "Charolais": 1.12,
}

# Situaciones de tacto con distribución realista
SIT_VALS = ["Preñada", "Apta_Servicio", "Perdonada", "No_Aplica", "Frigorífico"]
SIT_PESOS = [0.45, 0.30, 0.10, 0.10, 0.05]

BOQUEO_OPCIONES = [          # (dientes, dentadura, deterioro|None)
    ("Dos",    "De_Leche",  None),
    ("Dos",    "Mixta",     "Nulo"),
    ("Cuatro", "Mixta",     "Nulo"),
    ("Cuatro", "Permanente","Nulo"),
    ("Seis",   "Permanente","Nulo"),
    ("Seis",   "Permanente","Leve"),
    ("Ocho",   "Permanente","Nulo"),
    ("Ocho",   "Permanente","Leve"),
    ("Ocho",   "Permanente","Moderado"),
    ("Ocho",   "Permanente","Severo"),
]

PERIODOS = ["Menos_3_Meses", "Entre_3_y_6_Meses", "Mas_6_Meses"]

# ─── 1. Crear bovinos ────────────────────────────────────────────────────────
print(f"\n[1/4] Creando bovinos...")
creados = []   # lista de dicts con metadatos
n = 1

for (tipo, sexo, cant, nac_min, nac_max, kg_min, kg_max, lote) in PLAN:
    ok = 0
    for _ in range(cant):
        caravana = f"AR{n:04d}"
        raza     = RNG.choice(RAZAS_H if sexo == "Hembra" else RAZAS_M)

        try:
            resp = post("/bovinos", {
                "caravana":          caravana,
                "establecimientoId": EST_ID,
                "sexo":              sexo,
                "nacimiento":        fecha(nac_min, nac_max),
                "raza":              raza,
                "tipo":              tipo,
            })
            bov_id = resp["id"]

            # Asignar lote vía PUT /bovinos/{id}/lote?lote=...
            try:
                put(f"/bovinos/{bov_id}/lote", lote=lote)
            except Exception as e:
                warn(f"lote {caravana}: {e}")

            creados.append({
                "id":    bov_id,
                "tipo":  tipo,
                "sexo":  sexo,
                "raza":  raza,
                "kg_min": kg_min,
                "kg_max": kg_max,
            })
            ok += 1
        except Exception as e:
            warn(f"bovino {caravana}: {e}")

        n += 1

    print(f"  {tipo:12s} ×{ok}")

print(f"  → {len(creados)} bovinos creados")

# ─── 2. Pesajes ──────────────────────────────────────────────────────────────
print(f"\n[2/4] Registrando pesajes...")
ok = 0
for b in creados:
    factor = PESO_RAZA.get(b["raza"], 1.0)
    peso   = round(RNG.uniform(b["kg_min"], b["kg_max"]) * factor, 1)
    try:
        post("/manga/pesaje", {
            "bovinoId":        b["id"],
            "registradoPorId": USR_ID,
            "peso":            peso,
        })
        ok += 1
    except Exception as e:
        warn(f"pesaje id={b['id']}: {e}")
print(f"  → {ok} pesajes registrados")

# ─── 3. Tactos (solo Vacas y Vaquillonas) ────────────────────────────────────
print(f"\n[3/4] Registrando tactos...")
ok = 0
for b in creados:
    if b["tipo"] not in ("Vaca", "Vaquillona"):
        continue
    situacion = RNG.choices(SIT_VALS, weights=SIT_PESOS)[0]
    body = {
        "bovinoId":        b["id"],
        "registradoPorId": USR_ID,
        "situacion":       situacion,
    }
    if situacion == "Preñada":
        body["periodo"] = RNG.choice(PERIODOS)
    try:
        post("/manga/tacto", body)
        ok += 1
    except Exception as e:
        warn(f"tacto id={b['id']}: {e}")
print(f"  → {ok} tactos registrados")

# ─── 3b. Boqueos (no terneros/as) ────────────────────────────────────────────
print(f"\n[3b] Registrando boqueos...")
ok = 0
for b in creados:
    if b["tipo"] in ("Ternero", "Ternera"):
        continue
    dientes, dentadura, deterioro = RNG.choice(BOQUEO_OPCIONES)
    body = {
        "bovinoId":        b["id"],
        "registradoPorId": USR_ID,
        "dientes":         dientes,
        "dentadura":       dentadura,
    }
    if deterioro:
        body["deterioro"] = deterioro
    try:
        post("/manga/boqueo", body)
        ok += 1
    except Exception as e:
        warn(f"boqueo id={b['id']}: {e}")
print(f"  → {ok} boqueos registrados")

# ─── 4. Vacunaciones ─────────────────────────────────────────────────────────
print(f"\n[4/4] Registrando vacunaciones...")
ok = 0

def vacunar(bov_id, vacuna, min_d, max_d):
    global ok
    try:
        post("/manga/vacunacion", {
            "bovinoId":        bov_id,
            "registradoPorId": USR_ID,
            "vacuna":          vacuna,
            "fechaAplicacion": fecha(min_d, max_d),
        })
        ok += 1
    except Exception as e:
        warn(f"{vacuna} id={bov_id}: {e}")

for b in creados:
    bid = b["id"]

    # Aftosa: todos — 80 % vigente (< 180 días), 20 % vencida
    if RNG.random() < 0.80:
        vacunar(bid, "Aftosa", 10, 170)
    else:
        vacunar(bid, "Aftosa", 181, 400)

    # Clostridial: todos — 70 % vigente (< 365 días), 30 % vencida
    if RNG.random() < 0.70:
        vacunar(bid, "Clostridial", 15, 355)
    else:
        vacunar(bid, "Clostridial", 366, 500)

    # Carbunco: 65 % de los bovinos
    if RNG.random() < 0.65:
        vacunar(bid, "Carbunco", 20, 340)

    # IBR: 55 % de los bovinos
    if RNG.random() < 0.55:
        vacunar(bid, "IBR", 30, 340)

    # BVD: 50 % de los bovinos
    if RNG.random() < 0.50:
        vacunar(bid, "BVD", 30, 340)

    # Brucelosis: solo hembras, 70 % de ellas
    if b["sexo"] == "Hembra" and RNG.random() < 0.70:
        # vida útil 36500 días → siempre vigente
        vacunar(bid, "Brucelosis", 30, 1000)

print(f"  → {ok} vacunaciones registradas")

# ─── Resumen ─────────────────────────────────────────────────────────────────
tipos_cnt = {}
for b in creados:
    tipos_cnt[b["tipo"]] = tipos_cnt.get(b["tipo"], 0) + 1

print(f"""
{'='*52}
  RODEO POBLADO — Establecimiento id={EST_ID}
{'='*52}
  Total bovinos : {len(creados)}""")
for tipo, cnt in sorted(tipos_cnt.items()):
    print(f"    {tipo:12s}: {cnt}")
print(f"""
  Lotes creados : Cría / Recría / Invernada / Reproductores
  Caravanas     : AR0001 → AR{n-1:04d}
{'='*52}
""")
