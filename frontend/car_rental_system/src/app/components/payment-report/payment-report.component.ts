import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service';
import { MatTableDataSource } from '@angular/material/table';
import { PaymentReportTableComponent } from '../payment-report-table/payment-report-table.component';

interface PaymentData {
  Reservation: {
    Customer: {
      name: string;
      email: string;
      phone: string;
    };
    Car: {
      model: string;
      year: string;
      plateId: string;
      Office: {
        name: string;
        location: string;
      };
    };
  };
  updatedAt: string;
  paymentMethod: string;
  amount: number;
}

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
    ReactiveFormsModule,
    PaymentReportTableComponent
  ],
  templateUrl: './payment-report.component.html',
  styleUrl: './payment-report.component.css'
})
export class PaymentReportComponent implements OnInit {
  dataSource: MatTableDataSource<PaymentData>;
  searchForm: FormGroup;

  constructor(
    private reservationService: ReservationService,
    private fb: FormBuilder
  ) {
    this.dataSource = new MatTableDataSource<PaymentData>();
    this.searchForm = this.fb.group({
      startDate: [''],
      endDate: ['']
    });

    // Custom filter predicate to search across all payment report columns
    this.dataSource.filterPredicate = (data: PaymentData, filter: string) => {
      const searchStr = filter.toLowerCase();
      
      // Helper function to safely check if a value includes the search term
      const includes = (value: any) => 
        String(value || '').toLowerCase().includes(searchStr);

      // Format payment method for display
      const paymentMethodDisplay = data.paymentMethod === 'credit_card' ? 'credit card' : 'cash';
      
      // Format date for display
      const formattedDate = this.formatDate(data.updatedAt);

      // Get model year for searching
      const modelYear = data.Reservation.Car.year ? String(data.Reservation.Car.year).trim() : '';

      return (
        // Customer details
        includes(data.Reservation.Customer.name) ||
        includes(data.Reservation.Customer.email) ||
        includes(data.Reservation.Customer.phone) ||
        // Car details
        includes(data.Reservation.Car.model) ||
        includes(modelYear) ||
        includes(data.Reservation.Car.plateId) ||
        // Office details
        includes(data.Reservation.Car.Office.name) ||
        includes(data.Reservation.Car.Office.location) ||
        // Payment details
        includes(formattedDate) ||
        includes(paymentMethodDisplay) ||
        includes(data.amount)
      );
    };
  }

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    const startDate = this.searchForm.get('startDate')?.value;
    const endDate = this.searchForm.get('endDate')?.value;

    // Convert dates if they exist
    const start = startDate ? new Date(startDate).toISOString() : undefined;
    const end = endDate ? new Date(endDate).toISOString() : undefined;

    this.reservationService.getPaymentReport(start, end).subscribe({
      next: (data) => {
        console.log('Get Payment Report: ', data);
        this.dataSource.data = data;
      },
      error: (error) => {
        console.error('Error loading report:', error);
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  }

  resetFilters() {
    // Reset form controls
    this.searchForm.reset();
    
    // Reset the search input
    const input = document.querySelector('.filter-field input') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
    
    // Reset the table filter
    this.dataSource.filter = '';
    
    // Reset paginator to first page
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    
    // Reload the report with no date filters
    this.loadReport();
  }
}
