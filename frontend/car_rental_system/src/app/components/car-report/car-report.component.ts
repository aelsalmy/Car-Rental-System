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

interface Reservation {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  Car: {
    model: string;
    plateId: string;
    Office: {
      name: string;
      location: string;
    };
  };
  Customer: {
    name: string;
    email: string;
    phone: string;
  };
  Payment: {
    amount: number;
    paymentStatus: string;
  };
}

@Component({
  selector: 'app-car-report',
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
  templateUrl: './car-report.component.html',
  styleUrls: ['./car-report.component.css']
})
export class CarReportComponent implements OnInit {

  dataSource: MatTableDataSource<Reservation>;
  searchForm: FormGroup;
  cars: any[] = [];

  constructor(
    private reservationService: ReservationService,
    private carService: CarService,
    private fb: FormBuilder
  ) {
    this.dataSource = new MatTableDataSource<Reservation>();
    this.searchForm = this.fb.group({
      carId: [''],
      startDate: [''],
      endDate: ['']
    });

    // Custom filter predicate
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (
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
    this.loadCars();
    this.loadReport();
  }

  loadCars() {
    this.carService.getAllCars().subscribe({
      next: (cars) => {
        this.cars = cars;
      },
      error: (error) => {
        console.error('Error loading cars:', error);
      }
    });
  }

  loadReport() {
    const carId = this.searchForm.get('carId')?.value;
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

    this.reservationService.getCarReservationReport(carId, startDate, endDate).subscribe({
      next: (data: Reservation[]) => {
        // Format the dates in the response for display
        this.dataSource.data = data.map((item: Reservation) => ({
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

  // Helper method to format dates for display
  formatDateOnly(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0');
  }

  // Format date to show exact input date and time
  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  }
}
