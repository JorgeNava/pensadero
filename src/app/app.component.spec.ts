import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, NoopAnimationsModule],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('arranca en la vista de esfera', () => {
    const app = TestBed.createComponent(AppComponent).componentInstance;
    expect(app.mode).toBe('sphere');
  });

  it('muestra el título del pensadero', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('El Pensadero');
  });

  it('siempre reporta al menos una esfera, aunque no haya resultados', () => {
    const app = TestBed.createComponent(AppComponent).componentInstance;
    expect(app.pageCount).toBe(1);
  });
});
