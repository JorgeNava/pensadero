# Changelog

Todos los cambios relevantes de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

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
