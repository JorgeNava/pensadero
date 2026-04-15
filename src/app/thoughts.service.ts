import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from '../environments/environment';

export interface Thought {
  thoughtId: string;
  userId: string;
  content: string;
  tagIds: string[];
  tagNames: string[];
  tagSource: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
  sourceInputType: string | null;
  sourceIntent: string | null;
}

interface ThoughtsResponse {
  items: Thought[];
  count: number;
  lastKey: string | null;
  hasMore: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ThoughtsService {

  private apiUrl = environment.apiBaseUrl;
  private userId = environment.userId;

  constructor(private http: HttpClient) { }

  getThoughts(): Observable<Thought[]> {
    return from(this.fetchAllThoughts());
  }

  private async fetchAllThoughts(): Promise<Thought[]> {
    let allItems: Thought[] = [];
    let lastKey: string | null = null;

    do {
      let url = `${this.apiUrl}/thoughts?userId=${this.userId}&sortOrder=desc&limit=100`;
      if (lastKey) {
        url += `&lastKey=${lastKey}`;
      }

      const response = await this.http.get<ThoughtsResponse>(url).toPromise();
      if (response) {
        allItems = allItems.concat(response.items || []);
        lastKey = response.hasMore ? response.lastKey : null;
      } else {
        break;
      }
    } while (lastKey);

    return allItems;
  }

  getThought(thoughtId: string): Observable<Thought> {
    return this.http.get<Thought>(`${this.apiUrl}/thoughts/${thoughtId}`);
  }
}
