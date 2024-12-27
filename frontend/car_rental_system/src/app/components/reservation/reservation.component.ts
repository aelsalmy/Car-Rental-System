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
        // Subscribe to query parameters
        this.route.queryParams.subscribe(params => {
            const carId = params['carId'];
            if (!carId) {
                this.snackBar.open('No car selected', 'Close', { duration: 3000 });
                this.router.navigate(['/cars']);
                return;
            }
            
            this.carId = Number(carId);
            this.loadCarDetails();
        });
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
            const startDate = new Date(this.reservationForm.value.startDate);
            const endDate = new Date(this.reservationForm.value.endDate);
            
            // Validate dates
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (startDate < today) {
                this.snackBar.open('Start date cannot be in the past', 'Close', { duration: 3000 });
                return;
            }
            
            if (endDate <= startDate) {
                this.snackBar.open('End date must be after start date', 'Close', { duration: 3000 });
                return;
            }

            // Calculate total amount
            const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
            const totalAmount = days * this.car.dailyRate;

            // Navigate to payment with reservation details
            this.router.navigate(['/payment'], {
                queryParams: {
                    carId: this.carId,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    totalAmount: totalAmount
                }
            });
        }
    }
}