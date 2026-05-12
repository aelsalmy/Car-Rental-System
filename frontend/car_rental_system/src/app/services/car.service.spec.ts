import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CarService } from './car.service';
import { LoginService } from './login.service';

describe('CarService', () => {
    let service: CarService;
    let httpMock: HttpTestingController;
    let loginStub: jasmine.SpyObj<LoginService>;
    const apiUrl = 'http://localhost:3000/api';

    beforeEach(() => {
        loginStub = jasmine.createSpyObj<LoginService>('LoginService', ['getToken']);
        loginStub.getToken.and.returnValue('admin-token');

        TestBed.configureTestingModule({
            providers: [
                CarService,
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: LoginService, useValue: loginStub },
            ],
        });
        service = TestBed.inject(CarService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('getAllCars GETs the cars endpoint', () => {
        service.getAllCars().subscribe();
        const req = httpMock.expectOne(`${apiUrl}/cars`);
        expect(req.request.method).toBe('GET');
        req.flush([]);
    });

    it('registerCar POSTs the payload to /cars', () => {
        const payload = { plateId: 'AB-123', model: 'Yaris' };
        service.registerCar(payload).subscribe();
        const req = httpMock.expectOne(`${apiUrl}/cars`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(payload);
        req.flush({ id: 1 });
    });

    it('updateCarStatus PATCHes the status field on /cars/:id/status', () => {
        service.updateCarStatus(7, 'rented').subscribe();
        const req = httpMock.expectOne(`${apiUrl}/cars/7/status`);
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body).toEqual({ status: 'rented' });
        req.flush({});
    });

    it('searchCars serializes scalar and array params into the query string', () => {
        service.searchCars({ model: 'Yaris', features: ['ac', 'gps'], emptyField: '' }).subscribe();
        const req = httpMock.expectOne(r => r.url.startsWith(`${apiUrl}/cars/search`));
        expect(req.request.method).toBe('GET');
        expect(req.request.urlWithParams).toContain('model=Yaris');
        expect(req.request.urlWithParams).toContain('features=ac');
        expect(req.request.urlWithParams).toContain('features=gps');
        expect(req.request.urlWithParams).not.toContain('emptyField');
        req.flush([]);
    });

    it('getStatusReport attaches a Bearer token from LoginService', () => {
        service.getStatusReport('available', '2025-01-01').subscribe();
        const req = httpMock.expectOne(r => r.url.startsWith(`${apiUrl}/reports/status`));
        expect(req.request.headers.get('Authorization')).toBe('Bearer admin-token');
        expect(req.request.urlWithParams).toContain('status=available');
        expect(req.request.urlWithParams).toContain('date=2025-01-01');
        req.flush({});
    });

    it('getStatusReport throws synchronously when no auth token is available', () => {
        loginStub.getToken.and.returnValue(null);
        expect(() => service.getStatusReport('available')).toThrowError(/No authentication token/);
        httpMock.expectNone(r => r.url.startsWith(`${apiUrl}/reports/status`));
    });
});
