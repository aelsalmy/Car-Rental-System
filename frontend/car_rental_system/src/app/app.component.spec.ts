import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';
import { NavHeaderComponent } from './components/nav-header/nav-header.component';
import { AdminSidebarComponent } from './components/admin-sidebar/admin-sidebar.component';

@Component({ selector: 'app-nav-header', standalone: true, template: '' })
class NavHeaderStubComponent {}

@Component({ selector: 'app-admin-sidebar', standalone: true, template: '' })
class AdminSidebarStubComponent {}

describe('AppComponent', () => {
    let authServiceStub: jasmine.SpyObj<AuthService> & { isAdmin$: BehaviorSubject<boolean> };

    beforeEach(async () => {
        const spy = jasmine.createSpyObj<AuthService>('AuthService', [
            'checkAuthStatus',
            'isLoggedIn',
            'isAdmin',
        ]);
        (spy as any).isAdmin$ = new BehaviorSubject<boolean>(false);
        spy.isLoggedIn.and.returnValue(false);
        spy.isAdmin.and.returnValue(false);
        authServiceStub = spy as any;

        await TestBed.configureTestingModule({
            imports: [AppComponent],
            providers: [
                provideRouter([]),
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: AuthService, useValue: authServiceStub },
            ],
        })
            .overrideComponent(AppComponent, {
                remove: { imports: [NavHeaderComponent, AdminSidebarComponent] },
                add: { imports: [NavHeaderStubComponent, AdminSidebarStubComponent] },
            })
            .compileComponents();
    });

    it('creates the AppComponent', () => {
        const fixture = TestBed.createComponent(AppComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('checks auth status on init', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        expect(authServiceStub.checkAuthStatus).toHaveBeenCalledTimes(1);
    });
});
