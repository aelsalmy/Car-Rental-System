import { Component, Input, ViewChild } from '@angular/core';
import { CarListingComponent } from '../car-listing/car-listing.component';
import { NgIf } from '@angular/common';
import { AdminLayoutComponent } from '../../layouts/admin-layout/admin-layout.component';
import { CarReservationsComponent } from '../car-reservations/car-reservations.component';
import { CarRegistrationComponent } from '../car-registration/car-registration.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CarListingComponent , NgIf , CarRegistrationComponent , CarReservationsComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {
  @Input() activeView: string = ''

}
