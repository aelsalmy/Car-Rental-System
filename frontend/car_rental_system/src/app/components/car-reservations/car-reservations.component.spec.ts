import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarReservationsComponent } from './car-reservations.component';

describe('CarReservationsComponent', () => {
  let component: CarReservationsComponent;
  let fixture: ComponentFixture<CarReservationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarReservationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarReservationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
