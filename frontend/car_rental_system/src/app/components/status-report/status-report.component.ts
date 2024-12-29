import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service';
import { CarService } from '../../services/car.service';
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
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule,
    CarReportTableComponent
  ],
  templateUrl: './status-report.component.html',
  styleUrls: ['./status-report.component.css']
})
export class StatusReportComponent implements OnInit {
  dataSource: MatTableDataSource<any>;
  searchForm: FormGroup;
  statusParam: string = '';
  statuses = [
    { id: 'active', name: 'Active' },
    { id: 'out_of_service', name: 'Out of Service' },
    { id: 'rented', name: 'Rented' }
  ];

  constructor(
    private reservationService: ReservationService,
    private carService: CarService,
    private fb: FormBuilder
  ) {
    this.dataSource = new MatTableDataSource();
    this.searchForm = this.fb.group({
      carId: ['']
    });

    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (
        // Car details
        (data.model || '').toLowerCase().includes(searchStr) ||
        (data.plateId || '').toLowerCase().includes(searchStr) ||
        (data.category || '').toLowerCase().includes(searchStr) ||
        // Office details
        (data.Office?.name || '').toLowerCase().includes(searchStr) ||
        (data.Office?.location || '').toLowerCase().includes(searchStr)
      );
    };
  }

  ngOnInit() {
    this.loadReport();

    // Subscribe to value changes
    this.searchForm.get('carId')?.valueChanges.subscribe(value => {
      this.statusParam = value;
      this.loadReport();
    });
  }

  loadReport() {
    const status = this.searchForm.get('carId')?.value;
    this.statusParam = status;
    
    this.carService.getStatusReport(status).subscribe({
      next: (data: any) => {
        console.log('Get Cars by Status Report: ', JSON.stringify(data, null, 2));
        this.dataSource.data = data;
      },
      error: (error: any) => {
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
    
    // Reset status param
    this.statusParam = '';
    
    // Reload the report with no filters
    this.loadReport();
  }
}
