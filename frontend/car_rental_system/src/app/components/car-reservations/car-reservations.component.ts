import { Component, OnInit, inject } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { ReservationService } from '../../services/reservation.service';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CustomerDataDialogComponent } from '../customer-data-dialog/customer-data-dialog.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReservationStatusDialogComponent } from '../reservation-status-dialog/reservation-status-dialog.component';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
    selector: 'app-car-reservations',
    standalone: true,
    imports: [
        MatListModule,
        MatCardModule,
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCheckboxModule
    ],
    templateUrl: './car-reservations.component.html',
    styleUrls: ['./car-reservations.component.css']
})
export class CarReservationsComponent implements OnInit {
    reservations: any[] = [];
    readonly dialog = inject(MatDialog);
    searchForm: FormGroup;
    statuses = [
        { value: 'pending', label: 'Pending' },
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    constructor(
        private reservationService: ReservationService,
        private fb: FormBuilder,
        private snackBar: MatSnackBar
    ) {
        this.searchForm = this.fb.group({
            startDate: [''],
            endDate: [''],
            status: [''],
            currentlyRented: [false]
        });

        // Subscribe to currentlyRented changes to disable other filters when it's checked
        this.searchForm.get('currentlyRented')?.valueChanges.subscribe(checked => {
            if (checked) {
                this.searchForm.patchValue({
                    startDate: null,
                    endDate: null,
                    status: null
                });
                this.searchForm.get('startDate')?.disable();
                this.searchForm.get('endDate')?.disable();
                this.searchForm.get('status')?.disable();
            } else {
                this.searchForm.get('startDate')?.enable();
                this.searchForm.get('endDate')?.enable();
                this.searchForm.get('status')?.enable();
            }
        });
    }

    ngOnInit() {
        this.loadReservations();
    }

    loadReservations() {
        this.reservationService.getAllReservations().subscribe({
            next: (reservations) => {
                this.reservations = reservations;
            },
            error: (error) => {
                console.error('Error loading reservations:', error);
                this.snackBar.open('Error loading reservations', 'Close', { duration: 3000 });
            }
        });
    }

    search() {
        const searchParams = this.searchForm.value;
        
        if (!searchParams.currentlyRented) {
            // Convert dates to YYYY-MM-DD format if they exist
            if (searchParams.startDate) {
                searchParams.startDate = this.formatDate(searchParams.startDate);
            }
            if (searchParams.endDate) {
                searchParams.endDate = this.formatDate(searchParams.endDate);
            }
        }

        this.reservationService.searchReservations(searchParams).subscribe({
            next: (reservations) => {
                this.reservations = reservations;
            },
            error: (error) => {
                console.error('Error searching reservations:', error);
                this.snackBar.open('Error searching reservations', 'Close', { duration: 3000 });
            }
        });
    }

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    resetSearch() {
        this.searchForm.reset({
            startDate: null,
            endDate: null,
            status: null,
            currentlyRented: false
        });
        this.loadReservations();
    }

    openCustomerDialog(currCustomer: any) {
        this.dialog.open(CustomerDataDialogComponent, {
            data: {
                customer: currCustomer
            }
        });
    }

    openStatusDialog(reservation: any) {
        const dialogRef = this.dialog.open(ReservationStatusDialogComponent, {
            data: {
                currentStatus: reservation.status,
                startDate: reservation.startDate
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result !== reservation.status) {
                this.updateReservationStatus(reservation.id, result);
            }
        });
    }

    updateReservationStatus(reservationId: number, newStatus: string) {
        this.reservationService.updateReservationStatus(reservationId, newStatus).subscribe({
            next: () => {
                this.snackBar.open('Reservation status updated successfully', 'Close', { duration: 3000 });
                this.loadReservations();
            },
            error: (error) => {
                console.error('Error updating reservation status:', error);
                this.snackBar.open(error.error?.message || 'Error updating reservation status', 'Close', { duration: 3000 });
            }
        });
    }

    onDelete(reservationId: any) {
        this.reservationService.deleteReservation(reservationId).subscribe({
            next: () => {
                this.snackBar.open('Reservation deleted successfully', 'Close', { duration: 3000 });
                this.loadReservations();
            },
            error: (error) => {
                console.error('Error deleting reservation:', error);
                this.snackBar.open('Error deleting reservation', 'Close', { duration: 3000 });
            }
        });
    }
}
