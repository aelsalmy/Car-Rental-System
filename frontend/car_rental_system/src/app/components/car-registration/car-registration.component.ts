import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { CarService } from '../../services/car.service';

@Component({
    selector: 'app-car-registration',
    standalone: true,
    imports: [
        MatCardModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        CommonModule
    ],
    templateUrl: './car-registration.component.html',
    styleUrls: ['./car-registration.component.css']
})
export class CarRegistrationComponent {
    carForm: FormGroup;
    offices: any[] = [];

    constructor(
        private fb: FormBuilder,
        private carService: CarService
    ) {
        this.carForm = this.fb.group({
            model: ['', [Validators.required]],
            year: ['', [Validators.required, Validators.min(1900)]],
            plateId: ['', [Validators.required]],
            status: ['active'],
            officeId: ['', [Validators.required]],
            dailyRate: ['', [Validators.required, Validators.min(0)]],
            specifications: ['']
        });
    }

    ngOnInit() {
        this.loadOffices();
    }

    loadOffices() {
        this.carService.getOffices().subscribe({
            next: (offices) => {
                this.offices = offices;
            },
            error: (error) => {
                console.error('Error loading offices:', error);
            }
        });
    }

    onSubmit() {
        if (this.carForm.valid) {
            this.carService.registerCar(this.carForm.value).subscribe({
                next: () => {
                    alert('Car registered successfully!');
                    this.carForm.reset();
                },
                error: (error) => {
                    alert('Error registering car: ' + error.error.message);
                }
            });
        }
    }
}