import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class LoginService {
  private loginAPIUrl = 'http://localhost:3000/login';

  constructor(private http: HttpClient) { }

  login(username: string , password: string): Observable<any>{
    return this.http.post<any>(this.loginAPIUrl , {username , password})
  }
}
