import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ThoughtSphere, MAX_SCALE } from './sphere';
import { ThoughtsService } from './thoughts.service';
import { ThoughtDialogComponent, ReaderResult } from './thought-dialog/thought-dialog.component';
import { ThoughtView, Origin, toView, truncate, monthLabel, tagKey } from './thought.utils';
import { HighlightPipe } from './highlight.pipe';

type Mode = 'sphere' | 'archive';

interface TagFacet {
  label: string;
  count: number;
  key: string;
}

interface MonthGroup {
  key: string;
  label: string;
  thoughts: ThoughtView[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, HighlightPipe],
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('stage') stageEl?: ElementRef<HTMLElement>;
  @ViewChild('sphere') sphereEl?: ElementRef<HTMLElement>;
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  mode: Mode = 'sphere';
  thoughts: ThoughtView[] = [];
  filtered: ThoughtView[] = [];
  months: MonthGroup[] = [];
  facets: TagFacet[] = [];
  span = '';

  isLoading = true;
  failed = false;

  searchQuery = '';
  activeTag: string | null = null;
  activeTagLabel = '';

  /** Pensamientos por esfera. Más de ~28 se vuelve ilegible aunque quepan. */
  perSphere = 18;
  readonly perSphereMin = 6;
  readonly perSphereMax = 34;
  pageIndex = 0;
  zoom = 1;

  private readonly zoomMin = 0.5;
  private readonly zoomMax = 1.8;
  private sphere?: ThoughtSphere;
  private baseRadiusX = 300;
  private baseRadiusY = 240;
  /** Cuántos caracteres cabe una hebra sin salirse de la pantalla. */
  private strandChars = 46;
  private measured = false;
  private rebuildTimer?: number;
  private resizeTimer?: number;
  private reducedMotion = false;

  constructor(
    private thoughtsService: ThoughtsService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.measure();

    this.thoughtsService.getThoughts().subscribe({
      next: (data) => {
        this.thoughts = data
          .map(toView)
          .filter((t) => t.content && t.content.trim().length > 0)
          .sort((a, b) => b.time - a.time);
        this.buildFacets();
        this.buildSpan();
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
        this.scheduleRebuild();
      },
      error: () => {
        this.isLoading = false;
        this.failed = true;
        this.cdr.detectChanges();
      },
    });
  }

  ngOnDestroy() {
    this.sphere?.destroy();
    window.clearTimeout(this.rebuildTimer);
    window.clearTimeout(this.resizeTimer);
  }

  // ─────────────────────────── derivados ───────────────────────────

  /**
   * La esfera tiene que caber en el área que le toca, con todo y hebras.
   *
   * Dos cosas la limitan: el alto, porque la perspectiva estira las hebras del
   * frente hasta MAX_SCALE; y el ancho, porque una hebra es una línea de texto
   * que sobresale del radio por la mitad de su largo. Se mide el contenedor
   * real en vez de la ventana: el encabezado y el pie cambian de alto.
   */
  private measure() {
    const w = window.innerWidth;
    const narrow = w <= 768;
    this.strandChars = w <= 430 ? 18 : narrow ? 26 : 42;

    const box = this.stageEl?.nativeElement.getBoundingClientRect();
    const areaW = box?.width || w;
    const areaH = box?.height || window.innerHeight * 0.6;

    // Ancho aproximado de la hebra más larga, a ~0.5em por carácter.
    const charPx = narrow ? 6.2 : 7.4;
    const halfStrand = (this.strandChars * charPx) / 2;

    const fitY = Math.max(90, (areaH / 2 - 54) / MAX_SCALE);
    const fitX = Math.max(90, (areaW / 2 - halfStrand - 16) / MAX_SCALE);

    // Achatarla más de 1.7 : 1 en cualquier eje deja de leerse como volumen.
    this.baseRadiusY = Math.min(fitY, 300);
    this.baseRadiusX = Math.min(fitX, 420, this.baseRadiusY * 1.7);
    this.baseRadiusY = Math.min(this.baseRadiusY, this.baseRadiusX * 1.8);

    // Solo al arrancar: si el usuario mueve el slider, se respeta su elección
    // aunque después cambie el tamaño de la ventana.
    if (!this.measured && narrow) this.perSphere = 12;
    this.measured = true;
  }

