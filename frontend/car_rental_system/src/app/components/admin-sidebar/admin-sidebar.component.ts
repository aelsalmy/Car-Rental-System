import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent {
  @Output() changeView = new EventEmitter<string>();
  
  isOpen = false;
  
  menuItems = [
    {
      title: 'Car Management',
      icon: 'directions_car',
      children: [
        { title: 'Register New Car', page: 'RegisterCar' },
        { title: 'View All Cars', page: 'CarList' },
        { title: 'View Car Reservations', page: 'CarReservations' }
      ]
    },
    {
      title: 'Reports',
      icon: 'assessment',
      children: [
        { title: 'Period Reservations', page: 'ReservationReport' },
        { title: 'Car Reservations', page: 'CarReport' },
        { title: 'Car Status Report', page: 'StatusReport' },
        { title: 'Customer Reservations', page: 'CustomerReport' },
        { title: 'Payment Reports', page: 'PaymentReport' }
      ]
    },
    {
      title: 'Customer Search',
      icon: 'person_search',
      children: [
        { title: 'Search Customers', page: 'CustomerSearch' }
      ]
    }
  ];

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  onChangeView(page: string) {
    console.log('Changing view to:', page);
    this.changeView.emit(page);
    this.isOpen = false;
  }
}
