import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Car } from '../servis/car.service';

@Component({
  selector: 'app-car-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './car-card.component.html',
  styleUrls: ['./car-card.component.css'],
})
export class CarCardComponent {
  @Input() car!: Car;
  @Input() isOwnCar: boolean = false;

  formatImage(imagePath: string | string[]): string {
    const path = Array.isArray(imagePath) ? imagePath[0] : imagePath;

    if (!path) {
      return '/assets/no-image.png'; 
    }

    return path.startsWith('http')
      ? path.replace(/\\/g, '/') 
      : `http://localhost:5000/${path.replace(/\\/g, '/')}`;
  }
}