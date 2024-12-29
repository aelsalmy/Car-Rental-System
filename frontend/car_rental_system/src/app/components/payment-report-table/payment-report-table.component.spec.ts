import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentReportTableComponent } from './payment-report-table.component';

describe('PaymentReportTableComponent', () => {
  let component: PaymentReportTableComponent;
  let fixture: ComponentFixture<PaymentReportTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentReportTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentReportTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
