import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThoughtDialogComponent } from './thought-dialog.component';

describe('ThoughtDialogComponent', () => {
  let component: ThoughtDialogComponent;
  let fixture: ComponentFixture<ThoughtDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThoughtDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThoughtDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
