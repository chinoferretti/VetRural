# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


Para acceder a veterinario usar el mail vet@vetrural.com
Productor productor@campo.com
Admin admin@vetrural.com

 VetRural — Guía completa del proyecto


Cómo prenderlo

  npm run dev

  Se abre en http://localhost:5173. Entrás con cualquiera de las 3 cuentas demo (contraseña siempre 1234):

  ┌─────────────────────┬─────────────┬───────────────────────────────────┐
  │        Email        │     Rol     │              Qué ve               │
  ├─────────────────────┼─────────────┼───────────────────────────────────┤
  │ vet@vetrural.com    │ Veterinario │ Todo el sistema                   │
  ├─────────────────────┼─────────────┼───────────────────────────────────┤
  │ productor@campo.com │ Productor   │ Solo portal de hacienda (lectura) │
  ├─────────────────────┼─────────────┼───────────────────────────────────┤
  │ admin@vetrural.com  │ Admin       │ Todo                              │
  └─────────────────────┴─────────────┴───────────────────────────────────┘

  ---
  Estructura de carpetas explicada

  src/
  ├── api/              ← Capa de comunicación con el backend (stubs vacíos)
  ├── components/       ← Piezas de UI reutilizables
  ├── context/          ← Estado global (sesión del usuario)
  ├── data/             ← Datos falsos JSON (reemplazan la API mientras no hay backend)
  ├── pages/            ← Una carpeta = una pantalla
  └── utils/            ← Funciones helpers (formateo de fechas, colores, etc.)

  ---
  Cómo fluye la aplicación

  main.jsx
    └── App.jsx   (define todas las rutas con React Router)
          └── AuthProvider  (envuelve todo, guarda la sesión)
                ├── /login        → Login.jsx        (pública)
                └── PrivateRoute  (verifica si estás logueado y si tenés el rol)
                      └── Layout  (Sidebar + Navbar + contenido)
                            ├── /dashboard
                            ├── /animales
                            └── ... resto de páginas

  El flujo de login paso a paso:
  1. Entrás a cualquier ruta → PrivateRoute lee AuthContext
  2. Si no hay sesión → redirige a /login
  3. En Login escribís email+contraseña → AuthContext.login() busca en el mock
  4. Guarda el usuario en localStorage y en el estado global
  5. Te redirige a /dashboard (vet/admin) o /productor (productor)

  ---
  Cada archivo importante

  src/context/AuthContext.jsx
  El corazón de la autenticación. Guarda quién está logueado y expone:
  - usuario → objeto con nombre, email, rol, plan
  - login(email, pass) → valida y guarda sesión
  - logout() → limpia todo
  - tieneRol('veterinario', 'admin') → para condicionar UI

  src/components/PrivateRoute.jsx
  Guarda las rutas. Si no estás logueado te manda al login. Si estás logueado pero no tenés el rol correcto, te manda al
   dashboard.

  src/components/Layout.jsx
  El "esqueleto" de todas las páginas autenticadas: Sidebar izquierdo + Navbar arriba + contenido central. Maneja la
  apertura/cierre del sidebar en mobile.

  src/api/axios.js
  La instancia de Axios configurada para Spring Boot. Tiene dos interceptores:
  - Request: agarra el JWT de localStorage y lo agrega a cada pedido como Authorization: Bearer ...
  - Response: si el backend responde 401 Unauthorized, borra la sesión y manda al login

  src/data/*.json
  Datos de prueba. Cada página los importa directamente con import data from '../data/animales.json' y los carga con un
  setTimeout de 500ms para simular la espera de una API real.

  ---
  Las páginas

  ┌─────────────────┬───────────────────┬───────────────────────────────────────────────────────┐
  │      Ruta       │      Archivo      │                       Qué hace                        │
  ├─────────────────┼───────────────────┼───────────────────────────────────────────────────────┤
  │ /login          │ Login.jsx         │ Formulario + 3 botones de acceso rápido demo          │
  ├─────────────────┼───────────────────┼───────────────────────────────────────────────────────┤
  │ /dashboard      │ Dashboard.jsx     │ 4 métricas + alertas del rodeo + últimas visitas      │
  ├─────────────────┼───────────────────┼───────────────────────────────────────────────────────┤
  │ /animales       │ Animales.jsx      │ Grid con filtros (búsqueda + lote + estado sanitario) │
  ├─────────────────┼───────────────────┼───────────────────────────────────────────────────────┤
  │ /animales/nuevo │ NuevoAnimal.jsx   │ Formulario completo (foto, vacunas, datos clínicos)   │
  ├─────────────────┼───────────────────┼───────────────────────────────────────────────────────┤
  │ /animales/:id   │ DetalleAnimal.jsx │ Detalle con 3 tabs: info / historial / vacunas        │
  ├─────────────────┼───────────────────┼───────────────────────────────────────────────────────┤
  │ /historial      │ Historial.jsx     │ Lista de visitas expandibles con tratamientos         │
  ├─────────────────┼───────────────────┼───────────────────────────────────────────────────────┤
  │ /metricas       │ Metricas.jsx      │ 4 gráficos Recharts + alertas activas                 │
  ├─────────────────┼───────────────────┼───────────────────────────────────────────────────────┤
  │ /partes         │ Partes.jsx        │ Tabla de partes + descarga PDF simulada               │
  ├─────────────────┼───────────────────┼───────────────────────────────────────────────────────┤
  │ /productor      │ Productor.jsx     │ Vista de solo lectura para el dueño del campo         │
  └─────────────────┴───────────────────┴───────────────────────────────────────────────────────┘

  ---
  Los componentes reutilizables

  - AnimalCard → tarjeta clicable de un animal con estado sanitario, peso, lote
  - MetricCard → número grande con icono y borde de color (usado en dashboard y métricas)
  - AlertaBadge → bolita de color + texto (Sano / Alerta / Crítico)
  - LoadingSpinner → spinner centrado mientras cargan datos
  - Sidebar → navegación lateral, cambia los links según el rol, badge del plan
  - Navbar → barra superior con botón de menú (mobile) y datos del usuario

  ---
  Colores del sistema

  Definidos como variables CSS en src/index.css, accesibles desde cualquier archivo:

  --verde-oscuro: #1B4332   ← sidebar, títulos principales
  --verde-medio:  #2D6A4F   ← botones primarios, links activos
  --verde-claro:  #52B788   ← acentos, badges "sano"
  --crema:        #F8F4E3   ← fondo general de la app
  --marron:       #6B4226   ← gráfico de peso
  --acento:       #95D5B2   ← textos secundarios en sidebar

  ---
  Cómo conectar el backend cuando esté listo

  Solo hay que hacer 3 cosas:

  ├─────────────────┼───────────────────┼───────────────────────────────────────────────────────┤
  │ /dashboard      │ Dashboard.jsx     │ 4 métricas + alertas del rodeo + últimas visitas      │
  ├─────────────────┼───────────────────┼───────────────────────────────────────────────────────┤
  │ /animales       │ Animales.jsx      │ Grid con filtros (búsqueda + lote + estado sanitario) │
  ├─────────────────┼───────────────────┼───────────────────────────────────────────────────────┤
  │ /animales/nuevo │ NuevoAnimal.jsx   │ Formulario completo (foto, vacunas, datos clínicos)   │
  ├─────────────────┼───────────────────┼───────────────────────────────────────────────────────┤
  │ /animales/:id   │ DetalleAnimal.jsx │ Detalle con 3 tabs: info / historial / vacunas        │
  ├─────────────────┼───────────────────┼───────────────────────────────────────────────────────┤
  │ /historial      │ Historial.jsx     │ Lista de visitas expandibles con tratamientos         │
  ├─────────────────┼───────────────────┼───────────────────────────────────────────────────────┤
  │ /metricas       │ Metricas.jsx      │ 4 gráficos Recharts + alertas activas                 │
  ├─────────────────┼───────────────────┼───────────────────────────────────────────────────────┤
  │ /partes         │ Partes.jsx        │ Tabla de partes + descarga PDF simulada               │
  ├─────────────────┼───────────────────┼───────────────────────────────────────────────────────┤
  │ /productor      │ Productor.jsx     │ Vista de solo lectura para el dueño del campo         │
  └─────────────────┴───────────────────┴───────────────────────────────────────────────────────┘

  ---
  Los componentes reutilizables

  - AnimalCard → tarjeta clicable de un animal con estado sanitario, peso, lote
  - MetricCard → número grande con icono y borde de color (usado en dashboard y métricas)
  - AlertaBadge → bolita de color + texto (Sano / Alerta / Crítico)
  - LoadingSpinner → spinner centrado mientras cargan datos
  - Sidebar → navegación lateral, cambia los links según el rol, badge del plan
  - Navbar → barra superior con botón de menú (mobile) y datos del usuario

  ---
  Colores del sistema

  Definidos como variables CSS en src/index.css, accesibles desde cualquier archivo:

  --verde-oscuro: #1B4332   ← sidebar, títulos principales
  --verde-medio:  #2D6A4F   ← botones primarios, links activos
  --verde-claro:  #52B788   ← acentos, badges "sano"
  --crema:        #F8F4E3   ← fondo general de la app
  --marron:       #6B4226   ← gráfico de peso
  --acento:       #95D5B2   ← textos secundarios en sidebar

  ---
  Cómo conectar el backend cuando esté listo

  Solo hay que hacer 3 cosas:

  1. Descomentar las funciones en src/api/animalesApi.js, authApi.js, etc.
  2. Reemplazar los imports de mock en cada página:
  // Antes (mock):
  import animalesData from '../data/animales.json';

  // Después (API real):
  import { getAnimales } from '../api/animalesApi';
  3. Cambiar el useEffect de cada página para llamar la API en vez del JSON.

  El interceptor JWT ya está funcionando — en cuanto el backend devuelva un token real en el login, se va a adjuntar solo en cada request.

  ---
  Scripts disponibles

  npm run dev      # servidor de desarrollo con hot reload
  npm run build    # build de producción (genera carpeta dist/)
  npm run preview  # previsualizar el build de producción