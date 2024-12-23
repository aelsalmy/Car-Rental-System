import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { AdminSidebarComponent } from './components/admin-sidebar/admin-sidebar.component';
import { NavHeaderComponent } from './components/nav-header/nav-header.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AdminSidebarComponent, CommonModule, AsyncPipe, NavHeaderComponent],
  template: `
    <app-nav-header></app-nav-header>
    <div class="app-container" [class.logged-in]="authService.isLoggedIn()">
      <app-admin-sidebar *ngIf="authService.isAdmin$ | async"></app-admin-sidebar>
      <div class="main-content" [class.with-sidebar]="authService.isAdmin$ | async">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      min-height: 100vh;
    }

    .app-container.logged-in {
      padding-top: 48px;
    }

    .main-content {
      flex: 1;
      padding: 20px;
      transition: margin-left 0.3s ease;
    }

    .main-content.with-sidebar {
      margin-left: 60px;
    }
  `]
})
export class AppComponent implements OnInit {
  constructor(
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.checkAuthStatus();
  }
}
