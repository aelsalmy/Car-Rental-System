import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReservationService } from './reservation.service';
import { LoginService } from './login.service';

describe('ReservationService', () => {
    let service: ReservationService;
    let httpMock: HttpTestingController;
    let loginStub: jasmine.SpyObj<LoginService>;
    const baseUrl = 'http://localhost:3000/api';

    beforeEach(() => {
        loginStub = jasmine.createSpyObj<LoginService>('LoginService', ['getToken']);
        loginStub.getToken.and.returnValue('user-token');

        TestBed.configureTestingModule({
            providers: [
                ReservationService,
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: LoginService, useValue: loginStub },
            ],
        });
        service = TestBed.inject(ReservationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('createReservation POSTs only whitelisted fields to /reservations', () => {
        const data = {
            carId: 1,
            startDate: '2025-01-01',
            endDate: '2025-01-05',
            totalCost: 200,
            paymentMethod: 'cash',
            paymentStatus: 'paid',
            secretInjection: 'should-not-be-sent',
        };
        service.createReservation(data).subscribe();

        const req = httpMock.expectOne(`${baseUrl}/reservations`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({
            carId: 1,
            startDate: '2025-01-01',
            endDate: '2025-01-05',
            totalCost: 200,
            paymentMethod: 'cash',
            paymentStatus: 'paid',
        });
        expect((req.request.body as any).secretInjection).toBeUndefined();
        req.flush({ id: 99 });
    });

    it('createReservation throws when no token is available', () => {
        loginStub.getToken.and.returnValue(null);
        expect(() => service.createReservation({ carId: 1 })).toThrowError(/No authentication token/);
        httpMock.expectNone(`${baseUrl}/reservations`);
    });

    it('getMyReservations GETs /reservations/my', () => {
        service.getMyReservations().subscribe();
        const req = httpMock.expectOne(`${baseUrl}/reservations/my`);
        expect(req.request.method).toBe('GET');
        req.flush([]);
    });

    it('cancelReservation PATCHes /reservations/:id/cancel with an empty body', () => {
        service.cancelReservation(42).subscribe();
        const req = httpMock.expectOne(`${baseUrl}/reservations/42/cancel`);
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body).toEqual({});
        req.flush({});
    });

    it('deleteReservation issues a DELETE to /reservations/:id/delete', () => {
        service.deleteReservation(7).subscribe();
        const req = httpMock.expectOne(`${baseUrl}/reservations/7/delete`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});
    });

    it('getAllReservations attaches Bearer token and GETs /reservations/getAll', () => {
        service.getAllReservations().subscribe();
        const req = httpMock.expectOne(`${baseUrl}/reservations/getAll`);
        expect(req.request.method).toBe('GET');
        expect(req.request.headers.get('Authorization')).toBe('Bearer user-token');
        req.flush([]);
    });

    it('updateReservationStatus PATCHes with Bearer token', () => {
        service.updateReservationStatus(3, 'confirmed').subscribe();
        const req = httpMock.expectOne(`${baseUrl}/reservations/3/status`);
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body).toEqual({ status: 'confirmed' });
        expect(req.request.headers.get('Authorization')).toBe('Bearer user-token');
        req.flush({});
    });

    it('searchReservations builds a query string from non-empty params', () => {
        service.searchReservations({ status: 'active', userId: 5, empty: '' }).subscribe();
        const req = httpMock.expectOne(r => r.url.startsWith(`${baseUrl}/reservations/search`));
        expect(req.request.urlWithParams).toContain('status=active');
        expect(req.request.urlWithParams).toContain('userId=5');
        expect(req.request.urlWithParams).not.toContain('empty=');
        expect(req.request.headers.get('Authorization')).toBe('Bearer user-token');
        req.flush([]);
    });

    it('getReservationReport sends Bearer token and date range params', () => {
        service.getReservationReport('2025-01-01', '2025-01-31').subscribe();
        const req = httpMock.expectOne(r => r.url.startsWith(`${baseUrl}/reports/reservation`));
        expect(req.request.headers.get('Authorization')).toBe('Bearer user-token');
        expect(req.request.urlWithParams).toContain('startDate=2025-01-01');
        expect(req.request.urlWithParams).toContain('endDate=2025-01-31');
        req.flush({});
    });

    it('getCustomerReport throws synchronously when no token is available', () => {
        loginStub.getToken.and.returnValue(null);
        expect(() => service.getCustomerReport(1)).toThrowError(/No authentication token/);
        httpMock.expectNone(r => r.url.startsWith(`${baseUrl}/reports/customer`));
    });
});
