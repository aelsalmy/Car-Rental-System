import { TestBed } from '@angular/core/testing';
import { Router, type CanActivateFn, type ActivatedRouteSnapshot, type RouterStateSnapshot } from '@angular/router';
import { loginGuard } from './login.guard';
import { AuthService } from '../services/auth.service';

function runGuard(guard: CanActivateFn): boolean | any {
    return TestBed.runInInjectionContext(() =>
        guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
}

describe('loginGuard', () => {
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

    it('redirects logged-in users away from /login to /cars', () => {
        authSpy.isLoggedIn.and.returnValue(true);
        expect(runGuard(loginGuard)).toBeFalse();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/cars']);
    });

    it('lets anonymous users reach /login', () => {
        authSpy.isLoggedIn.and.returnValue(false);
        expect(runGuard(loginGuard)).toBeTrue();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
});
