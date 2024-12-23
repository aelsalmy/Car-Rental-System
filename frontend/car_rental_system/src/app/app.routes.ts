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
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'cars/register', component: CarRegistrationComponent },
            { path: 'cars/view-all', component: CarListingComponent },
            { path: 'reservations', component: MyReservationsComponent }
        ]
    },
    { 
        path: 'cars', 
        component: CarListingComponent,
        canActivate: [authGuard]
    },
    { 
        path: 'reservation/:id', 
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
