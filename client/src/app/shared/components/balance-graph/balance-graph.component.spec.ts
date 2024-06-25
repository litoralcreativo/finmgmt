import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceGraphComponent } from './balance-graph.component';

describe('BalanceGraphComponent', () => {
  let component: BalanceGraphComponent;
  let fixture: ComponentFixture<BalanceGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BalanceGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BalanceGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
