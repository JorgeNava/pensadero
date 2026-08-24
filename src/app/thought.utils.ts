import { Thought } from './thoughts.service';

/** De dónde salió el pensamiento. Determina su color en la esfera. */
export type Origin = 'self' | 'ai' | 'sms';

export const ORIGIN_LABEL: Record<Origin, string> = {
  self: 'Escrito',
  ai: 'Capturado por IA',
  sms: 'Llegó por SMS',
};

export interface ThoughtView extends Thought {
  origin: Origin;
  /** El texto en una línea, sin recortar. La esfera lo recorta según el ancho. */
  flat: string;
  /** Recorte por defecto, para etiquetas y descripciones. */
  excerpt: string;
  /** Primera oración, destacada arriba del lector en textos largos. */
  opening: string;
  /** Lo que sigue después de `opening`, o el texto entero si no se separó. */
  body: string;
  /** Vista previa recortada para las tarjetas del archivo. */
  preview: string;
  /** True cuando vale la pena separar apertura y cuerpo. */
  isLong: boolean;
  time: number;
  monthKey: string;
}

export function originOf(t: Thought): Origin {
  if (t.createdBy === 'IA') return 'ai';
  if (t.createdBy === 'pensadero-migration' || t.sourceInputType === 'sms') return 'sms';
  return 'self';
}

/** Aplana el texto a una línea legible: sin saltos, viñetas ni marcas de markdown. */
export function flatten(content: string): string {
  return (content || '')
    .replace(/\s+/g, ' ')
    .replace(/[*_`#]/g, '')
    .replace(/^[\s\p{Extended_Pictographic}>\-–—•·]+/u, '')
    .trim();
}

/**
 * Recorta a `max` caracteres cortando en palabra completa.
 * La esfera solo puede mostrar una línea por pensamiento: aquí es donde
 * los textos largos se cortan, en vez de dejarlos envolver y encimarse.
 */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(' ');
  const kept = space > max * 0.55 ? cut.slice(0, space) : cut;
  return kept.replace(/[.,;:—–\-\s]+$/, '') + '…';
}

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export function monthLabel(key: string): string {
  const [y, m] = key.split('-');
  const name = MONTHS[Number(m) - 1];
  return name ? `${name} ${y}` : 'sin fecha';
}

export function toView(t: Thought): ThoughtView {
  const raw = (t.content || '').trim();
  const flat = flatten(raw);
  const isLong = raw.length > 200;

  // Corta en la primera oración completa dentro de los primeros 160 caracteres.
  const match = isLong ? raw.match(/^[\s\S]{20,160}?[.!?…](?=\s|$)/) : null;

  return {
    ...t,
    origin: originOf(t),
    flat,
    excerpt: truncate(flat, 46),
    opening: match ? match[0].trim() : '',
    body: match ? raw.slice(match[0].length).trim() : raw,
    preview: truncate(flat, 240),
    isLong,
    time: Date.parse(t.createdAt || t.updatedAt || '') || 0,
    monthKey: (t.createdAt || '').slice(0, 7) || 'sin-fecha',
  };
}

/** Une variantes del mismo tag escritas distinto ("Proyectos Personales" / "Proyectos personales"). */
export function tagKey(tag: string): string {
  return tag
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}
