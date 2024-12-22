import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        MatButtonModule
    ],
    template: `
        <div class="dashboard-actions">
            <button mat-raised-button color="primary" (click)="registerCar()">Register New Car</button>
            <button mat-raised-button color="warn" (click)="logout()">Logout</button>
        </div>
    `,
    styles: [`
        .dashboard-actions {
            display: flex;
            gap: 1rem;
            margin: 1rem;
        }
    `]
})
export class DashboardComponent {
    constructor(
        private router: Router,
        private loginService: LoginService
    ) { }

    registerCar() {
        this.router.navigate(['/register-car']);
    }

    logout() {
        this.loginService.logout();
        this.router.navigate(['/login']);
    }
} 