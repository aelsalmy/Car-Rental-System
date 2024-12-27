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

        // Don't set the status here, let the backend handle it
        const reservationRequest = {
            ...reservationData
        };

        return this.http.post(`${this.baseUrl}/reservations`, reservationRequest);
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

    deleteReservation(reservationId: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/reservations/${reservationId}/delete`, {});
    }

    updateCarStatus(carId: number, status: string): Observable<any> {
        return this.http.patch(`${this.baseUrl}/cars/${carId}/status`, { status });
    }

    getAllReservations(): Observable<any[]>{
        return this.http.get<any[]>(`${this.baseUrl}/reservations/getAll`);
    }
}