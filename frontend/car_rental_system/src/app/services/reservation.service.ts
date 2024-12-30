import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, tap, catchError } from 'rxjs';
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

        const url = `${this.baseUrl}/reservations`;
        const { carId, startDate, endDate, totalCost, paymentMethod, paymentStatus } = reservationData;
        
        const reservationRequest = {
            carId,
            startDate,
            endDate,
            totalCost,
            paymentMethod,
            paymentStatus
        };

        return this.http.post(url, reservationRequest);
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
        const token = this.loginService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.get<any[]>(`${this.baseUrl}/reservations/getAll`, { headers });
    }

    updateReservationStatus(reservationId: number, status: string): Observable<any> {
        const token = this.loginService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.patch(`${this.baseUrl}/reservations/${reservationId}/status`, { status }, { headers });
    }

    searchReservations(searchParams: any): Observable<any[]> {
        const token = this.loginService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        // Convert the search params to query string
        const queryParams = new URLSearchParams();
        Object.keys(searchParams).forEach(key => {
            if (searchParams[key]) {
                queryParams.append(key, searchParams[key]);
            }
        });

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        return this.http.get<any[]>(`${this.baseUrl}/reservations/search?${queryParams.toString()}`, { headers });
    }

    getReservationReport(startDate?: string, endDate?: string): Observable<any> {
        const token = this.loginService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        let url = `${this.baseUrl}/reports/reservation`;
        const params = new URLSearchParams();
        
        if (startDate) {
            params.append('startDate', startDate);
        }
        if (endDate) {
            params.append('endDate', endDate);
        }

        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        console.log('Prior to http call')
        return this.http.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    getCarReservationReport(carId?: number, startDate?: string, endDate?: string): Observable<any> {
        const token = this.loginService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        let url = `${this.baseUrl}/reports/car`;
        const params = new URLSearchParams();
        
        if (carId) {
            params.append('carId', carId.toString());
        }
        if (startDate) {
            params.append('startDate', startDate);
        }
        if (endDate) {
            params.append('endDate', endDate);
        }

        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        return this.http.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    getAllCustomers(): Observable<any>{
        const url = `${this.baseUrl}/reservations/customers`;
        const token = this.loginService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.get<any[]>(url, { headers });
    }

    getCustomerReport(customerId: any):Observable<any> {
        const token = this.loginService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        let url = `${this.baseUrl}/reports/customer`;
        const params = new URLSearchParams();
        
        if (customerId) {
            params.append('customerId', customerId.toString());
        }

        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        return this.http.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    getPaymentReport(startDate?: string , endDate?:string): Observable<any>{
        const token = this.loginService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        let url = `${this.baseUrl}/reports/payment`;
        const params = new URLSearchParams();
        
        if (startDate) {
            params.append('startDate', startDate);
        }

        if (endDate) {
            params.append('endDate', endDate);
        }

        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        return this.http.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        }).pipe(
            tap(response => console.log('Payment Report API Response:', response)),
            catchError(error => {
                console.error('Payment Report API Error:', error);
                return throwError(() => error);
            })
        );
    }
}