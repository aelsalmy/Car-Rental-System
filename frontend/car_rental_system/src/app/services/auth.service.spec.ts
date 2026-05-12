import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

function b64url(input: string): string {
    return btoa(input).replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function makeJwt(payload: Record<string, unknown>): string {
    const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = b64url(JSON.stringify(payload));
    return `${header}.${body}.sig`;
}

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;
    let router: jasmine.SpyObj<Router>;
    const loginUrl = 'http://localhost:3000/api/auth/login';

    beforeEach(() => {
        localStorage.clear();
        router = jasmine.createSpyObj<Router>('Router', ['navigate'], { url: '/cars' });

        TestBed.configureTestingModule({
            providers: [
                AuthService,
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: Router, useValue: router },
            ],
        });
        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    it('reports a fresh service as logged out', () => {
        expect(service.isLoggedIn()).toBeFalse();
        expect(service.isAdmin()).toBeFalse();
        expect(service.getToken()).toBeNull();
    });

    it('POSTs credentials to the login endpoint and stores a user token', () => {
        const token = makeJwt({ id: 5, username: 'alice', role: 'user', exp: Math.floor(Date.now() / 1000) + 3600 });
        let emitted: any;
        service.login('alice', 'pw').subscribe(v => (emitted = v));

        const req = httpMock.expectOne(loginUrl);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ username: 'alice', password: 'pw' });
        req.flush({ message: 'ok', token, userId: 5 });

        expect(emitted.token).toBe(token);
        expect(localStorage.getItem('token')).toBe(token);
        expect(service.isLoggedIn()).toBeTrue();
        expect(service.isAdmin()).toBeFalse();
    });

    it('flips isAdmin true for an admin-role token', () => {
        const token = makeJwt({ id: 1, username: 'root', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 });
        service.login('root', 'rootpw').subscribe();
        httpMock.expectOne(loginUrl).flush({ message: 'ok', token, userId: 1 });

        expect(service.isAdmin()).toBeTrue();
    });

    it('treats an expired token in localStorage as logged out and clears it', () => {
        const expired = makeJwt({ id: 1, username: 'a', role: 'user', exp: Math.floor(Date.now() / 1000) - 60 });
        localStorage.setItem('token', expired);

        expect(service.isLoggedIn()).toBeFalse();
        expect(localStorage.getItem('token')).toBeNull();
    });

    it('treats a malformed token as logged out', () => {
        localStorage.setItem('token', 'not-a-jwt');
        expect(service.isLoggedIn()).toBeFalse();
        expect(localStorage.getItem('token')).toBeNull();
    });

    it('logout() removes the token and navigates to /login when not already on an auth page', () => {
        const token = makeJwt({ id: 5, username: 'alice', role: 'user', exp: Math.floor(Date.now() / 1000) + 3600 });
        service.login('alice', 'pw').subscribe();
        httpMock.expectOne(loginUrl).flush({ message: 'ok', token, userId: 5 });

        service.logout();

        expect(localStorage.getItem('token')).toBeNull();
        expect(service.isLoggedIn()).toBeFalse();
        expect(router.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
    });
});
