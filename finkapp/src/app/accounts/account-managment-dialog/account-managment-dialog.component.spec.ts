import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountManagmentDialogComponent } from './account-managment-dialog.component';

describe('AccountManagmentDialogComponent', () => {
  let component: AccountManagmentDialogComponent;
  let fixture: ComponentFixture<AccountManagmentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountManagmentDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountManagmentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
