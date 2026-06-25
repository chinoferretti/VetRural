# Bug Report — VetRural API

Fecha: 2026-05-19
Versión testeada: Spring Boot 4.0.6 / SQLite
Rama: `main`
Revisión: análisis estático completo del estado actual del código tras refactor de modelo de dominio

> **Nota:** los bugs BUG-01..BUG-09 del informe anterior (sobreescritura por `merge`, lotes con IDs inexistentes, status codes incorrectos, contraseñas en plano, etc.) ya están resueltos en `main`. Esta revisión cubre los issues remanentes detectados tras el refactor.

---

## BUG-01 — `Usuario.email` no tiene constraint de unicidad en la DB

**Severidad:** Alta
**Archivos:** `Usuario.java:24`, `UsuarioServiceImpl.java:25-27`
**¿Fixeado?** No

### Descripción

El spec técnico (sección 4.2 y sección 14) exige que `Usuario.email` sea `unique = true` a nivel columna. La entidad actual solo declara `private String email;` sin `@Column`. La unicidad se valida únicamente en el service:

```java
// UsuarioServiceImpl.java:25-27
if (usuarioRepository.findByEmail(email).isPresent()) {
    throw new IllegalArgumentException("Ya existe un usuario con email: " + email);
}
```

Bajo concurrencia, dos requests con el mismo email pueden pasar la validación simultáneamente (ambos hacen `findByEmail` antes de que cualquiera commitee) y ambos persistir. La DB no opone resistencia porque la columna no tiene `unique`.

**Fix:**
```java
// Usuario.java
@Column(unique = true, nullable = false)
private String email;
```

La validación en el service queda como defensa en profundidad para devolver 400 con mensaje accionable; el constraint de DB cubre el caso de carrera devolviendo `DataIntegrityViolationException` (que termina en 500, pero al menos no permite duplicados).

---

## BUG-02 — `Tacto` permite combinaciones inválidas de `situacion` y `periodo`

**Severidad:** Alta
**Archivos:** `TactoServiceImpl.java:22-30`, `RegistrarTactoRequest.java`
**¿Fixeado?** No

### Descripción

El spec técnico (5.5) y el spec funcional (CU-03) establecen que `periodo` solo aplica si `situacion = Preñada`. Hoy:

- `RegistrarTactoRequest.periodo` es opcional (sin `@NotNull`).
- `TactoServiceImpl.registrarTacto` no valida coherencia.

Casos inválidos que el sistema acepta:
- `situacion = Apta_Servicio` + `periodo = Mas_6_Meses` → datos contradictorios persistidos.
- `situacion = Preñada` sin `periodo` → registro incompleto, no se sabe el período.

**Fix:**
```java
// TactoServiceImpl.registrarTacto
if (situacion == SituacionEnum.Prenada && periodo == null) {
    throw new IllegalArgumentException("El periodo es obligatorio cuando la situacion es Prenada");
}
if (situacion != SituacionEnum.Prenada && periodo != null) {
    throw new IllegalArgumentException("El periodo solo aplica cuando la situacion es Prenada");
}
```

---

## BUG-03 — Borrar `Usuario` asociado a un `Establecimiento` lanza 500 por FK

**Severidad:** Alta
**Archivo:** `UsuarioServiceImpl.java:64-69`
**¿Fixeado?** No

### Descripción

`eliminarUsuario` hace `deleteById` directo. Si el usuario figura en la tabla join `establecimiento_usuarios`, la FK del lado dueño (`Establecimiento.usuarios`) impide el borrado:

```java
// ACTUAL — falla por FK si el usuario está en algún establecimiento
public void eliminarUsuario(Long idUsuario) {
    if (!usuarioRepository.existsById(idUsuario)) {
        throw new EntityNotFoundException("Usuario no encontrado: " + idUsuario);
    }
    usuarioRepository.deleteById(idUsuario);
}
```

Resultado: `DataIntegrityViolationException` → 500 vía catch-all del `GlobalExceptionHandler`. El cliente recibe un error genérico sin pista de qué hacer.

Idéntico problema en `BovinoServiceImpl.eliminarBovino` (`:58-63`) si el bovino tiene `EventoSanitario` asociados (FK `nullable=false` en `EventoSanitario.bovino`). Hoy no hay endpoint `DELETE /api/bovinos/{id}` expuesto, pero el método público en el service queda como trampa para futuros consumidores.

