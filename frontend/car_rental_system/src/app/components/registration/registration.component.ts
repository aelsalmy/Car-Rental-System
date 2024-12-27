import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { RegistrationService } from '../../services/registration.service';

@Component({
    selector: 'app-registration',
    standalone: true,
    imports: [
        MatCardModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatInputModule,
        MatButtonModule,
        CommonModule,
        MatSnackBarModule
    ],
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
    registrationForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private registrationService: RegistrationService,
        private router: Router,
        private snackBar: MatSnackBar
    ) {
        this.registrationForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
            address: ['', [Validators.required]]
        });
    }

    onSubmit() {
        if (this.registrationForm.valid) {
            const formData = this.registrationForm.value;
            console.log('Submitting registration data:', formData);
            
            this.registrationService.register(
                formData.username,
                formData.password,
                formData.name,
                formData.email,
                formData.phone,
                formData.address
            ).subscribe({
                next: () => {
                    this.snackBar.open('Registration successful! Please login.', 'Close', {
                        duration: 3000
                    });
                    this.router.navigate(['/login']);
                },
                error: (error) => {
                    console.error('Registration error:', error);
                    const errorMessage = error.error?.message || 'Registration failed. Please try again.';
                    this.snackBar.open(errorMessage, 'Close', {
                        duration: 3000
                    });
                }
            });
        } else {
            this.snackBar.open('Please fill all required fields correctly', 'Close', {
                duration: 3000
            });
        }
    }
}
