import { Component , Input , ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule , MatTableDataSource , MatTable} from '@angular/material/table';
import { MatPaginatorModule , MatPaginator} from '@angular/material/paginator';
import { MatSortModule , MatSort} from '@angular/material/sort';

@Component({
  selector: 'app-payment-report-table',
  standalone: true,
  imports: [MatTableModule , MatPaginatorModule , MatSortModule , CommonModule],
  templateUrl: './payment-report-table.component.html',
  styleUrl: './payment-report-table.component.css'
})
export class PaymentReportTableComponent {
    @Input() dataSource!: MatTableDataSource<any>;
    @Input() status!: string;
  
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatTable) table!: MatTable<any>;
  
    displayedColumns: string[] = [
        'customerName',
        'carModel',
        'modelYear',
        'carPlate',
        'customerPhone',
        'officeName',
        'paymentDate',
        'paymentMethod',
        'amount'
      ];
  
    ngAfterViewInit(){
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  
      // Format date to show exact input date and time
    formatDate(date: string): string {
      if (!date) return '';
      const d = new Date(date);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    }  
}
