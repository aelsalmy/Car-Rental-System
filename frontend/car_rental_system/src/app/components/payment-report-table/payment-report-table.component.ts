import { Component, Input, OnChanges, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface PaymentData {
  id: number;
  amount: string;
  paymentMethod: string;
  paymentStatus: string;
  updatedAt: string;
  Car: {
    model: string;
    year: number;
    plateId: string;
    officeId: number;
    Office: {
      id: number;
      name: string;
      location: string;
      phone: string;
    } | null;
  };
  Customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
}

@Component({
  selector: 'app-payment-report-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './payment-report-table.component.html',
  styleUrls: ['./payment-report-table.component.css']
})
export class PaymentReportTableComponent implements OnChanges, AfterViewInit {
  @Input() payments: PaymentData[] = [];
  @Input() filteredData: PaymentData[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource: MatTableDataSource<PaymentData>;

  displayedColumns: string[] = [
    'carModel',
    'plateId',
    'customerName',
    'customerPhone',
    'officeLocation',
    'paymentStatus',
    'amount'
  ];

  constructor() {
    this.dataSource = new MatTableDataSource<PaymentData>([]);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnChanges() {
    if (this.filteredData) {
      this.dataSource.data = this.filteredData;
    }
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }

  getOfficeName(car: any): string {
    return car?.Office?.name || 'N/A';
  }

  getOfficeLocation(car: any): string {
    return car?.Office?.location || 'N/A';
  }
}
