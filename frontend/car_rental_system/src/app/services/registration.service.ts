import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private registerUrl = 'http://localhost:3000/api/auth/register';

  constructor(private http: HttpClient) { }

  register(
    username: string, 
    password: string, 
    name: string, 
    email: string, 
    phone: string, 
    address: string
  ): Observable<any> {
    const registrationData = {
      username,
      password,
      customerInfo: {
        name,
        email,
        phone,
        address
      }
    };
    console.log('Sending registration data:', registrationData);
    return this.http.post<any>(this.registerUrl, registrationData);
  }
}
