import { fibonacciSphere, project, MAX_SCALE, ThoughtSphere, SphereEntry } from './sphere';

describe('fibonacciSphere', () => {
  it('no truena con listas vacías o de uno', () => {
    expect(fibonacciSphere(0)).toEqual([]);
    expect(fibonacciSphere(1).length).toBe(1);
  });

  it('deja todos los puntos sobre la superficie de la esfera unitaria', () => {
    for (const p of fibonacciSphere(24)) {
      const r = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
      expect(r).toBeCloseTo(1, 5);
    }
  });

  it('reparte parejo en vez de amontonar, que es lo que encimaba las hebras', () => {
    const points = fibonacciSphere(30);
    let closest = Infinity;

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dz = points[i].z - points[j].z;
        closest = Math.min(closest, Math.sqrt(dx * dx + dy * dy + dz * dz));
      }
    }
    // Con 30 puntos parejos, el par más cercano no baja de ~0.35 de radio.
    expect(closest).toBeGreaterThan(0.3);
  });

  it('cubre los dos polos', () => {
    const ys = fibonacciSphere(20).map((p) => p.y);
    expect(Math.min(...ys)).toBeCloseTo(-1, 5);
    expect(Math.max(...ys)).toBeCloseTo(1, 5);
  });
});

describe('project', () => {
  it('agranda lo que está al frente y encoge lo que está al fondo', () => {
    expect(project(1).scale).toBeGreaterThan(project(0).scale);
    expect(project(0).scale).toBeGreaterThan(project(-1).scale);
  });

  it('la hebra más cercana crece exactamente MAX_SCALE', () => {
    expect(project(1).scale).toBeCloseTo(MAX_SCALE, 6);
  });

  it('depth va de 0 al fondo a 1 al frente', () => {
    expect(project(-1).depth).toBeCloseTo(0, 6);
    expect(project(0).depth).toBeCloseTo(0.5, 6);
    expect(project(1).depth).toBeCloseTo(1, 6);
  });

  it('MAX_SCALE se queda en un rango donde la esfera todavía cabe', () => {
    expect(MAX_SCALE).toBeGreaterThan(1.2);
    expect(MAX_SCALE).toBeLessThan(1.6);
  });
});

describe('ThoughtSphere', () => {
  let host: HTMLElement;
  let surface: HTMLElement;
  let sphere: ThoughtSphere | undefined;

  const entries = (n: number): SphereEntry[] =>
    Array.from({ length: n }, (_, i) => ({
      label: `hebra ${i}`,
      origin: 'from-self',
      weight: 'md' as const,
      full: `pensamiento ${i}`,
      onSelect: () => {},
    }));

  beforeEach(() => {
    surface = document.createElement('div');
    host = document.createElement('div');
    surface.appendChild(host);
    document.body.appendChild(surface);
  });

  afterEach(() => {
    sphere?.destroy();
    sphere = undefined;
    surface.remove();
  });

  function build(n: number, reducedMotion = true) {
    sphere = new ThoughtSphere(host, entries(n), {
      radiusX: 300,
      radiusY: 200,
      surface,
      depthBlur: 2.4,
      reducedMotion,
    });
    return sphere;
  }

  it('crea una hebra por pensamiento, enfocable y con el texto completo detrás', () => {
    build(6);
    const nodes = host.querySelectorAll<HTMLElement>('.strand');
    expect(nodes.length).toBe(6);
    expect(nodes[0].tagName).toBe('BUTTON');
    expect(nodes[0].getAttribute('aria-label')).toContain('pensamiento 0');
    expect(nodes[0].title).toBe('pensamiento 0');
  });

  it('el tamaño del contenedor sigue a los radios de cada eje', () => {
    build(4);
    expect(host.style.width).toBe('600px');
    expect(host.style.height).toBe('400px');
  });

  it('separa las hebras por profundidad: opacidad, desenfoque y quién tapa a quién', () => {
    build(20);
    const nodes = Array.from(host.querySelectorAll<HTMLElement>('.strand'));
    const opacities = nodes.map((n) => parseFloat(n.style.opacity));
    const zIndexes = nodes.map((n) => parseInt(n.style.zIndex, 10));

    expect(Math.min(...opacities)).toBeGreaterThanOrEqual(0.3);
    expect(Math.max(...opacities)).toBeGreaterThan(0.9);
    expect(Math.max(...zIndexes)).toBeGreaterThan(Math.min(...zIndexes));
    expect(nodes.some((n) => n.style.filter.startsWith('blur('))).toBe(true);
  });

  it('abre el pensamiento al hacer clic en su hebra', () => {
    const opened: number[] = [];
    sphere = new ThoughtSphere(
      host,
      entries(3).map((e, i) => ({ ...e, onSelect: () => opened.push(i) })),
      { radiusX: 200, radiusY: 200, surface, depthBlur: 2, reducedMotion: true },
    );
    host.querySelectorAll<HTMLElement>('.strand')[2].click();
    expect(opened).toEqual([2]);
  });

  it('al apuntar una hebra la deja nítida y al frente, para poder atinarle', () => {
    build(10);
    const node = host.querySelectorAll<HTMLElement>('.strand')[4];
    node.dispatchEvent(new PointerEvent('pointerenter'));
    expect(node.style.opacity).toBe('1');
    expect(node.style.filter).toBe('');
    expect(node.style.zIndex).toBe('999');
  });

  it('destroy deja el contenedor limpio', () => {
    build(5);
    sphere!.destroy();
    expect(host.querySelectorAll('.strand').length).toBe(0);
  });

  it('con movimiento reducido no programa cuadros de animación', () => {
    const spy = spyOn(window, 'requestAnimationFrame').and.callThrough();
    build(5, true);
    expect(spy).not.toHaveBeenCalled();
  });
});
