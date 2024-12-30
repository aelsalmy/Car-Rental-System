import { Component , Input , ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule , MatTableDataSource , MatTable} from '@angular/material/table';
import { MatPaginatorModule , MatPaginator} from '@angular/material/paginator';
import { MatSortModule , MatSort} from '@angular/material/sort';

@Component({
  selector: 'app-car-report-table',
  standalone: true,
  imports: [MatTableModule , MatPaginatorModule , MatSortModule , CommonModule],
  templateUrl: './car-report-table.component.html',
  styleUrl: './car-report-table.component.css'
})

export class CarReportTableComponent {
  @Input() dataSource!: MatTableDataSource<any>;
  @Input() status!: string;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<any>;

  displayedColumns: string[] = [
      'carModel',
      'modelYear',
      'carPlate',
      'customerName',
      'customerPhone',
      'officeName',
      'status'
    ];

  ngAfterViewInit(){
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

    // Format date to show only the date part
    formatDate(date: string): string {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString();
    }  
}
