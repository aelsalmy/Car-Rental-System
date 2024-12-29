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

  dataSource: MatTableDataSource<any>;
  searchForm: FormGroup;
  cars: any[] = [];

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
    const startDate = this.searchForm.get('startDate')?.value;
    const endDate = this.searchForm.get('endDate')?.value;

    // Convert dates if they exist
    const start = startDate ? new Date(startDate).toISOString() : undefined;
    const end = endDate ? new Date(endDate).toISOString() : undefined;

    this.reservationService.getCarReservationReport(carId, start, end).subscribe({
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

  // Format date to show exact input date and time
  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  }
}
