# El Pensadero

Un pensadero: los pensamientos sueltos que uno guarda, girando en una esfera de la que se puede sacar cualquiera.

Dos formas de entrar: **Esfera**, para dejarse llevar entre las hebras que orbitan sobre la cuenca, y **Archivo**, para buscar algo concreto en una lista por meses. El color de cada hebra dice de dónde vino el pensamiento — escrito, capturado por IA o llegado por SMS al pensadero viejo.

**[Ver sitio en vivo →](https://jorgenava.github.io/pensadero/)**

## Tech Stack

- **Framework** — Angular 18 (standalone components)
- **UI** — Angular Material 18, SCSS
- **Visualización** — Renderer propio (`src/app/sphere.ts`): reparto de Fibonacci, perspectiva y profundidad de campo, sin dependencias
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

Navegar a `http://localhost:4200/`.

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
│   ├── app.component.*          # Esfera, archivo, búsqueda y filtros
│   ├── app.config.ts            # HttpClient, animaciones y locale es-MX
│   ├── sphere.ts                # La esfera: Fibonacci, perspectiva y profundidad de campo
│   ├── thought.utils.ts         # Origen, recortes, agrupación por mes, normalización de tags
│   ├── highlight.pipe.ts        # Resalta coincidencias de búsqueda (escapa el texto antes)
│   ├── thoughts.service.ts      # Servicio para obtener pensamientos de la API
│   └── thought-dialog/          # El lector: un pensamiento a la vez, con navegación
├── environments/
│   ├── environment.ts           # Config local (gitignored)
│   └── environment.prod.ts      # Config producción (placeholders para CI)
└── styles.scss                  # Estilos globales y tema oscuro
```

## Funcionalidades

**Esfera**
- Cada pensamiento es una hebra de una sola línea: el texto se recorta en palabra completa según el ancho de la pantalla, así que nunca se encima ni se sale
- Profundidad de campo real: la distancia de cada hebra decide su tamaño, su opacidad, su desenfoque y quién tapa a quién — eso es lo que le da cuerpo a la nube
- Al apuntar una hebra la esfera frena y esa hebra sale del fondo, para poder atinarle
- La esfera se achata para llenar el área disponible, lo que además separa las hebras horizontalmente
- El tamaño va al revés de la extensión — los pensamientos de dos palabras se leen en grande
- El color dice el origen: plata (escrito), agua (IA), latón (SMS)
- Zoom con botones o scroll; slider de hebras por esfera; paginación con flechas del teclado

**Archivo**
- Tarjetas agrupadas por mes, en columnas que se acomodan al ancho
- Los pensamientos de una línea se componen en la serif, como aforismos
- Las coincidencias de búsqueda quedan resaltadas

**En las dos**
- Búsqueda por contenido o tag, con `/` para enfocar y `Esc` para limpiar
- Riel de temas: los 12 tags más usados, uniendo variantes de escritura ("Filosofía" / "Filosofia")
- `r` saca un pensamiento al azar
- Lector con navegación entre pensamientos (`←` / `→`), copiar y ver más del mismo tema

**Accesibilidad**
- Las hebras y las tarjetas se pueden enfocar y abrir con el teclado
- Foco visible en todo lo interactivo
- `prefers-reduced-motion` detiene la rotación y las ondas

## TO-DO

- [ ] Login / autenticación
- [ ] Separar pensamientos por perfiles (tabs/menú)
- [ ] CRUD de pensamientos (agregar, editar, eliminar)
- [ ] Búsqueda que ignore acentos
- [ ] Ver todos los tags, no solo los 12 más usados
