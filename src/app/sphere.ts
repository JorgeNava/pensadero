/**
 * La esfera de pensamientos.
 *
 * Reemplaza a TagCloud, que resolvía la rotación pero no dejaba tocar la
 * profundidad: todas las hebras salían igual de nítidas, así que la nube se
 * leía como texto disperso en un plano y no como un volumen.
 *
 * Aquí cada hebra sabe qué tan lejos está, y eso decide su tamaño, su
 * opacidad, su desenfoque y quién tapa a quién. Eso es lo que le da cuerpo.
 */

export type Weight = 'lg' | 'md' | 'sm';

export interface SphereEntry {
  label: string;
  /** Clase de origen: from-self | from-ai | from-sms. */
  origin: string;
  weight: Weight;
  /** Texto completo, para el tooltip y el lector de pantalla. */
  full: string;
  onSelect: () => void;
}

export interface SphereOptions {
  /**
   * Radios por eje. El área disponible casi nunca es cuadrada, así que la
   * esfera se achata para llenarla: además de aprovechar el ancho, separa las
   * hebras horizontalmente, que es donde se estorban (cada una es una línea).
   * La profundidad sigue saliendo de z normalizado, así que el volumen se lee
   * igual aunque los radios difieran.
   */
  radiusX: number;
  radiusY: number;
  /** Sobre qué área se mide el puntero para dirigir el giro. */
  surface: HTMLElement;
  /** Desenfoque máximo del fondo, en px. En pantallas chicas conviene menos:
   *  el texto ya es pequeño y se vuelve ilegible antes. */
  depthBlur: number;
  reducedMotion: boolean;
}

interface Strand {
  el: HTMLElement;
  x: number;
  y: number;
  z: number;
  focused: boolean;
  lastBlur: number;
}

/**
 * Qué tan lejos está la cámara, en múltiplos del radio. Más chico, más fuga —
 * pero también más se estira la esfera hacia el frente, y hay que encogerla
 * para que quepa. 3.4 es el punto donde se nota el volumen sin desperdiciar
 * la mitad del área.
 */
const CAMERA = 3.4;

/** Cuánto crece la hebra más cercana. El componente lo usa para dimensionar. */
export const MAX_SCALE = CAMERA / (CAMERA - 1);
/** Giro en reposo: lento y en diagonal, para que nunca se vea estático. */
const IDLE_X = -0.0007;
const IDLE_Y = 0.0018;
const MAX_SPEED = 0.011;
/** Qué tan rápido la velocidad alcanza a su objetivo. */
const EASE = 0.12;

/**
 * Reparte n puntos parejo sobre la esfera con la espiral de Fibonacci.
 * Importa: repartir al azar deja huecos y amontonamientos, y las hebras
 * amontonadas se encimaban unas sobre otras.
 */
export function fibonacciSphere(n: number): Array<{ x: number; y: number; z: number }> {
  if (n <= 0) return [];
  if (n === 1) return [{ x: 0, y: 0, z: 1 }];

  const golden = Math.PI * (3 - Math.sqrt(5));
  const points = [];

  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    points.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r });
  }
  return points;
}

/** Proyecta un punto ya rotado. `depth` va de 0 (al fondo) a 1 (al frente). */
export function project(z: number): { scale: number; depth: number } {
  return {
    scale: CAMERA / (CAMERA - z),
    depth: (z + 1) / 2,
  };
}

export class ThoughtSphere {
  private strands: Strand[] = [];
  private angleX = -0.3;
  private angleY = 0.5;
  private velX = IDLE_X;
  private velY = IDLE_Y;
  private targetX = IDLE_X;
  private targetY = IDLE_Y;
  private frame = 0;
  private held = false;
  private teardown: Array<() => void> = [];

