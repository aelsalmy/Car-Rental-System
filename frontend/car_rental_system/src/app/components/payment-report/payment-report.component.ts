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
import { ReportTableComponent } from '../report-table/report-table.component';

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
    ReportTableComponent
  ],
  templateUrl: './payment-report.component.html',
  styleUrl: './payment-report.component.css'
})
export class PaymentReportComponent {
  dataSource: MatTableDataSource<any>;
    searchForm: FormGroup;
  
    constructor(
      private reservationService: ReservationService,
      private fb: FormBuilder
    ) {
      this.dataSource = new MatTableDataSource();
      this.searchForm = this.fb.group({
        startDate: [''],
        endDate: ['']
      });
  
      // Custom filter predicate to search across multiple columns
      this.dataSource.filterPredicate = (data: any, filter: string) => {
        const searchStr = filter.toLowerCase();
        return (
          // Car details
          (data.Car?.model || '').toLowerCase().includes(searchStr) ||
          (data.Car?.plateId || '').toLowerCase().includes(searchStr) ||
          (data.Car?.category || '').toLowerCase().includes(searchStr) ||
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
      this.loadReport();
    }
  
    loadReport() {
      const startDate = this.searchForm.get('startDate')?.value;
      const endDate = this.searchForm.get('endDate')?.value;
  
      // Convert dates if they exist
      const start = startDate ? new Date(startDate).toISOString() : undefined;
      const end = endDate ? new Date(endDate).toISOString() : undefined;
  
      this.reservationService.getReservationReport(start, end).subscribe({
        next: (data) => {
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
