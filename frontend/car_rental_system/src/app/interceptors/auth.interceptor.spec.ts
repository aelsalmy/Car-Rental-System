import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandlerFn, HttpInterceptorFn, HttpRequest, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { LoginService } from '../services/login.service';

describe('authInterceptor', () => {
    let http: HttpClient;
    let httpMock: HttpTestingController;
    let loginStub: jasmine.SpyObj<LoginService>;

    beforeEach(() => {
        loginStub = jasmine.createSpyObj<LoginService>('LoginService', ['getToken']);

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([authInterceptor])),
                provideHttpClientTesting(),
                { provide: LoginService, useValue: loginStub },
            ],
        });
        http = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('attaches Authorization: Bearer <token> when a token is present', () => {
        loginStub.getToken.and.returnValue('jwt-abc');
        http.get('/api/whatever').subscribe();

        const req = httpMock.expectOne('/api/whatever');
        expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-abc');
        req.flush({});
    });

    it('does not set an Authorization header when no token is stored', () => {
        loginStub.getToken.and.returnValue(null);
        http.get('/api/public').subscribe();

        const req = httpMock.expectOne('/api/public');
        expect(req.request.headers.has('Authorization')).toBeFalse();
        req.flush({});
    });

    it('preserves other headers already set on the request', () => {
        loginStub.getToken.and.returnValue('jwt-abc');
        http.get('/api/x', { headers: { 'X-Trace': 'abc' } }).subscribe();

        const req = httpMock.expectOne('/api/x');
        expect(req.request.headers.get('X-Trace')).toBe('abc');
        expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-abc');
        req.flush({});
    });

    it('passes the original request through untouched when no token is available', () => {
        loginStub.getToken.and.returnValue(undefined as any);
        const fn: HttpInterceptorFn = authInterceptor;
        const original = new HttpRequest<unknown>('GET', '/api/y');
        const downstream = jasmine.createSpy('downstream').and.returnValue(of({} as any)) as unknown as HttpHandlerFn;

        TestBed.runInInjectionContext(() => fn(original, downstream).subscribe());
        expect(downstream).toHaveBeenCalledTimes(1);
        expect((downstream as any).calls.mostRecent().args[0]).toBe(original);
    });
});
