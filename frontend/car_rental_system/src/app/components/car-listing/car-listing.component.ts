import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule} from '@angular/material/grid-list'
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarService } from '../../services/car.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CarDetailsDialogComponent } from '../car-details-dialog/car-details-dialog.component';

@Component({
    selector: 'app-car-listing',
    standalone: true,
    imports: [
        MatCardModule,
        MatButtonModule,
        MatSelectModule,
        MatMenuModule,
        MatFormFieldModule,
        MatInputModule,
        CommonModule,
        RouterModule,
        FormsModule,
        MatGridListModule,
        MatIconModule,
        MatExpansionModule,
        MatChipsModule,
        MatDialogModule
    ],
    templateUrl: './car-listing.component.html',
    styleUrls: ['./car-listing.component.css']
})
export class CarListingComponent implements OnInit {
    cars: any[] = [];
    filteredCars: any[] = [];
    offices: any[] = [];
    statusFilter = 'all';
    officeFilter = 'all';
    searchTerm = '';
    showAdvancedSearch = false;
    selectedFeatures: string[] = [];
    availableFeatures: string[] = [];
    isSearchView = false;

    readonly categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'sedan', label: 'Sedan' },
        { value: 'suv', label: 'SUV' },
        { value: 'sports', label: 'Sports Car' },
        { value: 'luxury', label: 'Luxury' },
        { value: 'compact', label: 'Compact' },
        { value: 'van', label: 'Van' },
        { value: 'pickup', label: 'Pickup Truck' }
    ];

    readonly transmissions = [
        { value: 'all', label: 'All Types' },
        { value: 'automatic', label: 'Automatic' },
        { value: 'manual', label: 'Manual' }
    ];

    readonly fuelTypes = [
        { value: 'all', label: 'All Types' },
        { value: 'gasoline', label: 'Gasoline' },
        { value: 'diesel', label: 'Diesel' },
        { value: 'hybrid', label: 'Hybrid' },
        { value: 'electric', label: 'Electric' }
    ];

    selectedCategory = 'all';
    selectedTransmission = 'all';
    selectedFuelType = 'all';

    constructor(
        public authService: AuthService,
        private carService: CarService,
        private router: Router,
        private dialog: MatDialog
    ) { }

    ngOnInit() {
        this.loadCars();
        this.loadOffices();
        this.loadFeatures();
        
        // Add this line to debug admin status
        this.authService.isAdmin$.subscribe(isAdmin => {
            console.log('Is user admin?', isAdmin);
        });

        // Check if this is the search view based on the current route or view
        this.isSearchView = window.location.pathname.includes('search') || 
                           window.location.pathname.includes('admin') || 
                           (this.authService.isAdmin$ && 
                            (window.location.pathname.includes('CarList') || 
                             window.location.pathname.includes('SearchCars')));
        
        // If it's search view, show advanced search by default
        if (this.isSearchView) {
            this.showAdvancedSearch = true;
        }
    }

    loadCars() {
        console.log('Loading cars...');
        this.carService.getAllCars().subscribe({
            next: (cars) => {
                console.log('Cars loaded:', cars);
                this.cars = cars;
                this.filteredCars = cars;
                this.applyFilters();
            },
            error: (error) => {
                console.error('Error loading cars:', error);
            }
        });
    }

    loadOffices() {
        console.log("offices requested")
        this.carService.getOffices().subscribe({
            next: (offices) => {
                console.log('Offices loaded:', offices);
                this.offices = offices;
            },
            error: (error) => {
                console.error('Error loading offices:', error);
            }
        });
    }

    loadFeatures() {
        this.availableFeatures = [
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
    }

    toggleFeature(feature: string) {
        const index = this.selectedFeatures.indexOf(feature);
        if (index === -1) {
            this.selectedFeatures.push(feature);
        } else {
            this.selectedFeatures.splice(index, 1);
        }
        this.applyFilters();
    }

    applyFilters() {
        this.filteredCars = this.cars.filter(car => {
            // Basic filters
            const statusMatch = this.statusFilter === 'all' || car.status === this.statusFilter;
            const officeMatch = this.officeFilter === 'all' || car.officeId === parseInt(this.officeFilter);
            
            // Search term
            const searchMatch = !this.searchTerm || 
                car.model.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                (car.specifications && car.specifications.toLowerCase().includes(this.searchTerm.toLowerCase()));

            // Category
            const categoryMatch = this.selectedCategory === 'all' || car.category === this.selectedCategory;
            
            // Transmission
            const transmissionMatch = this.selectedTransmission === 'all' || car.transmission === this.selectedTransmission;
            
            // Fuel Type
            const fuelTypeMatch = this.selectedFuelType === 'all' || car.fuelType === this.selectedFuelType;
            
            // Features
            const featuresMatch = this.selectedFeatures.length === 0 || 
                (car.features && this.selectedFeatures.every(feature => car.features.includes(feature)));

            return statusMatch && officeMatch && searchMatch && 
                   categoryMatch && transmissionMatch && fuelTypeMatch && featuresMatch;
        });
    }

    toggleAdvancedSearch() {
        this.showAdvancedSearch = !this.showAdvancedSearch;
    }

    resetFilters() {
        this.searchTerm = '';
        this.selectedCategory = 'all';
        this.selectedTransmission = 'all';
        this.selectedFuelType = 'all';
        this.selectedFeatures = [];
        this.statusFilter = 'all';
        this.officeFilter = 'all';
        this.applyFilters();
    }

    reserveCar(carId: number) {
        this.router.navigate(['/reservation'], {
            queryParams: { carId: carId }
        });
    }

    updateStatus(carId: number, status: string) {
        this.carService.updateCarStatus(carId, status).subscribe({
            next: () => {
                this.loadCars();
            },
            error: (error) => {
                console.error('Error updating car status:', error);
            }
        });
    }

    openCarDetails(car: any) {
        this.dialog.open(CarDetailsDialogComponent, {
            data: car,
            width: '600px',
            maxHeight: '90vh'
        });
    }
}