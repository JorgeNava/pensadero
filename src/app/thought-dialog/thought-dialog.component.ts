import { Component, HostListener, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ThoughtView, ORIGIN_LABEL } from '../thought.utils';

export interface ReaderData {
  list: ThoughtView[];
  index: number;
}

/** Lo que el lector le pide a la app al cerrarse. */
export interface ReaderResult {
  filterTag?: string;
}

@Component({
  selector: 'app-thought-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './thought-dialog.component.html',
  styleUrls: ['./thought-dialog.component.scss'],
})
export class ThoughtDialogComponent {
  index: number;
  copied = false;
  private copyTimer?: number;

  constructor(
    private dialogRef: MatDialogRef<ThoughtDialogComponent, ReaderResult>,
    @Inject(MAT_DIALOG_DATA) public data: ReaderData,
  ) {
    this.index = Math.min(Math.max(0, data.index), Math.max(0, data.list.length - 1));
  }

  get thought(): ThoughtView {
    return this.data.list[this.index];
  }

  get total(): number {
    return this.data.list.length;
  }

  get originLabel(): string {
    return ORIGIN_LABEL[this.thought.origin];
  }

  prev() {
    if (this.index > 0) this.index--;
  }

  next() {
    if (this.index < this.total - 1) this.index++;
  }

  close() {
    this.dialogRef.close();
  }

  showTag(tag: string) {
    this.dialogRef.close({ filterTag: tag });
  }

  copy() {
    navigator.clipboard?.writeText(this.thought.content).then(() => {
      this.copied = true;
      window.clearTimeout(this.copyTimer);
      this.copyTimer = window.setTimeout(() => (this.copied = false), 1800);
    });
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.prev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.next();
    }
  }
}
