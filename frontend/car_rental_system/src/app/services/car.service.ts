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
        console.log("Offices Service invoked")
        return this.http.get<any[]>(`${this.apiUrl}/offices`);
    }

    registerCar(carData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/cars`, carData);
    }

    updateCarStatus(carId: number, status: string): Observable<any> {
        return this.http.patch(`${this.apiUrl}/cars/${carId}/status`, { status });
    }
} 