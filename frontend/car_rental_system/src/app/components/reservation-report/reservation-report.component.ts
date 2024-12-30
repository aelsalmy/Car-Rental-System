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

interface ReservationData {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  Car?: {
    model: string;
    plateId: string;
    year: string;
    category: string;
    Office?: {
      name: string;
      location: string;
    };
  };
  Customer?: {
    name: string;
    email: string;
    phone: string;
  };
  Payment?: {
    paymentMethod: string;
    paymentStatus: string;
  };
}

@Component({
  selector: 'app-reservation-report',
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
  templateUrl: './reservation-report.component.html',
  styleUrls: ['./reservation-report.component.css']
})
export class ReservationReportComponent implements OnInit {
  dataSource: MatTableDataSource<ReservationData>;
  searchForm: FormGroup;

  constructor(
    private reservationService: ReservationService,
    private fb: FormBuilder
  ) {
    this.dataSource = new MatTableDataSource<ReservationData>();
    this.searchForm = this.fb.group({
      startDate: [''],
      endDate: ['']
    });

    // Custom filter predicate to search across multiple columns
    this.dataSource.filterPredicate = (data: ReservationData, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (
        // Car details
        (data.Car?.model || '').toLowerCase().includes(searchStr) ||
        (data.Car?.plateId || '').toLowerCase().includes(searchStr) ||
        (data.Car?.year || '').toString().toLowerCase().includes(searchStr) ||
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

    this.reservationService.getReservationReport(startDate, endDate).subscribe({
      next: (data: ReservationData[]) => {
        // Format the dates in the response data
        this.dataSource.data = data.map((item: ReservationData) => ({
          ...item,
          startDate: this.formatDateOnly(item.startDate),
          endDate: this.formatDateOnly(item.endDate)
        }));
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

  // Format date for display without time
  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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
    
    // Reload the report with no filters
    this.loadReport();
  }
}
