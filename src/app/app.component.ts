import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import TagCloud, { TagCloudOptions } from 'TagCloud';
import { ThoughtsService } from './thoughts.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class AppComponent implements OnInit {
  @ViewChild('tagCloudContainer', { static: false }) tagCloudContainer!: ElementRef;
  thoughts: any[] = [];

  constructor(private thoughtsService: ThoughtsService) {}

  ngOnInit() {
    this.thoughtsService.getThoughts().subscribe((data) => {
      this.thoughts = data;

      if (this.thoughts.length > 0 && this.tagCloudContainer) {
        // Limpiar el contenedor del tag cloud viejo
        this.tagCloudContainer.nativeElement.innerHTML = '';

        const options: TagCloudOptions = {
          radius: 150,
          maxSpeed: 'fast',
          initSpeed: 'fast',
          keep: true
        };

        const thoughtTexts = this.thoughts.map((thought) => thought.texto);
        TagCloud(this.tagCloudContainer.nativeElement, thoughtTexts, options);

        const colors = ['#34A853', '#FBBC05', '#4285F4', '#7FBC00', '#FFBA01', '#01A6F0'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        this.tagCloudContainer.nativeElement.style.color = randomColor;
      } else {
        console.log("No se encontraron pensamientos.");
      }
    });
  }
}
