import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})

export class CarService {
    private apiUrl = 'http://localhost:3000/api';

    constructor(private http: HttpClient) { }

    getAllCars(): Observable<any[]> {
        console.log('Fetching all cars...');
        return this.http.get<any[]>(`${this.apiUrl}/cars`).pipe(
            tap(cars => console.log('Cars received:', cars))
        );
    }

    getOffices(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/offices`);
    }

    registerCar(carData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/cars`, carData);
    }

    updateCarStatus(carId: number, status: string): Observable<any> {
        return this.http.patch(`${this.apiUrl}/cars/${carId}/status`, { status });
    }

    searchCars(params: any): Observable<any> {
        // Convert params to query string
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
          if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
            if (Array.isArray(params[key])) {
              params[key].forEach((value: string) => {
                queryParams.append(key, value);
              });
            } else {
              queryParams.append(key, params[key]);
            }
          }
        });
        
        return this.http.get<any>(`${this.apiUrl}/cars/search?${queryParams.toString()}`);
    }

    getFeatures(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/cars/features`);
    }
}