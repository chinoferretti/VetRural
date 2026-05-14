# Bug Report — VetRural API

Fecha: 2026-05-13
Versión testeada: Spring Boot 4.0.6 / SQLite
Rama: `test`
Revisión: análisis estático completo (entidades, controllers, services, repositories, mappers, DTOs, pom.xml)

---

## BUG-01 — `pom.xml` declara Spring Boot 4.0.6, versión inexistente

**Severidad:** Crítica
**Archivo:** `pom.xml:8`
**¿Fixeado?** No

### Descripción

La versión `4.0.6` de `spring-boot-starter-parent` no existe en Maven Central ni en ningún repositorio público conocido. La versión estable más reciente de Spring Boot es la serie 3.x. Al ejecutar `mvn install` o `mvn spring-boot:run`, Maven no puede resolver el POM padre y el build falla antes de compilar una sola línea.

```xml
<!-- ACTUAL — versión inexistente -->
<version>4.0.6</version>

<!-- CORRECTO (usar versión estable real) -->
<version>3.3.5</version>
```

---

## BUG-02 — `pom.xml` declara dependencias de test que no existen en Maven

**Severidad:** Crítica
**Archivo:** `pom.xml:64-74`
**¿Fixeado?** No

### Descripción

Los tres artefactos declarados en scope `test` no existen en Maven Central para ninguna versión de Spring Boot:

- `spring-boot-starter-jdbc-test`
- `spring-boot-starter-thymeleaf-test`
- `spring-boot-starter-webmvc-test`

El artefacto estándar para testing en Spring Boot es `spring-boot-starter-test` (incluye JUnit 5, MockMvc, AssertJ). Adicionalmente, `spring-boot-starter-webmvc` (línea 47) tampoco existe: el artefacto correcto es `spring-boot-starter-web`.

