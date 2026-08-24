import { flatten, truncate, originOf, toView, monthLabel, tagKey } from './thought.utils';
import { Thought } from './thoughts.service';

function make(partial: Partial<Thought>): Thought {
  return {
    thoughtId: 'id',
    userId: 'user123',
    content: '',
    tagIds: [],
    tagNames: [],
    tagSource: null,
    createdAt: '2026-04-15T10:00:00.000Z',
    updatedAt: '2026-04-15T10:00:00.000Z',
    createdBy: 'user123',
    lastModifiedBy: 'user123',
    sourceInputType: null,
    sourceIntent: null,
    ...partial,
  };
}

describe('flatten', () => {
  it('colapsa saltos de línea en una sola línea', () => {
    expect(flatten('Uno\n\nDos\n   Tres')).toBe('Uno Dos Tres');
  });

  it('quita viñetas y marcas de markdown del inicio', () => {
    expect(flatten('🔹 *Registro* de gastos')).toBe('Registro de gastos');
    expect(flatten('- una idea')).toBe('una idea');
  });

  it('tolera contenido vacío', () => {
    expect(flatten('')).toBe('');
  });
});

describe('truncate', () => {
  it('deja intacto lo que ya cabe', () => {
    expect(truncate('Dubai', 46)).toBe('Dubai');
  });

  it('corta en palabra completa y marca el corte', () => {
    const out = truncate('Cancela tus planes hoy, te quiero invitar a besarnos.', 30);
    expect(out.length).toBeLessThanOrEqual(31);
    expect(out.endsWith('…')).toBe(true);
    expect(out).not.toContain('  ');
  });

  it('no deja puntuación colgando antes de los puntos suspensivos', () => {
    expect(truncate('Hola mundo, adiós mundo', 12)).toBe('Hola mundo…');
  });

  it('corta a la fuerza cuando no hay espacios útiles', () => {
    expect(truncate('supercalifragilisticoespialidoso', 10)).toBe('supercalif…');
  });
});

describe('originOf', () => {
  it('reconoce lo que capturó la IA', () => {
    expect(originOf(make({ createdBy: 'IA' }))).toBe('ai');
  });

  it('reconoce lo que llegó por SMS al pensadero viejo', () => {
    expect(originOf(make({ createdBy: 'pensadero-migration' }))).toBe('sms');
    expect(originOf(make({ createdBy: 'otro', sourceInputType: 'sms' }))).toBe('sms');
  });

  it('todo lo demás lo escribió el usuario', () => {
    expect(originOf(make({ createdBy: 'user123' }))).toBe('self');
  });
});

describe('toView', () => {
  it('separa la primera oración en los pensamientos largos', () => {
    const long =
      'Invierno de 2025, mis papás se acababan de divorciar. ' +
      'Salimos a festejar y terminamos pedos. '.repeat(6);
    const view = toView(make({ content: long }));
    expect(view.isLong).toBe(true);
    expect(view.opening).toBe('Invierno de 2025, mis papás se acababan de divorciar.');
    expect(view.body.startsWith('Salimos a festejar')).toBe(true);
  });

  it('deja los pensamientos cortos enteros en el cuerpo', () => {
    const view = toView(make({ content: 'Gurren Lagann' }));
    expect(view.isLong).toBe(false);
    expect(view.opening).toBe('');
    expect(view.body).toBe('Gurren Lagann');
  });

  it('la hebra de la esfera nunca lleva saltos de línea', () => {
    const view = toView(make({ content: 'Una idea\ncon salto\nde línea' }));
    expect(view.excerpt).not.toContain('\n');
    expect(view.excerpt.length).toBeLessThanOrEqual(47);
  });

  it('agrupa por mes a partir de createdAt', () => {
    expect(toView(make({ createdAt: '2026-04-15T10:00:00Z' })).monthKey).toBe('2026-04');
  });
});

describe('monthLabel', () => {
  it('traduce la clave del mes', () => {
    expect(monthLabel('2026-04')).toBe('abril 2026');
  });

  it('no truena con fechas ausentes', () => {
    expect(monthLabel('sin-fecha')).toBe('sin fecha');
  });
});

describe('tagKey', () => {
  it('une variantes escritas con distinta caja o acento', () => {
    expect(tagKey('Proyectos Personales')).toBe(tagKey('proyectos personales'));
    expect(tagKey('Filosofía')).toBe(tagKey('Filosofia'));
  });

  it('distingue tags que de verdad son distintos', () => {
    expect(tagKey('Recuerdos')).not.toBe(tagKey('Reflexiones'));
  });
});
