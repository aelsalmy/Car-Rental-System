import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RegistrationService } from './registration.service';

describe('RegistrationService', () => {
    let service: RegistrationService;
    let httpMock: HttpTestingController;
    const registerUrl = 'http://localhost:3000/api/auth/register';

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                RegistrationService,
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        });
        service = TestBed.inject(RegistrationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('is created', () => {
        expect(service).toBeTruthy();
    });

    it('POSTs the nested customerInfo payload to the register endpoint', () => {
        service.register('carol', 'pw', 'Carol Smith', 'c@example.com', '555-1', '1 Main St').subscribe();

        const req = httpMock.expectOne(registerUrl);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({
            username: 'carol',
            password: 'pw',
            customerInfo: {
                name: 'Carol Smith',
                email: 'c@example.com',
                phone: '555-1',
                address: '1 Main St',
            },
        });
        req.flush({ userId: 1 });
    });

    it('surfaces a 409 conflict from the backend', (done) => {
        service.register('dup', 'pw', 'Dup', 'dup@e.com', '0', 'X').subscribe({
            next: () => done.fail('should have errored'),
            error: (err) => {
                expect(err.status).toBe(409);
                done();
            },
        });

        httpMock.expectOne(registerUrl).flush(
            { message: 'username taken' },
            { status: 409, statusText: 'Conflict' }
        );
    });

    it('does not dispatch the request until subscribed', () => {
        service.register('eve', 'pw', 'Eve', 'e@e.com', '0', 'Y');
        httpMock.expectNone(registerUrl);
    });
});
