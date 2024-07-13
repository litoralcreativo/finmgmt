import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScopeManagmentDialogComponent } from './scope-managment-dialog.component';

describe('ScopeManagmentDialogComponent', () => {
  let component: ScopeManagmentDialogComponent;
  let fixture: ComponentFixture<ScopeManagmentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScopeManagmentDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScopeManagmentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
