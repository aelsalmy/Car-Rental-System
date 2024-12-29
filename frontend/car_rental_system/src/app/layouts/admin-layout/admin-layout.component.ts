import { Component, OnInit } from '@angular/core';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar.component';
import { HomePageComponent } from '../../components/home-page/home-page.component';
import { CarRegistrationComponent } from '../../components/car-registration/car-registration.component';
import { CarListingComponent } from '../../components/car-listing/car-listing.component';
import { CarReservationsComponent } from '../../components/car-reservations/car-reservations.component';
import { ReservationReportComponent } from '../../components/reservation-report/reservation-report.component';
import { CarReportComponent } from '../../components/car-report/car-report.component';
import { CommonModule } from '@angular/common';
import { StatusReportComponent } from '../../components/status-report/status-report.component';
import { CustomerReportComponent } from '../../components/customer-report/customer-report.component';
import { PaymentReportComponent } from '../../components/payment-report/payment-report.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    AdminSidebarComponent,
    HomePageComponent,
    CarRegistrationComponent,
    CarListingComponent,
    CarReservationsComponent,
    ReservationReportComponent,
    CarReportComponent,
    StatusReportComponent,
    CustomerReportComponent,
    PaymentReportComponent
  ],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar (changeView)="changeView($event)"></app-admin-sidebar>
      <div class="admin-content">
        <ng-container [ngSwitch]="activeView">
          <app-home-page *ngSwitchCase="'Dashboard'"></app-home-page>
          <app-car-registration *ngSwitchCase="'RegisterCar'" (registrationSuccess)="onCarRegistered()"></app-car-registration>
          <app-car-listing *ngSwitchCase="'CarList'"></app-car-listing>
          <app-car-reservations *ngSwitchCase="'CarReservations'"></app-car-reservations>
          <app-reservation-report *ngSwitchCase="'ReservationReport'"></app-reservation-report>
          <app-car-report *ngSwitchCase="'CarReport'"></app-car-report>
          <app-status-report *ngSwitchCase="'StatusReport'"></app-status-report>
          <app-customer-report *ngSwitchCase="'CustomerReport'"></app-customer-report>
          <app-payment-report *ngSwitchCase="'PaymentReport'"></app-payment-report>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
    }
    .admin-content {
      flex: 1;
      padding: 10px;
    }
  `]
})
export class AdminLayoutComponent implements OnInit {
  activeView = 'CarList';

  ngOnInit() {
    history.pushState(null, '', location.href);
    window.onpopstate = function () {
      history.pushState(null, '', location.href);
    };
  }

  changeView(view: string) {
    this.activeView = view;
  }

  onCarRegistered() {
    this.activeView = 'CarList';
  }
}
