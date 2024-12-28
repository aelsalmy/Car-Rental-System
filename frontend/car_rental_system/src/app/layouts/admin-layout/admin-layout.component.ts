import { Component } from '@angular/core';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar.component';
import { HomePageComponent } from '../../components/home-page/home-page.component';
import { CarRegistrationComponent } from '../../components/car-registration/car-registration.component';
import { CarListingComponent } from '../../components/car-listing/car-listing.component';
import { CarReservationsComponent } from '../../components/car-reservations/car-reservations.component';
import { ReservationReportComponent } from '../../components/reservation-report/reservation-report.component';
import { CarReportComponent } from '../../components/car-report/car-report.component';
import { CommonModule } from '@angular/common';

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
    CarReportComponent
  ],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar (changeView)="changeView($event)"></app-admin-sidebar>
      <div class="admin-content">
        <ng-container [ngSwitch]="activeView">
          <app-home-page *ngSwitchCase="'Dashboard'"></app-home-page>
          <app-car-registration *ngSwitchCase="'RegisterCar'"></app-car-registration>
          <app-car-listing *ngSwitchCase="'CarList'"></app-car-listing>
          <app-car-reservations *ngSwitchCase="'CarReservations'"></app-car-reservations>
          <app-reservation-report *ngSwitchCase="'ReservationReport'"></app-reservation-report>
          <app-car-report *ngSwitchCase="'CarReport'"></app-car-report>
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
      padding: 20px;
      margin-left: 60px; /* Space for the collapsed sidebar */
    }
  `]
})
export class AdminLayoutComponent {
  activeView: string = 'CarList';

  changeView(view: string) {
    this.activeView = view;
  }
}
