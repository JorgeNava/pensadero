import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule, DatePipe } from '@angular/common';
import { Thought } from '../thoughts.service';

@Component({
  selector: 'app-thought-dialog',
  template: `
    <div class="dialog-wrapper">
      <div class="dialog-header">
        <span class="material-symbols-outlined header-icon">format_quote</span>
        <h2 class="dialog-title">Pensamiento</h2>
        <button class="btn-icon copy-btn" (click)="copyContent()" [title]="copied ? 'Copiado!' : 'Copiar'">
          <span class="material-symbols-outlined">{{ copied ? 'check' : 'content_copy' }}</span>
        </button>
      </div>

      <mat-dialog-content class="thought-detail">
        <p class="thought-content">{{ data.thought.content }}</p>

        <div class="tags-section" *ngIf="data.thought.tagNames?.length">
          <div class="tags-list">
            <span class="tag-chip" *ngFor="let tag of data.thought.tagNames">
              <span class="material-symbols-outlined tag-icon">label</span>
              {{ tag }}
            </span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="thought-meta-grid">
          <div class="meta-item" *ngIf="data.thought.createdAt">
            <span class="material-symbols-outlined meta-icon">schedule</span>
            <div class="meta-text">
              <span class="meta-label">Creado</span>
              <span class="meta-value">{{ data.thought.createdAt | date:'medium' }}</span>
            </div>
          </div>
          <div class="meta-item" *ngIf="data.thought.updatedAt">
            <span class="material-symbols-outlined meta-icon">update</span>
            <div class="meta-text">
              <span class="meta-label">Actualizado</span>
              <span class="meta-value">{{ data.thought.updatedAt | date:'medium' }}</span>
            </div>
          </div>
          <div class="meta-item" *ngIf="data.thought.createdBy">
            <span class="material-symbols-outlined meta-icon">person</span>
            <div class="meta-text">
              <span class="meta-label">Origen</span>
              <span class="meta-value">{{ data.thought.createdBy }}</span>
            </div>
          </div>
          <div class="meta-item" *ngIf="data.thought.sourceInputType">
            <span class="material-symbols-outlined meta-icon">input</span>
            <div class="meta-text">
              <span class="meta-label">Tipo</span>
              <span class="meta-value">{{ data.thought.sourceInputType }}</span>
            </div>
          </div>
        </div>

        <div class="thought-id">
          <code>{{ data.thought.thoughtId }}</code>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button class="btn-close" (click)="onClose()">Cerrar</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-wrapper {
      font-family: 'Space Grotesk', sans-serif;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 24px 0;
    }

    .header-icon {
      font-size: 24px;
      color: #818cf8;
    }

    .dialog-title {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 1.3rem;
      font-weight: 400;
      margin: 0;
      color: #f1f5f9;
      flex: 1;
    }

    .btn-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      color: #94a3b8;
      cursor: pointer;
      transition: all 200ms ease;
    }

    .btn-icon .material-symbols-outlined {
      font-size: 16px;
    }

    .btn-icon:hover {
      color: #818cf8;
      border-color: rgba(129, 140, 248, 0.3);
      background: rgba(129, 140, 248, 0.1);
    }

    .thought-detail {
      min-width: 320px;
      max-width: 520px;
      padding: 16px 24px !important;
    }

    .thought-content {
      font-size: 1.05rem;
      line-height: 1.75;
      margin: 0 0 16px;
      white-space: pre-wrap;
      color: #e2e8f0;
      letter-spacing: -0.01em;
      font-weight: 400;
    }

    .tags-section {
      margin-bottom: 16px;
    }

    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .tag-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      background: rgba(129, 140, 248, 0.1);
      border: 1px solid rgba(129, 140, 248, 0.2);
      border-radius: 20px;
      font-size: 0.75rem;
      color: #a78bfa;
      letter-spacing: 0.02em;
      font-weight: 500;
    }

    .tag-icon {
      font-size: 14px;
    }

    .divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.06);
      margin: 16px 0;
    }

    .thought-meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }

    .meta-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .meta-icon {
      font-size: 16px;
      color: #64748b;
      margin-top: 2px;
    }

    .meta-text {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .meta-label {
      font-size: 0.68rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 600;
    }

    .meta-value {
      font-size: 0.82rem;
      color: #94a3b8;
    }

    .thought-id {
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.04);
    }

    .thought-id code {
      font-size: 0.65rem;
      color: #475569;
      word-break: break-all;
      font-family: 'JetBrains Mono', 'SF Mono', monospace;
    }

    mat-dialog-actions {
      padding: 8px 24px 16px !important;
    }

    .btn-close {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.85rem;
      font-weight: 500;
      padding: 8px 20px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 8px;
      color: #94a3b8;
      cursor: pointer;
      transition: all 200ms ease;
      letter-spacing: 0.02em;
    }

    .btn-close:hover {
      color: #f1f5f9;
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.15);
    }

    @media (max-width: 768px) {
      .thought-detail {
        min-width: 260px;
      }
      .thought-meta-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatChipsModule, DatePipe],
})
export class ThoughtDialogComponent {
  copied = false;

  constructor(
    public dialogRef: MatDialogRef<ThoughtDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { thought: Thought }
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  copyContent(): void {
    navigator.clipboard.writeText(this.data.thought.content).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    });
  }
}
