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
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service';
import { CarService } from '../../services/car.service';
import { MatTableDataSource } from '@angular/material/table';
import { ReportTableComponent } from '../report-table/report-table.component';

@Component({
  selector: 'app-customer-report',
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
    MatSelectModule,
    ReactiveFormsModule,
    MatIconModule,
    ReportTableComponent
  ],
  templateUrl: './customer-report.component.html',
  styleUrl: './customer-report.component.css'
})
export class CustomerReportComponent {
  dataSource: MatTableDataSource<any>;
    searchForm: FormGroup;
    customers: any[] = [];
  
    constructor(
      private reservationService: ReservationService,
      private carService: CarService,
      private fb: FormBuilder
    ) {
      this.dataSource = new MatTableDataSource();
      this.searchForm = this.fb.group({
        carId: [''],
        startDate: [''],
        endDate: ['']
      });
  
      // Custom filter predicate
      this.dataSource.filterPredicate = (data: any, filter: string) => {
        const searchStr = filter.toLowerCase();
        return (
          // Customer details
          (data.Customer?.name || '').toLowerCase().includes(searchStr) ||
          (data.Customer?.phone || '').toLowerCase().includes(searchStr) ||
          (data.Customer?.email || '').toLowerCase().includes(searchStr) ||
          // Office details
          (data.Car?.Office?.name || '').toLowerCase().includes(searchStr) ||
          (data.Car?.Office?.location || '').toLowerCase().includes(searchStr) ||
          // Reservation details
          (data.status || '').toLowerCase().includes(searchStr) ||
          // Payment details
          (data.Payment?.paymentMethod || '').toLowerCase().includes(searchStr) ||
          (data.Payment?.paymentStatus || '').toLowerCase().includes(searchStr)
        );
      };
    }
  
    ngOnInit() {
      this.loadCustomers();
    }
  
    loadCustomers() {
      this.reservationService.getAllCustomers().subscribe({
        next: (customers) => {
          this.customers = customers;
        },
        error: (error) => {
          console.error('Error loading cars:', error);
        }
      });
    }
  
    loadReport() {
      const customerId = this.searchForm.get('carId')?.value;
  
      this.reservationService.getCustomerReport(customerId).subscribe({
        next: (data) => {
          console.log(data);
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
  
    // Format date to show exact input date and time
    formatDate(date: string): string {
      if (!date) return '';
      const d = new Date(date);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    }
}
