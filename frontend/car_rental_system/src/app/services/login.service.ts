import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginResponse } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})

export class LoginService {
  private baseUrl = 'http://localhost:3000';
  private tokenKey = 'token';

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<LoginResponse> {
    console.log('Attempting login with:', username);
    return this.http.post<LoginResponse>(`${this.baseUrl}/api/auth/login`, { username, password })
      .pipe(
        tap((response: LoginResponse) => {
          console.log('Login response:', response);
          if (response.token) {
            localStorage.clear();
            localStorage.setItem(this.tokenKey, response.token);
            console.log('Token stored:', response.token);
          }
        })
      );
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');
    console.log('Getting token from storage:', token);
    return token;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    console.log('Checking if logged in, token:', token);
    return !!token;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    console.log('User logged out, token removed');
  }
}
