import { Component, OnInit  , ViewChild} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule} from '@angular/material/grid-list'
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { ReservationService } from '../../services/reservation.service';
import { MatTableModule , MatTableDataSource , MatTable} from '@angular/material/table';
import { MatPaginatorModule , MatPaginator} from '@angular/material/paginator';
import { MatSortModule , MatSort} from '@angular/material/sort';

@Component({
  selector: 'app-customer-search',
  standalone: true,
  imports: [
          MatCardModule,
          MatButtonModule,
          MatSelectModule,
          MatMenuModule,
          MatFormFieldModule,
          MatInputModule,
          CommonModule,
          RouterModule,
          FormsModule,
          MatGridListModule,
          MatIconModule,
          MatExpansionModule,
          MatChipsModule,
          MatTableModule,
          MatPaginatorModule,
          MatSortModule
      ],
  templateUrl: './customer-search.component.html',
  styleUrl: './customer-search.component.css'
})
export class CustomerSearchComponent {
    customers: any[] = [];
    searchTerm = '';

    dataSource!: MatTableDataSource<any>;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatTable) table!: MatTable<any>;

    displayedColumns: string[] = [
      'customerName',
      'customerPhone',
      'customerEmail',
      'customerAddress'
    ];

    constructor(
        public authService: AuthService,
        private reservationService: ReservationService,
        private router: Router
    ) { 
      this.dataSource = new MatTableDataSource();

      this.dataSource.filterPredicate = (data: any, filter: string) => {
        const searchStr = filter.toLowerCase();
        console.log('Search String: ' , searchStr)
        return (
          // Customer details
          (data.name || '').toLowerCase().includes(searchStr) ||
          (data.phone || '').toLowerCase().includes(searchStr) ||
          (data.email || '').toLowerCase().includes(searchStr)
        );
      };
    }

  ngOnInit() {
    this.loadCustomers();
        
    // Add this line to debug admin status
    this.authService.isAdmin$.subscribe(isAdmin => {
        console.log('Is user admin?', isAdmin);
    });
  }

  loadCustomers() {
    this.reservationService.getAllCustomers().subscribe({
      next: (customers) => {
        console.log('Customer:' , customers)
        this.dataSource.data = customers;
      },
      error: (error) => {
        console.error('Error loading cars:', error);
      }
    });
  }

  applyFilters(event: Event) {
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
