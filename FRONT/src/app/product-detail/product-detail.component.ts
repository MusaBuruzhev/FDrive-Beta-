import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CarService, Car } from '../servis/car.service';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  car: Car | null = null;
  activeImageIndex: number = 0;
  apiUrl = 'http://localhost:5000';

  constructor(
    private route: ActivatedRoute,
    private carService: CarService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carService.getCarById(id).subscribe({
        next: (car) => {
          // Приводим тип к Car явно
          const processedCar: Car = {
            ...car,
            image: this.parseImageField(car.image)
          };

          this.car = processedCar;

          if (!this.car.image.length) {
            this.activeImageIndex = 0;
          }
        },
        error: (err) => {
          console.error('Ошибка при загрузке автомобиля:', err);
        }
      });
    }
  }

parseImageField(image: any): string[] {
  if (Array.isArray(image)) {
    return image.map((img: string) =>
      img.startsWith('http')
        ? img.replace(/\\/g, '/')
        : `${this.apiUrl}/${img.replace(/\\/g, '/')}`
    );
  } else if (typeof image === 'string') {
    return image
      .split(',')
      .map(img => img.trim())
      .filter(img => img.length > 0)
      .map(img =>
        img.startsWith('http')
          ? img.replace(/\\/g, '/')
          : `${this.apiUrl}/${img.replace(/\\/g, '/')}`
      );
  }
  return [];
}

  goBack(): void {
    this.location.back();
  }

  nextImage(): void {
    if (this.car && this.car.image.length > 1) {
      this.activeImageIndex = (this.activeImageIndex + 1) % this.car.image.length;
    }
  }

  prevImage(): void {
    if (this.car && this.car.image.length > 1) {
      this.activeImageIndex = (this.activeImageIndex - 1 + this.car.image.length) % this.car.image.length;
    }
  }
}