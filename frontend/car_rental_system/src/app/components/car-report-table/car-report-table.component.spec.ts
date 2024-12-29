import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarReportTableComponent } from './car-report-table.component';

describe('CarReportTableComponent', () => {
  let component: CarReportTableComponent;
  let fixture: ComponentFixture<CarReportTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarReportTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarReportTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
