import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service';
import { PaymentReportTableComponent, PaymentData } from '../payment-report-table/payment-report-table.component';

@Component({
  selector: 'app-payment-report',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    ReactiveFormsModule,
    PaymentReportTableComponent
  ],
  templateUrl: './payment-report.component.html',
  styleUrls: ['./payment-report.component.css']
})
export class PaymentReportComponent implements OnInit {
  payments: PaymentData[] = [];
  filteredPayments: PaymentData[] = [];
  searchForm: FormGroup;

  constructor(
    private reservationService: ReservationService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    const startDate = this.searchForm.get('startDate')?.value;
    const endDate = this.searchForm.get('endDate')?.value;

    const start = startDate ? new Date(startDate).toISOString() : undefined;
    const end = endDate ? new Date(endDate).toISOString() : undefined;

    this.reservationService.getPaymentReport(start, end).subscribe({
      next: (data: PaymentData[]) => {
        this.payments = data;
        this.filteredPayments = data;
      },
      error: (error) => {
        console.error('Error loading report:', error);
      }
    });
  }

  resetFilters() {
    this.searchForm.reset();
    this.loadReport();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    
    this.filteredPayments = this.payments.filter(payment => {
      // Format payment method for search
      const formattedPaymentMethod = payment.paymentMethod === 'credit_card' ? 'credit card' : 'cash';
      
      // Include 'automatic' in car details search
      const carDetails = `${payment.Car?.model} ${payment.Car?.year} automatic`.toLowerCase();
      
      return (
        // Customer details
        payment.Customer?.name?.toLowerCase().includes(filterValue) ||
        payment.Customer?.email?.toLowerCase().includes(filterValue) ||
        payment.Customer?.phone?.toLowerCase().includes(filterValue) ||
        
        // Car details (including 'automatic')
        carDetails.includes(filterValue) ||
        payment.Car?.plateId?.toLowerCase().includes(filterValue) ||
        
        // Office details
        payment.Car?.Office?.name?.toLowerCase().includes(filterValue) ||
        payment.Car?.Office?.location?.toLowerCase().includes(filterValue) ||
        payment.Car?.Office?.phone?.toLowerCase().includes(filterValue) ||
        
        // Payment details
        payment.amount?.toString().toLowerCase().includes(filterValue) ||
        formattedPaymentMethod.includes(filterValue) ||
        payment.paymentStatus?.toLowerCase().includes(filterValue)
      );
    });
  }
}