  private buildFacets() {
    const byKey = new Map<string, TagFacet>();
    for (const t of this.thoughts) {
      for (const tag of t.tagNames || []) {
        const key = tagKey(tag);
        if (!key) continue;
        const found = byKey.get(key);
        if (found) found.count++;
        else byKey.set(key, { key, label: tag, count: 1 });
      }
    }
    this.facets = [...byKey.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)).slice(0, 12);
  }

  private buildSpan() {
    const dated = this.thoughts.filter((t) => t.monthKey !== 'sin-fecha');
    if (!dated.length) return;
    const first = dated[dated.length - 1].monthKey;
    const last = dated[0].monthKey;
    this.span = first === last ? monthLabel(last) : `${monthLabel(first)} — ${monthLabel(last)}`;
  }

  private buildMonths() {
    const groups = new Map<string, MonthGroup>();
    for (const t of this.filtered) {
      let g = groups.get(t.monthKey);
      if (!g) {
        g = { key: t.monthKey, label: monthLabel(t.monthKey), thoughts: [] };
        groups.set(t.monthKey, g);
      }
      g.thoughts.push(t);
    }
    this.months = [...groups.values()];
  }

  // ─────────────────────────── filtros ───────────────────────────

  applyFilters() {
    const q = this.searchQuery.trim().toLowerCase();
    this.filtered = this.thoughts.filter((t) => {
      if (this.activeTag && !(t.tagNames || []).some((tag) => tagKey(tag) === this.activeTag)) return false;
      if (!q) return true;
      return (
        t.content.toLowerCase().includes(q) ||
        (t.tagNames || []).some((tag) => tag.toLowerCase().includes(q))
      );
    });
    this.pageIndex = 0;
    this.buildMonths();
    this.scheduleRebuild();
  }

  onSearch() {
    this.applyFilters();
  }

  clearSearch() {
    this.searchQuery = '';
    this.applyFilters();
  }

  toggleTag(key: string, label: string) {
    const off = this.activeTag === key;
    this.activeTag = off ? null : key;
    this.activeTagLabel = off ? '' : label;
    this.applyFilters();
  }

  /** Desde el lector: ver todo lo que comparte tema con este pensamiento. */
  filterByTagName(tag: string) {
    this.activeTag = tagKey(tag);
    this.activeTagLabel = tag;
    this.searchQuery = '';
    this.mode = 'archive';
    this.applyFilters();
  }

  clearAll() {
    this.searchQuery = '';
    this.activeTag = null;
    this.activeTagLabel = '';
    this.applyFilters();
  }

  /** El tema activo no está entre los del riel, hay que mostrarlo aparte. */
  get activeTagOffRail(): boolean {
    return !!this.activeTag && !this.facets.some((f) => f.key === this.activeTag);
  }

  get hasFilter(): boolean {
    return !!this.activeTag || this.searchQuery.trim().length > 0;
  }

  setMode(mode: Mode) {
    if (this.mode === mode) return;
    this.mode = mode;
    if (mode === 'sphere') this.scheduleRebuild();
    else this.sphere?.destroy();
  }

  // ─────────────────────────── esfera ───────────────────────────

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.perSphere));
  }

  get pageThoughts(): ThoughtView[] {
    const start = this.pageIndex * this.perSphere;
    return this.filtered.slice(start, start + this.perSphere);
  }

  prevPage() {
    if (this.pageIndex === 0) return;
    this.pageIndex--;
    this.scheduleRebuild();
  }

  nextPage() {
    if (this.pageIndex >= this.pageCount - 1) return;
    this.pageIndex++;
    this.scheduleRebuild();
  }

  onDensity(value: string | number) {
    this.perSphere = Number(value);
    this.pageIndex = 0;
    this.scheduleRebuild();
  }

  zoomIn() {
    this.setZoom(this.zoom + 0.1);
  }

  zoomOut() {
    this.setZoom(this.zoom - 0.1);
  }

  private setZoom(next: number) {
    const clamped = Math.min(this.zoomMax, Math.max(this.zoomMin, +next.toFixed(2)));
    if (clamped === this.zoom) return;
    this.zoom = clamped;
    this.scheduleRebuild();
  }

  private scheduleRebuild() {
    window.clearTimeout(this.rebuildTimer);
    this.rebuildTimer = window.setTimeout(() => this.renderSphere(), 0);
  }

  private renderSphere() {
    const host = this.sphereEl?.nativeElement;
    const stage = this.stageEl?.nativeElement;
    if (!host || !stage || this.mode !== 'sphere') return;

    const items = this.pageThoughts;
    this.sphere?.destroy();
    this.sphere = undefined;
    if (!items.length) return;

    this.measure();

    // Con más hebras hace falta más radio, o se encinan unas sobre otras.
    const crowding = 1 + Math.max(0, items.length - 14) * 0.02;
    const grow = this.zoom * crowding;
    const radiusX = Math.round(this.baseRadiusX * grow);
    const radiusY = Math.round(this.baseRadiusY * grow);
    stage.style.setProperty('--orb-x', `${radiusX}px`);
    stage.style.setProperty('--orb-y', `${radiusY}px`);

    this.sphere = new ThoughtSphere(
      host,
      items.map((thought) => ({
        label: truncate(thought.flat, this.strandChars),
        origin: `from-${thought.origin}`,
        weight: this.weightOf(thought),
        full: thought.excerpt,
        onSelect: () => this.openThought(thought),
      })),
      {
        radiusX,
        radiusY,
        surface: stage,
        depthBlur: window.innerWidth <= 768 ? 1.5 : 2.4,
        reducedMotion: this.reducedMotion,
      },
    );
  }

  private weightOf(t: ThoughtView): 'lg' | 'md' | 'sm' {
    const len = t.content.trim().length;
    if (len <= 24) return 'lg';
    if (len <= 90) return 'md';
    return 'sm';
  }

  // ─────────────────────────── lector ───────────────────────────

  openThought(thought: ThoughtView) {
    const index = this.filtered.indexOf(thought);
    this.dialog
      .open<ThoughtDialogComponent, unknown, ReaderResult>(ThoughtDialogComponent, {
        data: { list: this.filtered, index: index < 0 ? 0 : index },
        panelClass: 'memory-dialog-panel',
        autoFocus: 'dialog',
        maxWidth: '92vw',
        width: '600px',
      })
      .afterClosed()
      .subscribe((result) => {
        if (result?.filterTag) this.filterByTagName(result.filterTag);
      });
  }

  openRandom() {
    if (!this.filtered.length) return;
    this.openThought(this.filtered[Math.floor(Math.random() * this.filtered.length)]);
  }

  trackById = (_: number, t: ThoughtView) => t.thoughtId;
  trackByKey = (_: number, item: { key: string }) => item.key;

  originLabel(origin: Origin): string {
    return origin === 'ai' ? 'IA' : origin === 'sms' ? 'SMS' : 'Escrito';
  }

  // ─────────────────────────── entrada ───────────────────────────

  @HostListener('window:resize')
  onResize() {
    window.clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(() => {
      this.measure();
      this.scheduleRebuild();
    }, 200);
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    // Con el lector abierto, el teclado es suyo.
    if (this.dialog.openDialogs.length) return;

    const target = event.target as HTMLElement | null;
    const typing = !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

    if (event.key === 'Escape' && typing) {
      this.clearSearch();
      (target as HTMLInputElement).blur();
      return;
    }
    if (typing || event.metaKey || event.ctrlKey || event.altKey) return;

    if (event.key === '/') {
      event.preventDefault();
      this.searchInput?.nativeElement.focus();
    } else if (event.key === 'r') {
      this.openRandom();
    } else if (event.key === 'ArrowLeft' && this.mode === 'sphere') {
      this.prevPage();
    } else if (event.key === 'ArrowRight' && this.mode === 'sphere') {
      this.nextPage();
    }
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    const host = this.sphereEl?.nativeElement;
    if (!host || this.mode !== 'sphere') return;
    const rect = host.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!inside) return;
    event.preventDefault();
    this.setZoom(this.zoom + (event.deltaY < 0 ? 0.08 : -0.08));
  }
}
