# Changelog

Todos los cambios relevantes de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

### Fixed
- **Hebras ilegibles en la esfera** — Se le estaba pasando a TagCloud el texto completo de cada pensamiento (hasta 1,759 caracteres). Los párrafos se envolvían y se encimaban unos sobre otros hasta que no se leía nada. Ahora cada hebra es una sola línea recortada en palabra completa: 46 caracteres en desktop, 28 en tablet, 18 en teléfono.
- **Instancias de TagCloud acumuladas** — Cada cambio de página creaba una nube nueva sin destruir la anterior; los loops de animación viejos seguían corriendo sobre elementos ya borrados. Ahora se llama `destroy()` antes de reconstruir.
- **Tarjetas desbordadas** — Faltaba `box-sizing: border-box` global, así que el texto de las tarjetas se salía del borde derecho.
- **Slider de densidad hasta 194** — El máximo era el total de pensamientos, un valor sin sentido para una esfera. Ahora va de 6 a 34.
- **Estilos de la esfera que nunca aplicaban** — Las reglas de hover y sombra apuntaban a elementos inyectados por TagCloud, fuera de la encapsulación de Angular.
- **Presupuesto de estilos en el build de producción** — Subido a 14 kB / 20 kB por componente; el build de CI fallaba.

### Added
- **Vista Archivo** — Tarjetas agrupadas por mes para leer y buscar de verdad, además de la esfera para dejarse llevar. Los pensamientos de una línea se componen en la serif.
- **Riel de temas** — Los 12 tags más usados como filtro, uniendo variantes de escritura ("Filosofía" / "Filosofia", "Proyectos Personales" / "Proyectos personales").
- **El color dice el origen** — Plata para lo escrito, agua para lo que capturó la IA, latón para lo que llegó por SMS al pensadero viejo. Con leyenda en el pie.
- **Peso por brevedad** — Los pensamientos más cortos se leen más grandes en la esfera.
- **Lector con navegación** — `←` / `→` para moverse entre pensamientos sin cerrar, y los tags abren el archivo filtrado por ese tema.
- **Resaltado de búsqueda** — Las coincidencias quedan marcadas en las tarjetas (`HighlightPipe`, que escapa el texto antes de marcarlo).
- **Atajos de teclado** — `/` enfoca la búsqueda, `Esc` la limpia, `r` saca uno al azar, `←` / `→` cambian de esfera.
- **Accesibilidad** — Hebras y tarjetas enfocables y abribles con teclado, foco visible, `prefers-reduced-motion` detiene la rotación y las ondas.
- **Estado de error** — Mensaje propio cuando la API no responde, en vez de una pantalla vacía.
- **Locale es-MX** — Fechas en español.
- **Pruebas reales** — 27 specs sobre recortes, origen, paginación de la API y navegación del lector. Las que había probaban un `title` que nunca existió.

### Changed
- **Identidad visual** — Del violeta genérico sobre negro a la metáfora del pensadero: cuenca de piedra, líquido plateado, canto de latón. Tipografías Fraunces (display), Inter Tight (interfaz) y JetBrains Mono (fechas y datos).
- **La cuenca** — La esfera ahora sale de una poza de luz con ondas lentas, dimensionada a partir del radio real de la esfera para que las dos se lean como una sola cosa.
- **Paginador y slider de Material reemplazados** — Controles propios; se fueron los overrides con `!important`.
- **Diálogo de detalle** — Ahora es un lector: la primera oración en grande, el resto en cuerpo, metadata reducida a origen y fecha.
- **Móvil** — Radio y longitud de hebra calculados contra el viewport; ya no se salen las frases por los lados.

## [0.1.0] — Rediseño anterior

### Added
- **Tema oscuro** — Rediseño completo con gradiente indigo/púrpura, glassmorphism y glow ambiental
- **Búsqueda** — Barra de búsqueda en el header para filtrar pensamientos por contenido o tags en tiempo real
- **Pensamiento aleatorio** — Botón (icono dado) para abrir un pensamiento al azar
- **Copiar contenido** — Botón en el diálogo de detalle para copiar texto al clipboard
- **Loading state** — Spinner animado mientras se cargan los datos desde la API
- **Empty state** — Mensajes diferenciados cuando no hay resultados de búsqueda vs sin pensamientos
- **Contador de pensamientos** — Badge en el header mostrando el total filtrado
- **Zoom** — Botones +/− y scroll del mouse para acercar/alejar la esfera (40%–200%)
- **Densidad ajustable** — Slider en el footer para controlar pensamientos por esfera (3 hasta el total)
- **Auto-escalado** — Radio y font-size se ajustan automáticamente según la cantidad de pensamientos
- **GitHub Actions workflow** — Deploy automático a GitHub Pages al hacer push a `main` (`.github/workflows/deploy.yml`)
- **Environment secrets** — `environment.prod.ts` con placeholders inyectados en CI/CD via GitHub Secrets
- **fileReplacements** — Configuración en `angular.json` para swappear environments en build de producción
- **Tipografía mejorada** — Space Grotesk (UI), DM Serif Display (headings), Inter (esfera), JetBrains Mono (código), Material Symbols Outlined (iconos)
- **Paleta de la esfera** — 3 colores (lavender, violet, pale slate) con distribución aleatoria ponderada

### Changed
- **Header** — Rediseñado con logo (icono psychology), título con gradiente, y acciones (búsqueda + random)
- **Responsive mobile** — Header en dos filas (logo + search), búsqueda full-width, controles compactos, diálogo ajustado al viewport
- **Diálogo de pensamiento** — Rediseñado con tema oscuro, iconos en metadata, tags estilizados y botón de copiar
- **Tag cloud** — Velocidad ajustada a `normal`, radio optimizado (350px desktop / 180px mobile), hover con glow
- **Paginador** — Estilizado para tema oscuro con colores del tema
- **Estilos globales** — Variables CSS custom, scrollbar personalizado, animaciones (fadeIn, pulseGlow, shimmer)
- **Error handling** — El loading state se desactiva también cuando la API falla

### Security
- **`environment.ts` en .gitignore** — Los valores sensibles (apiBaseUrl, userId) ya no se comitean al repo

## [0.0.0] — 2024-09-13

### Added
- Proyecto Angular 18 inicial con standalone components
- Integración con API REST para obtener pensamientos
- Visualización 3D con TagCloud.js
- Diálogo de detalle de pensamiento con tags, fechas y metadata
- Paginación por esferas con label personalizado
- Angular Material (tema azure-blue)
- Responsive básico (mobile vs desktop)
- Fuente de datos: API REST (AWS API Gateway + Lambda + DynamoDB)
