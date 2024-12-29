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
import { CarReportTableComponent } from '../car-report-table/car-report-table.component';

@Component({
  selector: 'app-status-report',
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
      CarReportTableComponent
    ],
  templateUrl: './status-report.component.html',
  styleUrl: './status-report.component.css'
})
export class StatusReportComponent {
  dataSource: MatTableDataSource<any>;
  searchForm: FormGroup;
  cars: any[] = [];

  readonly statuses = [
      {id: 'rented' , name: 'Rented'},
      {id: 'out_of_service' , name: 'Out Of Service'},
      {id: 'active' , name: 'Active'}
    ];
  statusParam: string = '';
  
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

      const status = this.searchForm.get('carId')?.value;
  
      // Custom filter predicate
      this.dataSource.filterPredicate = (data: any, filter: string) => {
        const searchStr = filter.toLowerCase();
        return (
          // Customer details
          (data.Customer?.name || '').toLowerCase().includes(searchStr) ||
          (data.Customer?.phone || '').toLowerCase().includes(searchStr) ||
          (data.Customer?.email || '').toLowerCase().includes(searchStr) ||
          // Office details
          (data.Office?.name || '').toLowerCase().includes(searchStr) ||
          (data.Office?.location || '').toLowerCase().includes(searchStr) ||
          // Reservation details
          (data.status || '').toLowerCase().includes(searchStr) ||
          // Car details
          (data.Car.model || '').toLowerCase().includes(searchStr) ||
          (data.Car.year || '').toLowerCase().includes(searchStr)

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
      const status = this.searchForm.get('carId')?.value;
      const startDate = this.searchForm.get('startDate')?.value;
  
      // Convert dates if they exist
      const date = startDate ? new Date(startDate).toISOString() : undefined;
      this.statusParam = status;
      
      console.log('Date: ' + date + ' Status: ' + status)
  
      this.carService.getStatusReport(status , date).subscribe({
        next: (data) => {
          console.log('received cars acc to status: ');
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
