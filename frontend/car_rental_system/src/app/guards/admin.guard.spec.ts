import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

function runGuard(): boolean | any {
    return TestBed.runInInjectionContext(() => (adminGuard as any)());
}

describe('adminGuard', () => {
    let authSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['isLoggedIn', 'isAdmin']);
        routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });
    });

    it('blocks and redirects to /login when not logged in', () => {
        authSpy.isLoggedIn.and.returnValue(false);
        expect(runGuard()).toBeFalse();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('blocks and redirects home when logged in as non-admin', () => {
        authSpy.isLoggedIn.and.returnValue(true);
        authSpy.isAdmin.and.returnValue(false);
        expect(runGuard()).toBeFalse();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('allows navigation for an admin user', () => {
        authSpy.isLoggedIn.and.returnValue(true);
        authSpy.isAdmin.and.returnValue(true);
        expect(runGuard()).toBeTrue();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
});
