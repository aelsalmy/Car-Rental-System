import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerDataDialogComponent } from './customer-data-dialog.component';

describe('CustomerDataDialogComponent', () => {
  let component: CustomerDataDialogComponent;
  let fixture: ComponentFixture<CustomerDataDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerDataDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerDataDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
