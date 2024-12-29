import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { CarService } from '../../services/car.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
        MatChipsModule,
        MatCheckboxModule,
        CommonModule
    ],
    templateUrl: './car-registration.component.html',
    styleUrls: ['./car-registration.component.css']
})
export class CarRegistrationComponent {
    carForm: FormGroup;
    offices: any[] = [];
    
    categories = [
        'sedan',
        'suv',
        'sports',
        'luxury',
        'compact',
        'van',
        'pickup'
    ];

    transmissionTypes = [
        'automatic',
        'manual'
    ];

    fuelTypes = [
        'gasoline',
        'diesel',
        'hybrid',
        'electric'
    ];

    features = [
        'Air Conditioning',
        'Bluetooth',
        'Cruise Control',
        'Backup Camera',
        'Navigation System',
        'Leather Seats',
        'Sunroof',
        'Heated Seats',
        'Apple CarPlay',
        'Android Auto',
        'Parking Sensors',
        'Keyless Entry',
        'USB Ports',
        'Third Row Seating',
        'Roof Rack',
        'Towing Package'
    ];

    @Output() registrationSuccess = new EventEmitter<void>();

    constructor(
        private fb: FormBuilder,
        private carService: CarService,
        private snackBar: MatSnackBar
    ) {
        this.carForm = this.fb.group({
            model: ['', [Validators.required]],
            year: ['', [Validators.required, Validators.min(1900)]],
            plateId: ['', [Validators.required]],
            status: ['active'],
            officeId: ['', [Validators.required]],
            dailyRate: ['', [Validators.required, Validators.min(0)]],
            category: ['', [Validators.required]],
            transmission: ['', [Validators.required]],
            fuelType: ['', [Validators.required]],
            seatingCapacity: ['', [Validators.required, Validators.min(2), Validators.max(15)]],
            features: [[]],
            description: ['']
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
                this.snackBar.open('Error loading offices', 'Close', { duration: 3000 });
            }
        });
    }

    async onSubmit() {
        if (this.carForm.valid) {
            try {
                const formData = {
                    ...this.carForm.value,
                    // Ensure these fields are properly typed
                    seatingCapacity: parseInt(this.carForm.value.seatingCapacity),
                    year: parseInt(this.carForm.value.year),
                    dailyRate: parseFloat(this.carForm.value.dailyRate),
                    // Ensure features is an array
                    features: this.carForm.value.features || []
                };
                console.log('Sending data to backend:', formData);
                
                const result = await this.carService.registerCar(formData).toPromise();
                console.log('Registration result:', result);
                
                this.snackBar.open('Car registered successfully!', 'Close', {
                    duration: 3000,
                });
                this.carForm.reset();
                this.registrationSuccess.emit(); // Emit event on success
            } catch (error: any) {
                console.error('Error submitting form:', error);
                this.snackBar.open(error.error?.message || 'Error registering car', 'Close', {
                    duration: 3000,
                });
            }
        } else {
            console.log('Form is invalid:', this.carForm.errors);
            this.snackBar.open('Please fill all required fields correctly', 'Close', {
                duration: 3000,
            });
        }
    }

    toggleFeature(feature: string) {
        const features = this.carForm.get('features')?.value || [];
        const index = features.indexOf(feature);
        
        if (index === -1) {
            features.push(feature);
        } else {
            features.splice(index, 1);
        }
        
        this.carForm.patchValue({ features });
    }

    isFeatureSelected(feature: string): boolean {
        const features = this.carForm.get('features')?.value || [];
        return features.includes(feature);
    }
}