  constructor(
    private host: HTMLElement,
    entries: SphereEntry[],
    private opts: SphereOptions,
  ) {
    host.style.position = 'relative';
    host.style.width = `${opts.radiusX * 2}px`;
    host.style.height = `${opts.radiusY * 2}px`;

    const points = fibonacciSphere(entries.length);

    entries.forEach((entry, i) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = `strand ${entry.origin} w-${entry.weight}`;
      el.textContent = entry.label;
      el.title = entry.full;
      el.setAttribute('aria-label', `Abrir pensamiento: ${entry.full}`);

      el.addEventListener('click', entry.onSelect);
      // Al apuntarle, la esfera se frena: si no, atinarle es cuestión de suerte.
      el.addEventListener('pointerenter', () => this.hold(i, true));
      el.addEventListener('pointerleave', () => this.hold(i, false));
      el.addEventListener('focus', () => this.hold(i, true));
      el.addEventListener('blur', () => this.hold(i, false));

      host.appendChild(el);
      this.strands.push({ el, ...points[i], focused: false, lastBlur: -1 });
    });

    this.listen();
    this.paint();
    if (!opts.reducedMotion) this.frame = requestAnimationFrame(this.step);
  }

  destroy() {
    cancelAnimationFrame(this.frame);
    this.teardown.forEach((off) => off());
    this.teardown = [];
    this.strands = [];
    this.host.replaceChildren();
  }

  // ── giro ──

  private listen() {
    const { surface } = this.opts;

    const move = (event: PointerEvent) => {
      if (this.held) return;
      const rect = surface.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
      const dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
      this.targetY = clamp(dx * 2 * MAX_SPEED, MAX_SPEED);
      this.targetX = clamp(-dy * 2 * MAX_SPEED, MAX_SPEED);
    };

    const rest = () => {
      if (this.held) return;
      this.targetX = IDLE_X;
      this.targetY = IDLE_Y;
    };

    surface.addEventListener('pointermove', move);
    surface.addEventListener('pointerleave', rest);
    this.teardown.push(() => {
      surface.removeEventListener('pointermove', move);
      surface.removeEventListener('pointerleave', rest);
    });
  }

  private hold(index: number, on: boolean) {
    const strand = this.strands[index];
    if (!strand) return;
    strand.focused = on;
    strand.lastBlur = -1;
    this.held = this.strands.some((s) => s.focused);
    if (this.held) {
      this.targetX = 0;
      this.targetY = 0;
    } else {
      this.targetX = IDLE_X;
      this.targetY = IDLE_Y;
    }
    if (this.opts.reducedMotion) this.paint();
  }

  private step = () => {
    this.velX += (this.targetX - this.velX) * EASE;
    this.velY += (this.targetY - this.velY) * EASE;
    this.angleX += this.velX;
    this.angleY += this.velY;
    this.paint();
    this.frame = requestAnimationFrame(this.step);
  };

  private paint() {
    const { radiusX, radiusY } = this.opts;
    const sinX = Math.sin(this.angleX);
    const cosX = Math.cos(this.angleX);
    const sinY = Math.sin(this.angleY);
    const cosY = Math.cos(this.angleY);

    for (const strand of this.strands) {
      // Giro sobre Y, luego sobre X.
      const x1 = strand.x * cosY + strand.z * sinY;
      const z1 = strand.z * cosY - strand.x * sinY;
      const y1 = strand.y * cosX - z1 * sinX;
      const z2 = strand.y * sinX + z1 * cosX;

      const { scale, depth } = project(z2);
      const el = strand.el;

      el.style.transform =
        `translate(-50%, -50%) ` +
        `translate(${(x1 * radiusX * scale).toFixed(1)}px, ${(y1 * radiusY * scale).toFixed(1)}px) ` +
        `scale(${scale.toFixed(3)})`;
      // El fondo se atenúa, pero sigue siendo legible: es fondo, no ausencia.
      el.style.opacity = strand.focused ? '1' : (0.32 + depth * 0.68).toFixed(3);
      el.style.zIndex = String(strand.focused ? 999 : (depth * 500) | 0);

      // Profundidad de campo: lo de atrás se desenfoca, lo de adelante corta.
      // Solo se reescribe cuando cambia lo suficiente para notarse.
      const blur = strand.focused ? 0 : (1 - depth) * (1 - depth) * this.opts.depthBlur;
      if (Math.abs(blur - strand.lastBlur) > 0.1) {
        strand.lastBlur = blur;
        el.style.filter = blur < 0.15 ? '' : `blur(${blur.toFixed(2)}px)`;
      }
    }
  }
}

function clamp(value: number, limit: number): number {
  return Math.max(-limit, Math.min(limit, value));
}
