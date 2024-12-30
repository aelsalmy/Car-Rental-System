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

interface ReservationData {
  startDate: string;
  endDate: string;
  status: string;
  Customer?: {
    name: string;
    phone: string;
    email: string;
  };
  Car?: {
    model: string;
    plateId: string;
    category: string;
    year: string;
    Office?: {
      name: string;
      location: string;
    };
  };
  Payment?: {
    paymentMethod: string;
    paymentStatus: string;
  };
}

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
  styleUrls: ['./customer-report.component.css']
})
export class CustomerReportComponent implements OnInit {
  dataSource: MatTableDataSource<ReservationData>;
  searchForm: FormGroup;
  customers: any[] = [];
  statuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  constructor(
    private reservationService: ReservationService,
    private carService: CarService,
    private fb: FormBuilder
  ) {
    this.dataSource = new MatTableDataSource<ReservationData>();
    this.searchForm = this.fb.group({
      carId: [''],
      startDate: [null],
      endDate: [null],
      status: ['']
    });

    // Custom filter predicate
    this.dataSource.filterPredicate = (data: ReservationData, filter: string) => {
      const searchStr = filter.toLowerCase();
      
      // Helper function to safely check if a string includes the search term
      const includes = (str: any) => 
        String(str || '').toLowerCase().includes(searchStr);

      return (
        // Customer details
        includes(data.Customer?.name) ||
        includes(data.Customer?.phone) ||
        includes(data.Customer?.email) ||
        // Office details
        includes(data.Car?.Office?.name) ||
        includes(data.Car?.Office?.location) ||
        // Car details
        includes(data.Car?.model) ||
        includes(data.Car?.plateId) ||
        includes(data.Car?.category) ||
        includes(data.Car?.year) ||
        // Reservation details
        includes(data.status) ||
        // Payment details
        includes(data.Payment?.paymentMethod) ||
        includes(data.Payment?.paymentStatus)
      );
    };
  }

  ngOnInit() {
    this.loadCustomers();
    this.loadReport();
  }

  loadCustomers() {
    this.reservationService.getAllCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
      }
    });
  }

  loadReport() {
    const customerId = this.searchForm.get('carId')?.value;
    let startDate = this.searchForm.get('startDate')?.value;
    let endDate = this.searchForm.get('endDate')?.value;
    const status = this.searchForm.get('status')?.value;

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

    this.reservationService.getCustomerReport(customerId).subscribe({
      next: (data: ReservationData[]) => {
        // Filter data based on selected filters
        let filteredData = data;
        
        if (startDate) {
          filteredData = filteredData.filter(item => 
            this.formatDateOnly(item.startDate) === startDate);
        }
        if (endDate) {
          filteredData = filteredData.filter(item => 
            this.formatDateOnly(item.endDate) === endDate);
        }
        if (status) {
          filteredData = filteredData.filter(item => 
            item.status === status);
        }

        // Format the dates in the response for display
        this.dataSource.data = filteredData.map(item => ({
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Reset filters
  resetFilters() {
    this.searchForm.patchValue({
      startDate: null,
      endDate: null,
      status: ''
    });
    this.loadReport();
  }
}
