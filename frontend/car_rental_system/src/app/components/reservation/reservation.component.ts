import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReservationService } from '../../services/reservation.service';
import { LoginService } from '../../services/login.service';

@Component({
    selector: 'app-reservation',
    standalone: true,
    imports: [
        MatCardModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatInputModule,
        MatButtonModule,
        MatDatepickerModule,
        MatNativeDateModule,
        CommonModule,
        MatSnackBarModule
    ],
    templateUrl: './reservation.component.html',
    styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {
    reservationForm: FormGroup;
    carId: number = 0;
    car: any;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private reservationService: ReservationService,
        private snackBar: MatSnackBar,
        private loginService: LoginService
    ) {
        this.reservationForm = this.fb.group({
            startDate: ['', [Validators.required]],
            endDate: ['', [Validators.required]]
        });
    }

    ngOnInit() {
        this.carId = Number(this.route.snapshot.params['id']);
        this.loadCarDetails();
    }

    loadCarDetails() {
        this.reservationService.getCarDetails(this.carId).subscribe({
            next: (car) => {
                console.log('Car details received:', car);
                this.car = car;
            },
            error: (error) => {
                console.error('Error loading car details:', error);
                if (error.status === 401) {
                    this.snackBar.open('Please login first', 'Close', { duration: 3000 });
                    this.router.navigate(['/login']);
                } else {
                    this.snackBar.open('Error loading car details', 'Close', { duration: 3000 });
                }
            }
        });
    }

    onSubmit() {
        if (this.reservationForm.valid) {
            const reservationData = {
                carId: this.carId,
                startDate: this.reservationForm.value.startDate,
                endDate: this.reservationForm.value.endDate,
                status: 'rented'
            };

            this.reservationService.createReservation(reservationData).subscribe({
                next: (response) => {
                    this.reservationService.updateCarStatus(this.carId, 'rented').subscribe({
                        next: () => {
                            this.snackBar.open('Car reserved successfully!', 'Close', {
                                duration: 3000,
                                horizontalPosition: 'center',
                                verticalPosition: 'top'
                            });
                            alert('Car reserved successfully!');
                            this.router.navigate(['/cars']);
                        },
                        error: (error) => {
                            console.error('Error updating car status:', error);
                            this.snackBar.open('Error updating car status', 'Close', { duration: 3000 });
                        }
                    });
                },
                error: (error) => {
                    console.error('Error creating reservation:', error);
                    if (error.status === 401) {
                        this.loginService.logout();
                        this.snackBar.open('Please login to make a reservation', 'Close', { duration: 3000 });
                        this.router.navigate(['/login']);
                    } else {
                        const errorMessage = error.error?.message || 'Error creating reservation';
                        this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
                    }
                }
            });
        }
    }
} 