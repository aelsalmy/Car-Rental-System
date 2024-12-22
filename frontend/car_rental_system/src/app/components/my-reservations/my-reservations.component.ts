import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../../services/reservation.service';

@Component({
    selector: 'app-my-reservations',
    standalone: true,
    imports: [
        MatCardModule,
        MatButtonModule,
        CommonModule
    ],
    templateUrl: './my-reservations.component.html',
    styleUrls: ['./my-reservations.component.css']
})
export class MyReservationsComponent implements OnInit {
    reservations: any[] = [];

    constructor(private reservationService: ReservationService) { }

    ngOnInit() {
        this.loadReservations();
    }

    loadReservations() {
        this.reservationService.getMyReservations().subscribe({
            next: (reservations) => {
                this.reservations = reservations;
            },
            error: (error) => {
                console.error('Error loading reservations:', error);
            }
        });
    }

    cancelReservation(reservationId: number) {
        this.reservationService.cancelReservation(reservationId).subscribe({
            next: () => {
                this.loadReservations();
            },
            error: (error) => {
                console.error('Error cancelling reservation:', error);
            }
        });
    }
} 