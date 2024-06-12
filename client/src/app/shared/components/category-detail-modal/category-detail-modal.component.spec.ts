import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryDetailModalComponent } from './category-detail-modal.component';

describe('CategoryDetailModalComponent', () => {
  let component: CategoryDetailModalComponent;
  let fixture: ComponentFixture<CategoryDetailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CategoryDetailModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
