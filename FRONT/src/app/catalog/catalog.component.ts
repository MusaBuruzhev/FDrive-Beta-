import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CarService, Car } from '../servis/car.service';
import { CommonModule } from '@angular/common';
import { CarCardComponent } from '../car-card/car-card.component';
import { CAR_BRANDS_MODELS } from '../servis/car-brands';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, CarCardComponent, FormsModule],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent implements OnInit {
  filtersFromQuery: any = {};
  tempFilters: any = {};
  cars: Car[] = [];
  showAllFilters = false;
  brands = CAR_BRANDS_MODELS;
  availableModels: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private carService: CarService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.filtersFromQuery = { ...params };
      this.tempFilters = { ...params };
      this.updateModels();
      this.loadCars();
    });
  }

  updateModels() {
    const brand = this.brands.find(b => b.name === this.tempFilters.brand);
    this.availableModels = brand ? brand.models : [];
    if (!brand && this.tempFilters.model) {
      delete this.tempFilters.model; 
    }
    this.updateQueryParams(); 
  }

  updateQueryParams() {
    const cleanedFilters: any = {};
    for (const [key, value] of Object.entries(this.tempFilters)) {
      if (value !== '' && value !== null && value !== undefined) {
        cleanedFilters[key] = value;
      }
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: cleanedFilters
    });
  }

  applyFilters() {
    this.updateQueryParams(); 
  }

  resetFilters() {
    this.tempFilters = {};
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
  }

  loadCars() {
    this.carService.getCars().subscribe({
      next: (cars) => {
        this.cars = cars.filter(car => {
          const f = this.filtersFromQuery;
          if (f.brand && car.name !== f.brand) return false;
          if (f.model && car.carModel !== f.model) return false;
          if (f.transmission && car.carTransmission !== f.transmission) return false;
          if (f.seats && car.carSeats !== f.seats) return false;
          if (f.fuel && car.carFuelType !== f.fuel) return false;
          if (f.color && car.carColor !== f.color) return false;
          if (f.year && car.carYear !== f.year) return false;
          const price = car.price;
          if (f.priceFrom && price < +f.priceFrom) return false;
          if (f.priceTo && price > +f.priceTo) return false;
          return true;
        });
      },
      error: (err) => {
        console.error('Ошибка при загрузке автомобилей:', err);
      }
    });
  }

  removeFilter(key: string) {
    delete this.filtersFromQuery[key];
    if (key === 'brand') delete this.filtersFromQuery.model;
    this.tempFilters = { ...this.filtersFromQuery };
    this.updateModels();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.filtersFromQuery
    });
  }

  getFilterKeys(): string[] {
    return Object.keys(this.filtersFromQuery);
  }

  onModelChange() {
    this.updateQueryParams(); 
  }
}