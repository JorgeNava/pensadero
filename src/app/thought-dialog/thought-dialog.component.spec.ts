import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ThoughtDialogComponent } from './thought-dialog.component';
import { toView } from '../thought.utils';
import { Thought } from '../thoughts.service';

const base: Thought = {
  thoughtId: 'a',
  userId: 'user123',
  content: 'Gurren Lagann',
  tagIds: [],
  tagNames: ['Anime'],
  tagSource: null,
  createdAt: '2026-08-03T10:00:00.000Z',
  updatedAt: '2026-08-03T10:00:00.000Z',
  createdBy: 'user123',
  lastModifiedBy: 'user123',
  sourceInputType: null,
  sourceIntent: null,
};

describe('ThoughtDialogComponent', () => {
  let fixture: ComponentFixture<ThoughtDialogComponent>;
  let component: ThoughtDialogComponent;
  const list = [toView(base), toView({ ...base, thoughtId: 'b', content: 'Detachment' })];
  const dialogRef = { close: jasmine.createSpy('close') };

  beforeEach(async () => {
    dialogRef.close.calls.reset();
    await TestBed.configureTestingModule({
      imports: [ThoughtDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { list, index: 0 } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ThoughtDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('abre en el pensamiento que se pidió', () => {
    expect(component.thought.content).toBe('Gurren Lagann');
    expect(component.total).toBe(2);
  });

  it('navega al siguiente y se detiene al final', () => {
    component.next();
    expect(component.thought.content).toBe('Detachment');
    component.next();
    expect(component.index).toBe(1);
  });

  it('no retrocede antes del primero', () => {
    component.prev();
    expect(component.index).toBe(0);
  });

  it('devuelve el tema a la app al pedir ver más de ese tema', () => {
    component.showTag('Anime');
    expect(dialogRef.close).toHaveBeenCalledWith({ filterTag: 'Anime' });
  });
});
