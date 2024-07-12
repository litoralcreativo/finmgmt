import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountFABComponent } from './account-fab.component';

describe('AccountFABComponent', () => {
  let component: AccountFABComponent;
  let fixture: ComponentFixture<AccountFABComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountFABComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountFABComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
