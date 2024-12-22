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
        MatGridListModule
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
    isAdmin = true;

    constructor(
        public authService: AuthService,
        private carService: CarService,
        private router: Router
    ) { }

    ngOnInit() {
        this.loadCars();
        this.loadOffices();
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

    applyFilters() {
        console.log('Applying filters:', { statusFilter: this.statusFilter, officeFilter: this.officeFilter });
        console.log('Cars before filtering:', this.cars);

        this.filteredCars = this.cars.filter(car => {
            const statusMatch = this.statusFilter === 'all' || car.status === this.statusFilter;
            const officeMatch = this.officeFilter === 'all' || car.officeId === parseInt(this.officeFilter);

            console.log(`Car ${car.id}:`, {
                statusMatch,
                officeMatch,
                carStatus: car.status,
                carOfficeId: car.officeId
            });

            return statusMatch && officeMatch;
        });

        console.log('Filtered cars:', this.filteredCars);
    }

    reserveCar(carId: number) {
        this.router.navigate(['/reservation', carId]);
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
}