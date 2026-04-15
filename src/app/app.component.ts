import { Component, ElementRef, ViewChild, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSliderModule } from '@angular/material/slider';
import TagCloud, { TagCloudOptions } from 'TagCloud';
import { ThoughtsService, Thought } from './thoughts.service';
import { ThoughtDialogComponent } from './thought-dialog/thought-dialog.component';
import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class CustomPaginatorIntl extends MatPaginatorIntl {
  override getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return `Esfera 1 de 1`;
    }
    const totalPages = Math.ceil(length / pageSize);
    return `Esfera ${page + 1} de ${totalPages}`;
  };
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatPaginatorModule, MatDialogModule, MatSliderModule],
  providers: [{ provide: MatPaginatorIntl, useClass: CustomPaginatorIntl }]
})
export class AppComponent implements OnInit {
  @ViewChild('tagCloudContainer', { static: false }) tagCloudContainer!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  thoughts: Thought[] = [];
  filteredThoughts: Thought[] = [];
  paginatedThoughts: Thought[] = [];
  pageSize: number = 20;
  totalFilteredThoughts: number = 0;
  isLoading: boolean = true;
  searchQuery: string = '';
  searchActive: boolean = false;

  zoomLevel: number = 1;
  private readonly zoomMin = 0.4;
  private readonly zoomMax = 2;
  private readonly zoomStep = 0.1;
  private baseRadius: number = 350;
  private currentPageIndex: number = 0;

  private tagCloudColors = [
    '#c4b5fd', // lavender (dominant)
    '#c4b5fd',
    '#c4b5fd',
    '#c4b5fd',
    '#c4b5fd',
    '#a78bfa', // violet (secondary)
    '#a78bfa',
    '#a78bfa',
    '#cbd5e1', // pale slate (accent)
    '#cbd5e1',
  ];

  constructor(
    private thoughtsService: ThoughtsService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const isMobile = window.innerWidth <= 768;
    this.pageSize = isMobile ? 7 : 20;
    this.baseRadius = isMobile ? 180 : 350;

    this.thoughtsService.getThoughts().subscribe({
      next: (data) => {
        this.thoughts = data;
        this.filteredThoughts = [...data];
        this.totalFilteredThoughts = this.filteredThoughts.length;
        this.isLoading = false;
        this.cdr.detectChanges();

        if (this.totalFilteredThoughts > 0) {
          setTimeout(() => this.updateTagCloud(0), 0);
        }
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch() {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      this.filteredThoughts = [...this.thoughts];
    } else {
      this.filteredThoughts = this.thoughts.filter(t =>
        t.content.toLowerCase().includes(query) ||
        (t.tagNames && t.tagNames.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    this.totalFilteredThoughts = this.filteredThoughts.length;

    if (this.paginator) {
      this.paginator.firstPage();
    }

    if (this.filteredThoughts.length > 0) {
      setTimeout(() => this.updateTagCloud(0), 0);
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchActive = false;
    this.onSearch();
  }

  openRandomThought() {
    if (this.filteredThoughts.length === 0) return;
    const randomIndex = Math.floor(Math.random() * this.filteredThoughts.length);
    this.openThoughtDialog(this.filteredThoughts[randomIndex]);
  }

  updateTagCloud(pageIndex: number) {
    if (!this.tagCloudContainer) return;
    this.currentPageIndex = pageIndex;

    const startIndex = pageIndex * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.totalFilteredThoughts);
    this.paginatedThoughts = this.filteredThoughts.slice(startIndex, endIndex);

    this.tagCloudContainer.nativeElement.innerHTML = '';

    const count = this.paginatedThoughts.length;
    const densityScale = count <= 20 ? 1 : 1 + (count - 20) * 0.012;
    const radius = Math.round(this.baseRadius * this.zoomLevel * densityScale);

    const fontSize = count <= 20 ? 1 : Math.max(0.55, 1 - (count - 20) * 0.003);

    const options: TagCloudOptions = {
      radius,
      maxSpeed: 'normal',
      initSpeed: 'normal',
      keep: true
    };

    const thoughtTexts = this.paginatedThoughts.map((thought) => thought.content);
    TagCloud(this.tagCloudContainer.nativeElement, thoughtTexts, options);

    const shuffled = [...this.tagCloudColors].sort(() => Math.random() - 0.5);
    const words = this.tagCloudContainer.nativeElement.querySelectorAll('span');
    words.forEach((wordElement: HTMLElement, index: number) => {
      const color = shuffled[index % shuffled.length];
      wordElement.style.color = color;
      wordElement.style.fontSize = `${fontSize}rem`;
      wordElement.addEventListener('click', () => {
        this.openThoughtDialog(this.paginatedThoughts[index]);
      });
    });
  }

  zoomIn() {
    this.zoomLevel = Math.min(this.zoomMax, +(this.zoomLevel + this.zoomStep).toFixed(1));
    this.rebuildCloud();
  }

  zoomOut() {
    this.zoomLevel = Math.max(this.zoomMin, +(this.zoomLevel - this.zoomStep).toFixed(1));
    this.rebuildCloud();
  }

  onDensityChange(value: number) {
    this.pageSize = value;
    this.totalFilteredThoughts = this.filteredThoughts.length;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.rebuildCloud();
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (!this.tagCloudContainer) return;
    const rect = this.tagCloudContainer.nativeElement.getBoundingClientRect();
    const inCloud = event.clientX >= rect.left && event.clientX <= rect.right
                 && event.clientY >= rect.top && event.clientY <= rect.bottom;
    if (!inCloud) return;

    event.preventDefault();
    if (event.deltaY < 0) {
      this.zoomIn();
    } else {
      this.zoomOut();
    }
  }

  private rebuildCloud() {
    setTimeout(() => this.updateTagCloud(this.currentPageIndex), 0);
  }

  openThoughtDialog(thought: Thought): void {
    this.dialog.open(ThoughtDialogComponent, {
      data: { thought },
      panelClass: 'thought-dialog-panel',
    });
  }

  onPageChange(event: any) {
    this.updateTagCloud(event.pageIndex);
  }
}