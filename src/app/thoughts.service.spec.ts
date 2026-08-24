import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ThoughtsService, Thought } from './thoughts.service';
import { environment } from '../environments/environment';

function page(items: Partial<Thought>[], hasMore = false, lastKey: string | null = null) {
  return { items, count: items.length, lastKey, hasMore };
}

describe('ThoughtsService', () => {
  let service: ThoughtsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ThoughtsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('junta todas las páginas hasta que la API deja de tener más', (done) => {
    service.getThoughts().subscribe((all) => {
      expect(all.map((t) => t.thoughtId)).toEqual(['1', '2']);
      done();
    });

    const first = http.expectOne((r) => r.url.includes('/thoughts') && !r.url.includes('lastKey'));
    first.flush(page([{ thoughtId: '1' }], true, 'k1'));

    setTimeout(() => {
      const second = http.expectOne((r) => r.url.includes('lastKey=k1'));
      second.flush(page([{ thoughtId: '2' }]));
    });
  });

  it('pide los pensamientos del usuario configurado, del más nuevo al más viejo', () => {
    service.getThoughts().subscribe();
    const req = http.expectOne((r) => r.url.includes('/thoughts'));
    expect(req.request.url).toContain(`userId=${environment.userId}`);
    expect(req.request.url).toContain('sortOrder=desc');
    req.flush(page([]));
  });
});
