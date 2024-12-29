import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

interface LoginResponse {
  message: string;
  token: string;
  userId: number;
}

interface DecodedToken {
  id: number;
  username: string;
  role: string;
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private isAdminSubject = new BehaviorSubject<boolean>(false);
  private lastCheckedToken: string | null = null;
  public token$ = this.tokenSubject.asObservable();
  public isAdmin$ = this.isAdminSubject.asObservable();
  public isNotAdmin$ = !this.isAdminSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  checkAuthStatus(): void {
    const token = localStorage.getItem('token');
    
    if (token === this.lastCheckedToken) {
      return;
    }
    
    this.lastCheckedToken = token;

    if (!token) {
      this.clearAuth();
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      if (decoded.exp * 1000 <= Date.now()) {
        this.clearAuth();
        return;
      }

      if (this.tokenSubject.value !== token) {
        this.tokenSubject.next(token);
      }
      
      const isAdmin = decoded.role === 'admin';
      if (this.isAdminSubject.value !== isAdmin) {
        this.isAdminSubject.next(isAdmin);
      }
    } catch {
      this.clearAuth();
    }
  }

  private clearAuth(): void {
    this.lastCheckedToken = null;
    localStorage.removeItem('token');
    
    if (this.tokenSubject.value !== null) {
      this.tokenSubject.next(null);
    }
    
    if (this.isAdminSubject.value !== false) {
      this.isAdminSubject.next(false);
    }

    const currentUrl = this.router.url;
    if (!currentUrl.includes('/login') && !currentUrl.includes('/register')) {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          this.lastCheckedToken = response.token;
          const decoded = jwtDecode<DecodedToken>(response.token);
          this.tokenSubject.next(response.token);
          this.isAdminSubject.next(decoded.role === 'admin');
        })
      );
  }

  logout(): void {
    this.clearAuth();
  }

  isLoggedIn(): boolean {
    this.checkAuthStatus();
    return this.tokenSubject.value !== null;
  }

  isAdmin(): boolean {
    this.checkAuthStatus();
    return this.isAdminSubject.value;
  }

  getToken(): string | null {
    this.checkAuthStatus();
    return this.tokenSubject.value;
  }
}
