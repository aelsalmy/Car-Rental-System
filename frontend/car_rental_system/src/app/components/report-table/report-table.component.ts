import { Component , Input , ViewChild} from '@angular/core';
import { MatTableModule , MatTableDataSource , MatTable} from '@angular/material/table';
import { MatPaginatorModule , MatPaginator} from '@angular/material/paginator';
import { MatSortModule , MatSort} from '@angular/material/sort';

@Component({
  selector: 'app-report-table',
  standalone: true,
  imports: [MatTableModule , MatPaginatorModule , MatSortModule],
  templateUrl: './report-table.component.html',
  styleUrl: './report-table.component.css'
})
export class ReportTableComponent {
  @Input() dataSource!: MatTableDataSource<any>;
  @Input() report!: string;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<any>;

  

  displayedColumns: string[] = [
      'startDate',
      'endDate',
      'carModel',
      'carPlate',
      'customerName',
      'customerPhone',
      'officeName',
      'status',
      'amount'
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