**Fix opciones:**
1. Desasociar primero: recorrer `u.getEstablecimientos()` y removerlo de cada uno antes de borrar.
2. Lanzar `IllegalArgumentException` si tiene asociaciones, exigiendo que el cliente desasocie explícitamente.
3. Para `Bovino`: idem con eventos sanitarios (opción 2 es más segura — no se borran eventos por accidente).

---

## BUG-04 — `@RequestParam` de operaciones de lote/observaciones no validan `@NotBlank`

**Severidad:** Media
**Archivos:** `BovinoController.java:74,80,98,105`
**¿Fixeado?** No

### Descripción

Cuatro endpoints reciben strings como query param sin validación:

```java
// :74 — PUT /api/bovinos/{id}/observaciones
@RequestParam String obs

// :80 — PUT /api/bovinos/{id}/lote
@RequestParam String lote

// :98 — POST /api/bovinos/lotes
@RequestParam String nombre

// :105 — DELETE /api/bovinos/lotes
@RequestParam String nombre
```

Una llamada con `?lote=` (vacío) o `?lote=%20%20%20` (espacios) entra al service y persiste un lote con nombre vacío/whitespace. Lo mismo para crear un lote con nombre vacío o asignar observaciones vacías.

**Fix:** anotar con `@NotBlank` (requiere `@Validated` en el controller):

```java
@RestController
@RequestMapping("/api/bovinos")
@Validated
public class BovinoController {
    ...
    @PutMapping("/{id}/lote")
    public ResponseEntity<Void> asignarLote(@PathVariable Long id, @RequestParam @NotBlank String lote) { ... }
}
```

Alternativa: mover los strings al body con DTO + `@Valid` (más convencional para PUT/POST que modifican texto).

---

## BUG-05 — `functional-spec.md` describe entidades y casos de uso eliminados en el refactor

**Severidad:** Media
**Archivo:** `docs/functional-spec.md`
**¿Fixeado?** No

### Descripción

El spec funcional sigue documentando el modelo previo al refactor. Inconsistencias concretas:

- **CU-01 "Abrir sesión" y CU-07 "Cerrar sesión"** describen la entidad `Sesion`, eliminada (TD-07 del spec técnico).
- **RN-01, RN-02, RN-06** referencian sesiones.
- **CU-06** describe vacunación con cinco fechas (`Aftosa`, `Brucelosis`, ...). El modelo nuevo es una fila por vacuna con `VacunaTipoEnum` (TD-06).
- **Sección 6: estado de `Sesion`** — entidad inexistente.
- **Sección 8 (glosario):** define "Sesión" como concepto vigente.
- **Asunción 9.4** sobre estadísticas de `Sesion` — obsoleta.
- **Asunción 9.5** sobre `Animal` como base para otras especies — `Animal` fue eliminada.
- **Flujo "Registro rápido":** usa `GET /api/bovinos/{id}/existe`; el endpoint real es `GET /api/bovinos/existe?caravana=...` (`BovinoController.java:46-49`).
- **No menciona `Establecimiento`** como entidad/actor, siendo central en el modelo nuevo.

**Fix:** reescribir el spec funcional para reflejar el modelo actual: sin sesión, vacunación por evento individual, establecimiento como contexto obligatorio de cada bovino.

---

## BUG-06 — Lotes globales en lugar de scoped por establecimiento

**Severidad:** Media
**Archivos:** `Bovino.java:39`, `BovinoController.java:85-95,104-108`, `BovinoServiceImpl.java:98-111,134-138`
**¿Fixeado?** No

### Descripción

`Bovino.lote` es un `String` global. `GET /api/bovinos/lotes` y `GET /api/bovinos/lotes/{lote}` no filtran por establecimiento. Dos bovinos de establecimientos distintos con `lote="Pasto Norte"` quedan en el mismo "lote conceptual".

Esto está marcado como `[ASSUMPTION]` en spec técnico (sección 13) y como trade-off en TD-05, pero el código no impide la colisión y los endpoints no permiten desambiguar.

**Fix opciones:**
1. Si el negocio confirma scope por establecimiento: cambiar endpoints a `/api/establecimientos/{id}/lotes` y query a `WHERE establecimiento_id = ? AND lote = ?`.
2. Modelar `Lote` como entidad con FK a `Establecimiento` (rompe TD-05).

Pendiente de decisión de producto antes de fixear.

