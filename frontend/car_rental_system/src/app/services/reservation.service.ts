import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginService } from './login.service';

@Injectable({
    providedIn: 'root'
})
export class ReservationService {
    private baseUrl = 'http://localhost:3000/api';

    constructor(
        private http: HttpClient,
        private loginService: LoginService
    ) { }

    createReservation(reservationData: any): Observable<any> {
        const token = this.loginService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }
        const reservationWithStatus = {
            ...reservationData,
            status: 'rented',
        };

        return this.http.post(`${this.baseUrl}/reservations`, reservationWithStatus);
    }

    getCarDetails(carId: number): Observable<any> {
        return this.http.get(`${this.baseUrl}/cars/${carId}`);
    }

    getMyReservations(): Observable<any> {
        return this.http.get(`${this.baseUrl}/reservations/my`);
    }

    cancelReservation(reservationId: number): Observable<any> {
        return this.http.patch(`${this.baseUrl}/reservations/${reservationId}/cancel`, {});
    }

    updateCarStatus(carId: number, status: string): Observable<any> {
        return this.http.patch(`${this.baseUrl}/cars/${carId}/status`, { status });
    }
} 