import { Pipe, PipeTransform } from '@angular/core';

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * Envuelve las coincidencias de la búsqueda en <mark>.
 * El texto se escapa antes de marcarlo, así que lo único que se
 * interpreta como HTML son las etiquetas que agrega este pipe.
 */
@Pipe({ name: 'highlight', standalone: true })
export class HighlightPipe implements PipeTransform {
  transform(text: string, query: string): string {
    const safe = (text || '').replace(/[&<>"']/g, (c) => ESCAPES[c]);
    const term = (query || '').trim();
    if (term.length < 2) return safe;

    const safeTerm = term.replace(/[&<>"']/g, (c) => ESCAPES[c]);
    const pattern = new RegExp(safeTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    return safe.replace(pattern, (match) => `<mark>${match}</mark>`);
  }
}