---

## BUG-07 — `Location` headers en `MangaController` apuntan a recursos inestables

**Severidad:** Media
**Archivo:** `MangaController.java:39,46,53,60`
**¿Fixeado?** No

### Descripción

Los POST de manga retornan `Location` apuntando a endpoints que no identifican unívocamente al evento creado:

```java
// :39 — registrarTacto
URI location = URI.create("/api/manga/" + req.getBovinoId() + "/ultimo-tacto");
```

`ultimo-tacto` devuelve "el último", no "el que se acaba de crear". Un segundo POST cambia el recurso al que apunta el `Location` del primer POST. Lo mismo para `ultimo-pesaje`, `ultimo-boqueo`. En `registrarVacunacion` el `Location` apunta a una colección (`/vacunaciones`), no a un recurso individual.

**Fix opciones:**
1. Agregar `GET /api/manga/eventos/{id}` y apuntar `Location` ahí.
2. Quitar el `Location` (no es obligatorio en 201, mejor omitirlo que devolverlo incorrecto).

---

## BUG-08 — `caravana` no se valida como solo dígitos

**Severidad:** Media (depende de regla de negocio)
**Archivos:** `Bovino.java:22-23`, `CrearBovinoRequest.java:13-14`, `CrearBovinoRapidoRequest.java:10-11`
**¿Fixeado?** No

### Descripción

El spec funcional (CU-02, RN-03) establece que la caravana electrónica son "hasta 15 dígitos". El código solo limita longitud:

```java
// Bovino.java:22
@Column(length = 15, nullable = false, unique = true)
private String caravana;
```

Y el DTO solo valida `@NotBlank`. Se puede crear un bovino con `caravana="abc"`, `"AR-1234"` o `"   "` (no es blank pero tampoco dígitos).

**Fix:**
```java
// CrearBovinoRequest.java + CrearBovinoRapidoRequest.java
@NotBlank
@Pattern(regexp = "\\d{1,15}", message = "La caravana debe contener entre 1 y 15 dígitos")
private String caravana;
```

Confirmar con producto si la regla es exactamente 15 dígitos o "hasta 15".

---

## BUG-09 — `RegistrarPesajeRequest.peso` es primitivo `double`

**Severidad:** Baja
**Archivo:** `RegistrarPesajeRequest.java:15-16`
**¿Fixeado?** No

### Descripción

```java
@Positive
private double peso;
```

Si el cliente omite `peso` en el JSON, Jackson asigna `0.0` por default y `@Positive` rechaza el request con 400 — funciona, pero el mensaje de error confunde ("debe ser positivo" en vez de "es obligatorio"). Tampoco se puede distinguir "no enviado" de "enviado como 0".

**Fix:**
```java
@NotNull
@Positive
private Double peso;
```

Adicionalmente, `PesajeServiceImpl.java:21-23` repite la validación que ya hace `@Positive`. Si el service siempre se invoca a través del controller con `@Valid`, la duplicación es defensa en profundidad aceptable. Si se quiere reducir, dejar solo la del DTO.

---

## BUG-10 — Spec técnico tiene una referencia incorrecta a BUG-05

**Severidad:** Baja
**Archivo:** `docs/technical-spec.md:423`
**¿Fixeado?** No

### Descripción

> "Los controllers nunca retornan `ResponseEntity.ok().build()` para operaciones sin cuerpo — usan `ResponseEntity.noContent().build()`. Fixea BUG-05 y BUG-06."

BUG-05 era sobre status 201 en creación (no se fixea con `noContent()`). Solo BUG-06 se fixea con `noContent()`.

**Fix:** corregir la oración a "Fixea BUG-06" (y, si se quiere, mencionar el `created()` en la línea inmediatamente anterior como fix de BUG-05).

---

## BUG-11 — `pom.xml` aún incluye Thymeleaf sin uso

**Severidad:** Baja
**Archivo:** `pom.xml:42-44,75-77`
**¿Fixeado?** No

### Descripción

El spec técnico (sección 2) marca explícitamente: "Thymeleaf sigue en deps pero sin uso. Candidato a eliminar." Sigue declarado tanto en runtime como en test:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
...
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf-test</artifactId>
    <scope>test</scope>
