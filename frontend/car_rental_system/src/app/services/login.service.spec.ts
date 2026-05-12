import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LoginService } from './login.service';

describe('LoginService', () => {
    let service: LoginService;
    let httpMock: HttpTestingController;
    const loginUrl = 'http://localhost:3000/api/auth/login';

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({
            providers: [
                LoginService,
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        });
        service = TestBed.inject(LoginService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    it('is created', () => {
        expect(service).toBeTruthy();
    });

    it('POSTs username and password to the login endpoint', () => {
        service.login('alice', 's3cret').subscribe();

        const req = httpMock.expectOne(loginUrl);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ username: 'alice', password: 's3cret' });
        req.flush({ message: 'ok', token: 'jwt.tok.en', userId: 1 });
    });

    it('persists the returned token in localStorage on success', () => {
        service.login('alice', 'pw').subscribe();
        httpMock.expectOne(loginUrl).flush({ message: 'ok', token: 'jwt.tok.en', userId: 1 });

        expect(localStorage.getItem('token')).toBe('jwt.tok.en');
        expect(service.getToken()).toBe('jwt.tok.en');
        expect(service.isLoggedIn()).toBeTrue();
    });

    it('does not store anything when the response omits a token', () => {
        service.login('alice', 'pw').subscribe();
        httpMock.expectOne(loginUrl).flush({ message: 'no token' });

        expect(localStorage.getItem('token')).toBeNull();
        expect(service.isLoggedIn()).toBeFalse();
    });

    it('reports logged-out state when no token is stored', () => {
        expect(service.getToken()).toBeNull();
        expect(service.isLoggedIn()).toBeFalse();
    });

    it('clears the stored token on logout()', () => {
        localStorage.setItem('token', 'existing-token');
        service.logout();

        expect(localStorage.getItem('token')).toBeNull();
        expect(service.isLoggedIn()).toBeFalse();
    });
});
