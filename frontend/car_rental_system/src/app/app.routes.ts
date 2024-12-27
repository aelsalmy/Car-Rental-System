import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { CarRegistrationComponent } from './components/car-registration/car-registration.component';
import { CarListingComponent } from './components/car-listing/car-listing.component';
import { ReservationComponent } from './components/reservation/reservation.component';
import { MyReservationsComponent } from './components/my-reservations/my-reservations.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { adminGuard } from './guards/admin.guard';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';
import { HomePageComponent } from './components/home-page/home-page.component';
import { ReservationReportComponent } from './components/reservation-report/reservation-report.component';
import { CarReservationsComponent } from './components/car-reservations/car-reservations.component';
import { CarReportComponent } from './components/car-report/car-report.component';

export const routes: Routes = [
    { 
        path: '', 
        redirectTo: 'cars', 
        pathMatch: 'full'
    },
    { 
        path: 'login', 
        component: LoginComponent,
        canActivate: [loginGuard]
    },
    { 
        path: 'register', 
        component: RegistrationComponent,
        canActivate: [loginGuard]
    },
    { 
        path: 'admin',
        component: AdminLayoutComponent,
        canActivate: [authGuard, adminGuard],
        children: [
            { path: '', redirectTo: 'cars/view-all', pathMatch: 'full' },
            { path: 'dashboard', component: HomePageComponent },
            { path: 'cars/register', component: CarRegistrationComponent },
            { path: 'cars/view-all', component: CarListingComponent },
            { path: 'reservations', component: CarReservationsComponent },
            { path: 'reports/reservations', component: ReservationReportComponent },
            { path: 'reports/car-report', component: CarReportComponent }
        ]
    },
    { 
        path: 'cars', 
        component: CarListingComponent,
        canActivate: [authGuard]
    },
    { 
        path: 'reservation', 
        component: ReservationComponent,
        canActivate: [authGuard]
    },
    { 
        path: 'my-reservations', 
        component: MyReservationsComponent,
        canActivate: [authGuard]
    },
    {
        path: '**',
        redirectTo: 'cars'
    }
];
