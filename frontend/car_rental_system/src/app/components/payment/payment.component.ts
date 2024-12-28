import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../../services/reservation.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
    selector: 'app-payment',
    standalone: true,
    imports: [
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        MatSnackBarModule
    ],
    templateUrl: './payment.component.html',
    styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
    totalAmount = 0;
    showCreditCardForm = false;
    carId: number = 0;
    startDate: string = '';
    endDate: string = '';
    creditCardForm: FormGroup;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private reservationService: ReservationService,
        private fb: FormBuilder,
        private snackBar: MatSnackBar
    ) {
        this.creditCardForm = this.fb.group({
            cardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
            expiryDate: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\/([0-9]{2})$')]],
            cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]]
        });
    }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.carId = Number(params['carId']);
            this.startDate = params['startDate'];
            this.endDate = params['endDate'];
            this.totalAmount = Number(params['totalAmount']);

            if (!this.carId || !this.startDate || !this.endDate || !this.totalAmount) {
                this.snackBar.open('Invalid reservation details', 'Close', { duration: 3000 });
                this.router.navigate(['/cars']);
            }
        });
    }

    processCashPayment() {
        this.createReservation('cash', 'unpaid');
    }

    processCreditCardPayment() {
        if (this.creditCardForm.valid) {
            // In a real application, you would process the credit card payment here
            this.createReservation('credit_card', 'paid');
        }
    }

    private createReservation(paymentMethod: string, paymentStatus: string) {
        console.log('Creating reservation with data:', {
            carId: this.carId,
            startDate: this.startDate,
            endDate: this.endDate,
            totalCost: this.totalAmount,
            paymentMethod,
            paymentStatus
        });

        const reservationData = {
            carId: this.carId,
            startDate: this.startDate,
            endDate: this.endDate,
            totalCost: this.totalAmount,
            paymentMethod,
            paymentStatus
        };

        this.reservationService.createReservation(reservationData).subscribe({
            next: (response) => {
                console.log('Reservation created successfully:', response);
                this.snackBar.open('Reservation created successfully!', 'Close', { duration: 3000 });
                this.router.navigate(['/my-reservations']);
            },
            error: (error) => {
                console.error('Error creating reservation:', error);
                this.snackBar.open(error.error.message || 'Failed to create reservation', 'Close', { duration: 3000 });
            }
        });
    }
}
