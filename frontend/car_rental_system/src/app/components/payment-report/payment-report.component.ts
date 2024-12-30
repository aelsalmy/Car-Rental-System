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
    let startDate = this.searchForm.get('startDate')?.value;
    let endDate = this.searchForm.get('endDate')?.value;

    // Format dates to YYYY-MM-DD format without any time component
    if (startDate) {
      const date = new Date(startDate);
      startDate = date.getFullYear() + '-' + 
                 String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                 String(date.getDate()).padStart(2, '0');
    }

    if (endDate) {
      const date = new Date(endDate);
      endDate = date.getFullYear() + '-' + 
               String(date.getMonth() + 1).padStart(2, '0') + '-' + 
               String(date.getDate()).padStart(2, '0');
    }

    this.reservationService.getPaymentReport(startDate, endDate).subscribe({
      next: (data: PaymentData[]) => {
        // Format the dates in the response
        this.payments = data.map(item => ({
          ...item,
          updatedAt: this.formatDateOnly(item.updatedAt)
        }));
        this.filteredPayments = this.payments;
      },
      error: (error) => {
        console.error('Error loading report:', error);
      }
    });
  }

  // Helper method to format dates consistently
  formatDateOnly(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0');
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
