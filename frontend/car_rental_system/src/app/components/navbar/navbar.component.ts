import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [
        MatToolbarModule,
        MatButtonModule,
        CommonModule,
        RouterModule
    ],
    template: `
        <mat-toolbar color="primary">
            <span>Car Rental System</span>
            <span class="spacer"></span>
            <button mat-button routerLink="/cars">Cars</button>
            <button mat-button routerLink="/my-reservations">My Reservations</button>
            <button *ngIf="loginService.isLoggedIn()" mat-button routerLink="/register-car">Register Car</button>
            <button *ngIf="loginService.isLoggedIn()" mat-raised-button color="warn" (click)="logout()">Logout</button>
            <button *ngIf="!loginService.isLoggedIn()" mat-button routerLink="/login">Login</button>
        </mat-toolbar>
    `,
    styles: [`
        .spacer {
            flex: 1 1 auto;
        }
        mat-toolbar {
            display: flex;
            gap: 1rem;
            padding: 0 1rem;
        }
        button {
            margin-left: 8px;
        }
    `]
})
export class NavbarComponent {
    constructor(
        public loginService: LoginService,
        private router: Router
    ) { }

    logout() {
        this.loginService.logout();
        this.router.navigate(['/login']);
    }
} 