</dependency>
```

Sin templates Thymeleaf en el proyecto. Aporta peso al JAR y tiempo de arranque sin beneficio.

**Fix:** eliminar ambas dependencias del `pom.xml`.

---

## BUG-12 — `SecurityConfig` tiene nombre engañoso

**Severidad:** Baja
**Archivo:** `config/SecurityConfig.java`
**¿Fixeado?** No

### Descripción

La clase se llama `SecurityConfig` pero solo expone un `PasswordEncoder`. No hay nada de Spring Security configurado (no hay filter chain, no hay autorización, no hay autenticación). Quien busque la configuración de seguridad por el nombre va a creer que está y no lo está.

**Fix:** renombrar a `PasswordEncoderConfig` (o `CryptoConfig`). Cuando se incorpore Spring Security completo, crear un `SecurityConfig` nuevo con el filter chain real.

---

## BUG-13 — Listados sin paginación

**Severidad:** Baja
**Archivos:** `BovinoServiceImpl.java:93-95,98-100,103-106`, `BovinoController.java:23-28,90-95`, `EstablecimientoController.java:50-55`
**¿Fixeado?** No

### Descripción

`GET /api/bovinos`, `GET /api/bovinos/lotes/{lote}` y `GET /api/establecimientos/{id}/bovinos` retornan `findAll` / `findByX` completos. Para un establecimiento con miles de animales, la respuesta carga toda la tabla en memoria, la serializa entera y la manda en una sola respuesta HTTP.

El spec técnico menciona el caso ("miles de animales") en TD-08 como justificación para evitar `@OneToMany` en `Establecimiento`, pero los listados planos del controller quedan con el mismo riesgo.

**Fix:** incorporar `Pageable` en los métodos de service y controller, retornar `Page<BovinoResponse>`. Aplicar al menos a los endpoints de listado por establecimiento y por lote.

---

## BUG-14 — `@ManyToOne` con fetch EAGER por default

**Severidad:** Baja
**Archivos:** `Bovino.java:25-27`, `EventoSanitario.java:23-29`
**¿Fixeado?** No

### Descripción

Todas las asociaciones `@ManyToOne` están con fetch EAGER (default de JPA). Al listar bovinos o eventos hay joins implícitos que cargan `Establecimiento`, `Bovino` y `Usuario` aunque los mappers solo usen `getId()`:

```java
// BovinoMapper.java:14
b.getEstablecimiento() != null ? b.getEstablecimiento().getId() : null

// TactoMapper.java:14-15
t.getBovino().getId(),
t.getRegistradoPor().getIdUsuario(),
```

Con LAZY + acceso a la PK, Hibernate puede evitar el join (solo necesita el FK que ya tiene cargado en la entidad hija).

**Fix:**
```java
@ManyToOne(optional = false, fetch = FetchType.LAZY)
@JoinColumn(name = "establecimiento_id", nullable = false)
private Establecimiento establecimiento;
```

Aplicar a `Bovino.establecimiento`, `EventoSanitario.bovino`, `EventoSanitario.registradoPor`.

---

## Resumen

| ID | Componente afectado | Severidad | ¿Fixeado? |
|---|---|---|---|
| BUG-01 | `Usuario.email` sin `unique=true` en DB | Alta | ❌ No |
| BUG-02 | `Tacto` sin validación de coherencia situacion/periodo | Alta | ❌ No |
| BUG-03 | Borrar `Usuario`/`Bovino` con asociaciones → 500 por FK | Alta | ❌ No |
| BUG-04 | `@RequestParam` de lote/observaciones sin `@NotBlank` | Media | ❌ No |
| BUG-05 | `functional-spec.md` describe entidades eliminadas | Media | ❌ No |
| BUG-06 | Lotes globales en vez de scoped por establecimiento | Media | ❌ No |
| BUG-07 | `Location` headers en `MangaController` inestables | Media | ❌ No |
| BUG-08 | `caravana` no se valida como dígitos | Media | ❌ No |
| BUG-09 | `RegistrarPesajeRequest.peso` es primitivo `double` | Baja | ❌ No |
| BUG-10 | Spec técnico referencia incorrecta a BUG-05 | Baja | ❌ No |
| BUG-11 | `pom.xml` incluye Thymeleaf sin uso | Baja | ❌ No |
| BUG-12 | `SecurityConfig` nombre engañoso | Baja | ❌ No |
| BUG-13 | Listados sin paginación | Baja | ❌ No |
| BUG-14 | `@ManyToOne` con fetch EAGER por default | Baja | ❌ No |
