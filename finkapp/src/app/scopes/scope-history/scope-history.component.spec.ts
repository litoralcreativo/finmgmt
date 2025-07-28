import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScopeHistoryComponent } from './scope-history.component';

describe('ScopeHistoryComponent', () => {
  let component: ScopeHistoryComponent;
  let fixture: ComponentFixture<ScopeHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScopeHistoryComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScopeHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 