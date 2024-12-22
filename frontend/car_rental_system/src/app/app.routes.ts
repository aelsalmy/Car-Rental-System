import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { CarRegistrationComponent } from './components/car-registration/car-registration.component';
import { CarListingComponent } from './components/car-listing/car-listing.component';
import { ReservationComponent } from './components/reservation/reservation.component';
import { MyReservationsComponent } from './components/my-reservations/my-reservations.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegistrationComponent },
    { path: 'car-registration', component: CarRegistrationComponent },
    { path: 'cars', component: CarListingComponent },
    { path: 'reservation/:id', component: ReservationComponent },
    { path: 'my-reservations', component: MyReservationsComponent }
];