```xml
<!-- CORRECTO -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

---

## BUG-03 — No existe `application.properties`: la app no puede arrancar

**Severidad:** Crítica
**Archivo:** `src/main/resources/` (ausente)
**¿Fixeado?** No

### Descripción

No hay ningún archivo de configuración (`application.properties` o `application.yml`) en el proyecto. Sin él, Spring Boot no sabe:

- La URL del datasource SQLite (`spring.datasource.url`)
- El dialecto de Hibernate para SQLite (`spring.jpa.database-platform`)
- La estrategia de DDL (`spring.jpa.hibernate.ddl-auto`)

La aplicación lanza `BeanCreationException` al intentar iniciar y no llega a atender ningún request.

```properties
# Ejemplo mínimo necesario
spring.datasource.url=jdbc:sqlite:vetrural.db
spring.datasource.driver-class-name=org.sqlite.JDBC
spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect
spring.jpa.hibernate.ddl-auto=update
```

---

## BUG-04 — `EstablecimientoService` accede a colecciones lazy fuera de transacción

**Severidad:** Alta
**Archivos:** `EstablecimientoService.java:39-55`, `UsuarioService.java:45-47`
**¿Fixeado?** No

### Descripción

Tres métodos acceden a colecciones `@ManyToMany` (cargadas lazy por defecto) después de que la transacción del `findById` ya se cerró. Esto lanza `LazyInitializationException` cuando `spring.jpa.open-in-view=false`.

```java
// EstablecimientoService.java:39 — asociarUsuario
Establecimiento e = obtenerOFallar(idEstablecimiento); // transacción cerrada
if (!e.getUsuarios().contains(u)) { // <-- LazyInitializationException aquí
    e.getUsuarios().add(u);

// EstablecimientoService.java:50 — desasociarUsuario
Establecimiento e = obtenerOFallar(idEstablecimiento);
e.getUsuarios().removeIf(...)  // <-- LazyInitializationException aquí

// UsuarioService.java:45 — getEstablecimientos
return obtenerOFallar(idUsuario).getEstablecimientos(); // <-- LazyInitializationException aquí
```

Solución: agregar `@Transactional` a estos tres métodos.

---

## BUG-05 — `BovinoService.crearLote` y `eliminarLote` no son atómicos

**Severidad:** Alta
**Archivo:** `BovinoService.java:86-103`
**¿Fixeado?** No

### Descripción

Ambos métodos iteran sobre bovinos y ejecutan un `save` por cada uno en una transacción separada (la propia del repositorio). Si el proceso falla en la iteración número N, los primeros N-1 bovinos ya fueron persistidos. El lote queda asignado o eliminado parcialmente sin posibilidad de rollback.

```java
// ACTUAL — cada save es una transacción independiente
public void crearLote(String nombre, List<String> idBovinos) {
    idBovinos.forEach(id -> bovinoRepository.findById(id).ifPresent(b -> {
        b.setLote(nombre);
        bovinoRepository.save(b); // commit parcial
    }));
}
```

Solución: anotar ambos métodos con `@Transactional`.

---

## BUG-06 — Todos los endpoints de creación retornan HTTP 200 en vez de 201

**Severidad:** Media
**Archivos:** `BovinoController.java`, `EstablecimientoController.java`, `UsuarioController.java`
**¿Fixeado?** No

### Descripción

Los endpoints `POST` que crean recursos usan `ResponseEntity.ok()` (HTTP 200). El estándar REST especifica que la creación de un recurso debe responder con HTTP 201 Created e idealmente incluir el header `Location` apuntando al recurso creado. Cualquier cliente REST convencional que dependa del código de respuesta para saber si se creó o ya existía recibirá información incorrecta.

```java
// ACTUAL — incorrecto
return ResponseEntity.ok(BovinoMapper.toResponse(bovino));

// CORRECTO
URI location = URI.create("/api/bovinos/" + bovino.getIdAnimal());
return ResponseEntity.created(location).body(BovinoMapper.toResponse(bovino));
```

Afecta: `POST /api/bovinos`, `POST /api/bovinos/rapido`, `POST /api/establecimientos`, `POST /api/usuarios`.

---

## BUG-07 — Endpoint `DELETE /api/bovinos/{id}` no existe aunque el servicio sí lo implementa

**Severidad:** Media
**Archivo:** `BovinoController.java` (ausencia), `BovinoService.java:48`
**¿Fixeado?** No

### Descripción

`BovinoService.eliminarBovino(String id)` está implementado pero ningún endpoint del controller lo expone. Un bovino creado no puede ser eliminado por la API.

```java
// BovinoService.java:48 — existe pero es inalcanzable desde HTTP
public void eliminarBovino(String id) {
    bovinoRepository.deleteById(id);
}
```

---

## BUG-08 — `POST /api/manga/tacto` acepta `situacion = Preñada` con `periodo = null`

**Severidad:** Media
**Archivo:** `RegistrarTactoRequest.java`, `TactoService.java:21`
**¿Fixeado?** No

### Descripción

Desde el punto de vista veterinario, si una vaca es diagnosticada como `Preñada`, el campo `periodo` (trimestre de gestación) es obligatorio. Sin embargo, `periodo` en el DTO y en la entidad no tiene restricción `nullable = false` ni validación condicional. Se puede registrar un tacto `Preñada` con `periodo = null`, generando datos de gestión incompletos.

```java
// Tacto.java:18 — nullable implícito
@Enumerated(EnumType.STRING)
private PeriodoEnum periodo; // sin @Column(nullable = false)

// No existe lógica en TactoService que valide periodo != null cuando situacion == Preñada
```

---

## BUG-09 — `Bovino.idAnimal` acepta IDs de más de 15 caracteres sin validación temprana

**Severidad:** Media
**Archivos:** `Bovino.java:19`, `CrearBovinoRequest.java`, `CrearBovinoRapidoRequest.java`
**¿Fixeado?** No

### Descripción

La entidad declara `@Column(length = 15)` para `idAnimal` (caravana electrónica de hasta 15 dígitos). Sin embargo, los DTOs de creación no tienen `@Size(max = 15)` ni ninguna otra validación. Si se envía un ID de 16+ caracteres, el error ocurre en la capa de base de datos y retorna un 500 en vez de un 400 descriptivo.

```java
// Bovino.java:19
@Column(length = 15, nullable = false, unique = true)
private String idAnimal;

// CrearBovinoRequest.java — sin validación
private String id; // podría ser "1234567890123456" (16 chars) → 500
```

---

## BUG-10 — `SituacionEnum` contiene caracteres no-ASCII en los nombres de constantes

**Severidad:** Media
**Archivo:** `SituacionEnum.java`
**¿Fixeado?** No

### Descripción

Dos constantes del enum usan caracteres especiales del español:

```java
public enum SituacionEnum {
    Preñada,      // 'ñ'
    Frigorífico,  // 'í'
    ...
}
```

Jackson serializa el enum usando `Enum.name()`, que incluye los caracteres especiales. El `pom.xml` no declara `<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>`, por lo que Maven puede compilar el archivo con la codificación del sistema operativo (en Windows: Cp1252). Si hay discrepancia de encoding entre compilación y runtime, `Enum.valueOf("Frigorífico")` nunca matchea con la constante interna, lanzando `IllegalArgumentException` (500 → 400 vía handler). También genera problemas en clientes que no esperan caracteres Unicode en nombres de enum.

---

## BUG-11 — `GlobalExceptionHandler` no captura errores de deserialización Jackson

**Severidad:** Media
**Archivo:** `GlobalExceptionHandler.java`
**¿Fixeado?** No

### Descripción

Si un cliente envía un valor de enum inválido (ej. `"situacion": "INVALIDA"`), Jackson lanza `HttpMessageNotReadableException`, que no está registrada en el `GlobalExceptionHandler`. Spring Boot devuelve su respuesta de error por defecto (con formato diferente al definido en el handler), rompiendo la consistencia de la API.

```java
// GlobalExceptionHandler.java — falta este handler
@ExceptionHandler(HttpMessageNotReadableException.class)
public ResponseEntity<Map<String, String>> handleBadJson(HttpMessageNotReadableException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(Map.of("error", "Valor inválido en el cuerpo del request: " + ex.getMessage()));
}
```

---

## BUG-12 — `EventoSanitarioMapper` usa `getClass().getSimpleName()` — riesgo con proxies Hibernate

**Severidad:** Baja
**Archivo:** `EventoSanitarioMapper.java:13`
**¿Fixeado?** No

### Descripción

```java
e.getClass().getSimpleName()
```

Con `InheritanceType.JOINED`, Hibernate generalmente instancia las subclases correctamente. Sin embargo, si en algún contexto Hibernate envuelve la entidad en un proxy de instrumentación (ej. `Tacto$HibernateProxy$...`), `getSimpleName()` devuelve el nombre de la clase proxy en vez de `"Tacto"`. El campo `tipo` del response llegaría al cliente con un valor como `"Tacto$HibernateProxy$a1b2c3"`.

---

## BUG-13 — `EstablecimientoResponse` omite la lista de usuarios asociados

**Severidad:** Baja
**Archivos:** `EstablecimientoMapper.java`, `EstablecimientoResponse.java`
**¿Fixeado?** No

### Descripción

`EstablecimientoMapper.toResponse` solo mapea `id` y `nombre`. Tras llamar a `POST /api/establecimientos/{id}/usuarios/{usuarioId}` para asociar un usuario, no hay forma de verificar la asociación mediante la respuesta del establecimiento. La información de usuarios siempre llega vacía en la respuesta.

---

## BUG-14 — Contraseñas almacenadas en texto plano

**Severidad:** Baja (seguridad)
**Archivos:** `UsuarioService.java:24`, `Usuario.java`
**¿Fixeado?** No

### Descripción

El campo `contrasena` se persiste directamente en la base de datos sin ningún tipo de hash. Cualquier acceso al archivo SQLite expone todas las contraseñas en claro.

```java
// UsuarioService.java:24 — sin hashing
u.setContrasena(contrasena);
```

---

## Resumen

| ID | Componente afectado | Severidad | ¿Fixeado? |
|---|---|---|---|
| BUG-01 | `pom.xml` — Spring Boot 4.0.6 inexistente | Crítica | ❌ No |
| BUG-02 | `pom.xml` — dependencias test inexistentes | Crítica | ❌ No |
| BUG-03 | `application.properties` ausente | Crítica | ❌ No |
| BUG-04 | `EstablecimientoService` / `UsuarioService` — lazy loading sin `@Transactional` | Alta | ❌ No |
| BUG-05 | `BovinoService.crearLote` / `eliminarLote` — operaciones no atómicas | Alta | ❌ No |
| BUG-06 | Todos los POST retornan HTTP 200 en vez de 201 | Media | ❌ No |
| BUG-07 | `DELETE /api/bovinos/{id}` no expuesto en controller | Media | ❌ No |
| BUG-08 | Tacto `Preñada` acepta `periodo = null` | Media | ❌ No |
| BUG-09 | `Bovino.idAnimal` sin validación de longitud en DTO | Media | ❌ No |
| BUG-10 | `SituacionEnum` con caracteres no-ASCII (`ñ`, `í`) | Media | ❌ No |
| BUG-11 | `GlobalExceptionHandler` no captura `HttpMessageNotReadableException` | Media | ❌ No |
| BUG-12 | `EventoSanitarioMapper` usa `getSimpleName()` — riesgo proxy Hibernate | Baja | ❌ No |
| BUG-13 | `EstablecimientoResponse` omite usuarios | Baja | ❌ No |
| BUG-14 | Contraseñas en texto plano | Baja | ❌ No |
