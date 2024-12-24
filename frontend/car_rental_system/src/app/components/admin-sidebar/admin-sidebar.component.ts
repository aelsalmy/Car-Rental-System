import { Component, EventEmitter, Output } from '@angular/core';
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

  @Output() changeView = new EventEmitter<string>();

  isOpen = false;
  
  menuItems = [
    {
      title: 'Car Management',
      icon: 'directions_car',
      children: [
        { title: 'Register New Car', page: 'RegisterCar' },
        { title: 'Update Car Status', page: 'CarList' },
        { title: 'View All Cars', page: 'CarList' }
      ]
    },
    {
      title: 'Reports',
      icon: 'assessment',
      children: [
        { title: 'Period Reservations', page: 'CarList' },
        { title: 'Car Reservations', page: 'CarList' },
        { title: 'Car Status Report', page: 'CarList' },
        { title: 'Customer Reservations', page: 'CarList' },
        { title: 'Payment Reports', page: 'CarList' }
      ]
    },
    {
      title: 'Advanced Search',
      icon: 'search',
      children: [
        { title: 'Search Cars', page: 'CarList' },
        { title: 'Search Customers', page: 'CarList' },
        { title: 'Search Reservations', page: 'CarList' }
      ]
    }
  ];

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  onChangeView(newView: string){
    this.toggleSidebar()
    this.changeView.emit(newView)
  }
}
