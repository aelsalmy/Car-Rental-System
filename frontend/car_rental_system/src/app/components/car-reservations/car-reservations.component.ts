import { Component , OnInit } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { ReservationService } from '../../services/reservation.service';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-car-reservations',
  standalone: true,
  imports: [MatListModule , MatCardModule , CommonModule],
  templateUrl: './car-reservations.component.html',
  styleUrl: './car-reservations.component.css'
})
export class CarReservationsComponent {
    reservations: any[] = [];

    constructor(private reservationService: ReservationService){}

    ngOnInit() {
      this.loadReservations();
    }

    loadReservations(){
      this.reservationService.getAllReservations().subscribe({
          next: (reservations) => {
              console.log('Reservations: ');
              console.log(reservations);
              this.reservations = reservations;
          }
      });
    }
}
