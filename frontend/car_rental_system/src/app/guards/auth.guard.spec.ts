import { TestBed } from '@angular/core/testing';
import { Router, type CanActivateFn, type ActivatedRouteSnapshot, type RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

function runGuard(guard: CanActivateFn): boolean | any {
    return TestBed.runInInjectionContext(() =>
        guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
}

describe('authGuard', () => {
    let authSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['isLoggedIn']);
        routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });
    });

    it('allows navigation when the user is logged in', () => {
        authSpy.isLoggedIn.and.returnValue(true);
        expect(runGuard(authGuard)).toBeTrue();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('blocks and redirects to /login when not logged in', () => {
        authSpy.isLoggedIn.and.returnValue(false);
        expect(runGuard(authGuard)).toBeFalse();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
    });

    it('uses replaceUrl so the protected route does not stay in history', () => {
        authSpy.isLoggedIn.and.returnValue(false);
        runGuard(authGuard);
        const [, opts] = routerSpy.navigate.calls.mostRecent().args;
        expect(opts).toEqual({ replaceUrl: true });
    });
});
