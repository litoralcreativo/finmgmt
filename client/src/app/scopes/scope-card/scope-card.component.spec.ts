import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScopeCardComponent } from './scope-card.component';

describe('ScopeCardComponent', () => {
  let component: ScopeCardComponent;
  let fixture: ComponentFixture<ScopeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScopeCardComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScopeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
