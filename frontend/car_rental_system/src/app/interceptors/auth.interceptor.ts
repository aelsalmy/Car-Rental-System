import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoginService } from '../services/login.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const loginService = inject(LoginService);
    const token = loginService.getToken();

    if (token) {
        console.log('Original request:', req.url);
        const authReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
        console.log('Modified request headers:', authReq.headers.get('Authorization'));
        return next(authReq);
    }

    return next(req);
};