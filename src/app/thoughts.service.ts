import { Injectable } from '@angular/core';
import { Database, ref, onValue } from '@angular/fire/database';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThoughtsService {

  constructor(private db: Database) { }

  getThoughts(): Observable<any[]> {
    const thoughtsRef = ref(this.db, 'pensamientos');
    return new Observable((observer) => {
      onValue(thoughtsRef, (snapshot) => {
        const thoughts = snapshot.val();
        observer.next(thoughts ? Object.values(thoughts) : []);
      });
    });
  }
}
