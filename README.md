# El Pensadero

Una aplicación web para visualizar pensamientos como una nube de palabras 3D interactiva. Los pensamientos orbitan en una esfera rotativa y al hacer clic en cualquiera se muestra su detalle completo.

**[Ver sitio en vivo →](https://jorgenava.github.io/pensadero/)**

## Tech Stack

- **Framework** — Angular 18 (standalone components)
- **UI** — Angular Material 18, SCSS
- **Visualización** — [TagCloud.js](https://github.com/mcc108/TagCloud) (esfera 3D de texto)
- **Backend** — API REST (AWS API Gateway + Lambda + DynamoDB)
- **Deploy** — GitHub Pages via GitHub Actions

## Desarrollo local

### Requisitos previos

- Node.js 20+
- npm

### Setup

```bash
npm install
```

Crear el archivo de entorno local `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'https://tu-api-url.execute-api.region.amazonaws.com',
  userId: 'tu-user-id'
};
```

> Este archivo está en `.gitignore` — los valores se inyectan en CI/CD via GitHub Secrets.

### Servidor de desarrollo

```bash
ng serve
```

Navegar a `http://localhost:4200/pensadero/`.

### Build de producción

```bash
ng build --configuration production
```

Los artefactos se generan en `dist/pensadero/`.

## Deployment

El proyecto se despliega automáticamente a GitHub Pages al hacer push a `main` mediante el workflow `.github/workflows/deploy.yml`.

### GitHub Secrets requeridos

Configurar en **Settings → Secrets and variables → Actions**:

| Secret | Descripción |
|---|---|
| `API_BASE_URL` | URL base de la API REST |
| `USER_ID` | ID del usuario para consultar pensamientos |

### Deploy manual

También se puede disparar manualmente desde la pestaña **Actions** del repositorio (workflow_dispatch).

## Estructura del proyecto

```
src/
├── app/
│   ├── app.component.*          # Componente principal (tag cloud + header + búsqueda)
│   ├── app.config.ts            # Configuración de la app (HttpClient, animations)
│   ├── thoughts.service.ts      # Servicio para obtener pensamientos de la API
│   └── thought-dialog/          # Diálogo de detalle de pensamiento
├── environments/
│   ├── environment.ts           # Config local (gitignored)
│   └── environment.prod.ts      # Config producción (placeholders para CI)
└── styles.scss                  # Estilos globales y tema oscuro
```

## Funcionalidades

- **Nube 3D** — Pensamientos visualizados como esfera interactiva rotativa
- **Zoom** — Acercar/alejar la esfera con botones (+/−) o scroll del mouse
- **Densidad ajustable** — Slider para controlar cuántos pensamientos muestra la esfera (3 hasta el total)
- **Búsqueda** — Filtrar pensamientos por contenido o tags en tiempo real
- **Pensamiento aleatorio** — Botón para abrir un pensamiento al azar
- **Detalle de pensamiento** — Diálogo con contenido, tags, fechas y metadata
- **Copiar contenido** — Botón para copiar texto del pensamiento al clipboard
- **Paginación** — Navegación por "esferas" de pensamientos
- **Responsive** — Adaptado para mobile y desktop
- **Loading state** — Indicador visual mientras se cargan los datos

## TO-DO

- [ ] Login / autenticación
- [ ] Separar pensamientos por perfiles (tabs/menú)
- [ ] CRUD de pensamientos (agregar, editar, eliminar)
- [ ] Filtrar por tags con chips interactivos
- [ ] Vista alternativa (lista/grid además de esfera)
