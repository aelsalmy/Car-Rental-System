import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-nav-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterModule],
  template: `
    <div class="nav-header" *ngIf="authService.isLoggedIn()">
      <div class="left-section">
        <button *ngIf="authService.isAdmin$ | async" 
                mat-icon-button 
                class="menu-button"
                (click)="toggleSidebar()">
          <mat-icon>menu</mat-icon>
        </button>
        <button *ngIf="!(authService.isAdmin$ | async)"
                mat-raised-button
                color="basic"
                class="white-button"
                routerLink="/my-reservations">
          <mat-icon>list_alt</mat-icon>
          My Reservations
        </button>
      </div>
      <div class="right-section">
        <button mat-raised-button 
                color="basic"
                class="white-button"
                (click)="logout()">
          <mat-icon>logout</mat-icon>
          Logout
        </button>
      </div>
    </div>
  `,
  styles: [`
    .nav-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      background-color: #1976d2;
      border-bottom: 1px solid #e0e0e0;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      height: 48px;
    }

    .left-section, .right-section {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .menu-button {
      color: white;
    }

    .white-button {
      background-color: white;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .white-button mat-icon {
      font-size: 20px;
      height: 20px;
      width: 20px;
    }
  `]
})
export class NavHeaderComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  toggleSidebar() {
    // Implementation for sidebar toggle
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
