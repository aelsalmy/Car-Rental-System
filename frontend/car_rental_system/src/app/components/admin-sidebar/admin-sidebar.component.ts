import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent {
  isOpen = false;
  
  menuItems = [
    {
      title: 'Car Management',
      icon: 'directions_car',
      children: [
        { title: 'Register New Car', route: '/admin/cars/register' },
        { title: 'Update Car Status', route: '/admin/cars/status' },
        { title: 'View All Cars', route: '/admin/cars/view-all' }
      ]
    },
    {
      title: 'Reports',
      icon: 'assessment',
      children: [
        { title: 'Period Reservations', route: '/admin/reports/period-reservations' },
        { title: 'Car Reservations', route: '/admin/reports/car-reservations' },
        { title: 'Car Status Report', route: '/admin/reports/car-status' },
        { title: 'Customer Reservations', route: '/admin/reports/customer-reservations' },
        { title: 'Payment Reports', route: '/admin/reports/payments' }
      ]
    },
    {
      title: 'Advanced Search',
      icon: 'search',
      children: [
        { title: 'Search Cars', route: '/admin/search/cars' },
        { title: 'Search Customers', route: '/admin/search/customers' },
        { title: 'Search Reservations', route: '/admin/search/reservations' }
      ]
    }
  ];

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }
}
