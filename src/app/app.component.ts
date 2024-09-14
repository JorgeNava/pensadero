import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import TagCloud, { TagCloudOptions } from 'TagCloud';
import { ThoughtsService } from './thoughts.service';
import { ThoughtDialogComponent } from './thought-dialog/thought-dialog.component';
import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class CustomPaginatorIntl extends MatPaginatorIntl {
  override getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return `Esfera 1 de 1`; // Si no hay pensamientos, mostrar solo 1 esfera
    }
    const totalPages = Math.ceil(length / pageSize); // Calcula el total de esferas
    return `Esfera ${page + 1} de ${totalPages}`; // Muestra la esfera actual y el total de esferas
  };
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, MatPaginatorModule, MatDialogModule],
  providers: [{ provide: MatPaginatorIntl, useClass: CustomPaginatorIntl }] // Añade el paginador personalizado
})
export class AppComponent implements OnInit {
  @ViewChild('tagCloudContainer', { static: false }) tagCloudContainer!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  thoughts: any[] = [];
  paginatedThoughts: any[] = [];
  pageSize: number = 15; // Siempre 15 pensamientos por esfera
  totalThoughts: number = 0;

  constructor(private thoughtsService: ThoughtsService, public dialog: MatDialog) {}

  ngOnInit() {
    this.thoughtsService.getThoughts('database').subscribe((data) => {
      this.thoughts = data;
      this.totalThoughts = this.thoughts.length;

      if (this.totalThoughts > 0 && this.tagCloudContainer) {
        this.updateTagCloud(0); // Muestra la primera página de pensamientos
      } else {
        console.log("No se encontraron pensamientos.");
      }
    });
  }

  updateTagCloud(pageIndex: number) {
    const startIndex = pageIndex * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.totalThoughts);
    this.paginatedThoughts = this.thoughts.slice(startIndex, endIndex);

    this.tagCloudContainer.nativeElement.innerHTML = '';

    const options: TagCloudOptions = {
      radius: 150,
      maxSpeed: 'fast',
      initSpeed: 'fast',
      keep: true
    };

    const thoughtTexts = this.paginatedThoughts.map((thought) => thought.texto);
    TagCloud(this.tagCloudContainer.nativeElement, thoughtTexts, options);

    // Asignar eventos de clic a los elementos generados
    const words = this.tagCloudContainer.nativeElement.querySelectorAll('span'); // Seleccionamos los spans generados por TagCloud
    words.forEach((wordElement: HTMLElement, index: number) => {
      wordElement.addEventListener('click', () => {
        this.openThoughtDialog(this.paginatedThoughts[index]); // Abrir el diálogo con el pensamiento correspondiente
      });
    });

    const colors = ['#34A853', '#FBBC05', '#4285F4', '#7FBC00', '#FFBA01', '#01A6F0'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    this.tagCloudContainer.nativeElement.style.color = randomColor;
  }

  // Método para abrir el diálogo y mostrar el contenido completo del pensamiento
  openThoughtDialog(thought: any): void {
    this.dialog.open(ThoughtDialogComponent, {
      data: { thought: thought },
    });
  }

  onPageChange(event: any) {
    this.updateTagCloud(event.pageIndex);
  }
}