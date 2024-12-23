import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './auth.service';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private history: string[] = [];

  constructor(
    private router: Router,
    private location: Location,
    private authService: AuthService
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.history.push(event.urlAfterRedirects);
        this.authService.checkAuthStatus();
      });
  }

  back(): void {
    this.history.pop();
    if (this.history.length > 0) {
      const previousUrl = this.history[this.history.length - 1];
      this.router.navigateByUrl(previousUrl);
    } else {
      this.router.navigate(['/']);
    }
    this.authService.checkAuthStatus();
  }

  forward(): void {
    this.authService.checkAuthStatus();
    this.location.forward();
  }

  handlePopState(): void {
    this.authService.checkAuthStatus();
  }
}
