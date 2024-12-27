import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CarService } from '../../services/car.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'app-car-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatChipsModule,
    MatCardModule,
    MatIconModule,
    MatExpansionModule,
    MatSliderModule
  ],
  templateUrl: './car-search.component.html',
  styleUrls: ['./car-search.component.css']
})
export class CarSearchComponent implements OnInit {
  searchForm: FormGroup;
  cars: any[] = [];
  availableFeatures: string[] = [];
  selectedFeatures: string[] = [];
  showAdvancedSearch = false;

  readonly categories = [
    { value: 'sedan', label: 'Sedan' },
    { value: 'suv', label: 'SUV' },
    { value: 'sports', label: 'Sports Car' },
    { value: 'luxury', label: 'Luxury' },
    { value: 'compact', label: 'Compact' },
    { value: 'van', label: 'Van' },
    { value: 'pickup', label: 'Pickup Truck' }
  ];

  readonly transmissions = [
    { value: 'automatic', label: 'Automatic' },
    { value: 'manual', label: 'Manual' }
  ];

  readonly fuelTypes = [
    { value: 'gasoline', label: 'Gasoline' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'electric', label: 'Electric' }
  ];

  constructor(
    private fb: FormBuilder,
    private carService: CarService
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      category: [''],
      transmission: [''],
      fuelType: [''],
      minSeats: [''],
      maxSeats: [''],
      minPrice: [''],
      maxPrice: [''],
      officeId: ['']
    });
  }

  ngOnInit() {
    this.loadFeatures();
    // Initial search without filters
    this.search();
  }

  loadFeatures() {
    this.carService.getFeatures().subscribe({
      next: (features) => {
        this.availableFeatures = features;
      },
      error: (error) => {
        console.error('Error loading features:', error);
      }
    });
  }

  toggleFeature(feature: string) {
    const index = this.selectedFeatures.indexOf(feature);
    if (index === -1) {
      this.selectedFeatures.push(feature);
    } else {
      this.selectedFeatures.splice(index, 1);
    }
    this.search();
  }

  search() {
    const formValues = this.searchForm.value;
    const searchParams = {
      ...formValues,
      features: this.selectedFeatures
    };

    this.carService.searchCars(searchParams).subscribe({
      next: (cars) => {
        this.cars = cars;
      },
      error: (error) => {
        console.error('Error searching cars:', error);
      }
    });
  }

  toggleAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  resetFilters() {
    this.searchForm.reset();
    this.selectedFeatures = [];
    this.search();
  }
}
