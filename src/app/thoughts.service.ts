import { Injectable } from '@angular/core';
import { Database, ref, onValue } from '@angular/fire/database';
import { Observable, of, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThoughtsService {

  constructor(private db: Database) { }

  getThoughts(source: 'database' | 'static'): Observable<any[]> {
    if (source === 'static') {
      return from(
        fetch('/assets/static/thoughts.json')
          .then(response => response.json())
          .then(data => data.pensamientos ? data.pensamientos : [])
      );
    } else {
      const thoughtsRef = ref(this.db, 'pensamientos');
      return new Observable((observer) => {
        onValue(thoughtsRef, (snapshot) => {
          const thoughts = snapshot.val();
          observer.next(thoughts ? Object.values(thoughts) : []);
        });
      });
    }
  }
}
