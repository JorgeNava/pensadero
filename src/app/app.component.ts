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
  pageSize: number = 20;
  totalThoughts: number = 0;

  constructor(private thoughtsService: ThoughtsService, public dialog: MatDialog) {}

  ngOnInit() {
    const isMobile = window.innerWidth <= 768;
  
    this.pageSize = isMobile ? 7 : 20;
  
    this.thoughtsService.getThoughts('database').subscribe((data) => {
      this.thoughts = data;
      this.totalThoughts = this.thoughts.length;
  
      if (this.totalThoughts > 0 && this.tagCloudContainer) {
        this.updateTagCloud(0);
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
  
    const isMobile = window.innerWidth <= 768;
  
    const options: TagCloudOptions = {
      radius: isMobile ? 200 : 400,
      maxSpeed: 'fast',
      initSpeed: 'fast',
      keep: true
    };
  
    const thoughtTexts = this.paginatedThoughts.map((thought) => thought.texto);
    TagCloud(this.tagCloudContainer.nativeElement, thoughtTexts, options);
  
    const words = this.tagCloudContainer.nativeElement.querySelectorAll('span');
    words.forEach((wordElement: HTMLElement, index: number) => {
      wordElement.addEventListener('click', () => {
        this.openThoughtDialog(this.paginatedThoughts[index]);
      });
    });
  
    const colors = ['#001f3f', "#3D3D3D", "#39CCCC"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    this.tagCloudContainer.nativeElement.style.color = randomColor;
  }

  openThoughtDialog(thought: any): void {
    this.dialog.open(ThoughtDialogComponent, {
      data: { thought: thought },
    });
  }

  onPageChange(event: any) {
    this.updateTagCloud(event.pageIndex);
  }
}