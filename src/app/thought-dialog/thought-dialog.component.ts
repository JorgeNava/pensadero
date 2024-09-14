import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button'; // Asegúrate de que los botones funcionen
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-thought-dialog',
  template: `
    <h2 mat-dialog-title>Pensamiento</h2>
    <mat-dialog-content>
      <p>{{data.thought.texto}}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onClose()">Cerrar</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule], // Importa los módulos necesarios
})
export class ThoughtDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ThoughtDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { thought: any }
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
