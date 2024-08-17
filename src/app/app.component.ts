import { Component, ElementRef, ViewChild, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import TagCloud, { TagCloudOptions } from 'TagCloud';

interface Pensamiento {
  texto: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  @ViewChild('tagCloudContainer', { static: false }) tagCloudContainer!: ElementRef;
  myTags: string[] = [];

  constructor(
    private db: AngularFireDatabase,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.db.list<Pensamiento>('/pensamientos') 
    .valueChanges()
    .subscribe((pensamientos: Pensamiento[]) => { 
      this.myTags = pensamientos.map(pensamiento => pensamiento.texto); 
    });
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) { 
      window.onload = () => { 
        const options: TagCloudOptions = {
          radius: 150,
          maxSpeed: 'fast',
          initSpeed: 'fast',
          keep: true
        };

        TagCloud(this.tagCloudContainer.nativeElement, this.myTags, options);

        const colors = ['#34A853', '#FBBC05', '#4285F4', '#7FBC00', 'FFBA01', '01A6F0'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        this.tagCloudContainer.nativeElement.style.color = randomColor;
      };
    }
  }
}
