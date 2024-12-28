import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [
        MatToolbarModule,
        MatButtonModule,
        CommonModule,
        RouterModule,
        MatIconModule
    ],
    templateUrl: './navbar.component.html',
    styleUrls: [
        './navbar.component.css'
    ]
})
export class NavbarComponent {
    constructor(
        public loginService: LoginService,
        private router: Router
    ) { }

    get isAdmin(): boolean {
        return this.loginService.isAdmin();
    }

    logout() {
        this.loginService.logout();
        this.router.navigate(['/login']);
    }
}