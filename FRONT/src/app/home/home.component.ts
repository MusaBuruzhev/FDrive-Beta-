import { Component, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarCardComponent } from '../car-card/car-card.component';
import { CarService, Car } from '../servis/car.service';
import { Router } from '@angular/router';
import { CAR_BRANDS_MODELS } from '../servis/car-brands'; 
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CarCardComponent,FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit {
  cars: Car[] = [];

  @ViewChild('logoBlock') logoBlock!: ElementRef;

  logoElement!: HTMLElement;
  isInViewport = false;
  lastScrollY = 0;
  currentTranslateY = 0;
  animationFrameId: number | null = null;

  scrollSensitivity = 0.5;
  animationStartOffset = 200;
  maxStep = 10;
  centerThreshold = 100;

  // Статичные данные брендов и моделей
  brands = CAR_BRANDS_MODELS;
  selectedBrand: string = '';
  availableModels: string[] = [];

  // Фильтры, которые передаем на страницу каталога
  filters = {
    startDate: '',
    endDate: '',
    transmission: '',
    brand: '',
    model: ''
  };

  constructor(private carService: CarService, private router: Router) {}

  ngAfterViewInit() {
    this.logoElement = this.logoBlock.nativeElement.querySelector('.logo');
    this.loadCars();

    const observer = new IntersectionObserver(
      (entries) => {
        this.isInViewport = entries[0].isIntersecting;
        if (this.isInViewport) {
          this.currentTranslateY = 0;
          this.logoElement.style.transform = `translateY(0)`;
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(this.logoBlock.nativeElement);
  }

loadCars() {
  this.carService.getCars().subscribe({
    next: (cars) => {
     
      const shuffled = cars.sort(() => Math.random() - 0.5);
   
      this.cars = shuffled.slice(0, 16);
    },
    error: (err) => {
      console.error('Ошибка при загрузке автомобилей:', err);
    }
  });
}

  @HostListener('window:scroll')
  onScroll() {
    if (!this.logoElement) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const blockTop = this.logoBlock.nativeElement.getBoundingClientRect().top + window.scrollY;
    if (scrollTop < blockTop - this.animationStartOffset) {
      this.lastScrollY = scrollTop;
      return;
    }

    if (!this.animationFrameId) {
      this.animationFrameId = requestAnimationFrame(() => {
        this.animateLogo(scrollTop);
        this.animationFrameId = null;
      });
    }
  }

  animateLogo(currentScrollTop: number) {
    const deltaY = currentScrollTop - this.lastScrollY;
    this.lastScrollY = currentScrollTop;

    const parentRect = this.logoBlock.nativeElement.getBoundingClientRect();
    const logoRect = this.logoElement.getBoundingClientRect();
    const availableSpace = parentRect.height / 2 + logoRect.height / 2;

    const step = Math.max(-this.maxStep, Math.min(deltaY * this.scrollSensitivity, this.maxStep));
    this.currentTranslateY += step;

    if (this.currentTranslateY > availableSpace) {
      this.currentTranslateY = availableSpace;
    }
    if (this.currentTranslateY < 0) {
      this.currentTranslateY = 0;
    }
    if (Math.abs(this.currentTranslateY) < this.centerThreshold && deltaY < 0) {
      this.currentTranslateY = 0;
    }

    this.logoElement!.style.transform = `translateY(${this.currentTranslateY}px)`;
  }

  // При изменении бренда — обновляем модели
  onBrandChange(event: any) {
    const brandName = event.target.value;
    this.filters.brand = brandName;
    const brand = this.brands.find(b => b.name === brandName);
    this.availableModels = brand ? brand.models : [];
    this.filters.model = '';
  }

  // Отправляем выбранные фильтры на страницу каталога (через query-параметры)
  onSubmitFilter(event: Event) {
    event.preventDefault();

    const queryParams: any = {};
    for (const [key, value] of Object.entries(this.filters)) {
      if (value) {
        queryParams[key] = value;
      }
    }


    this.router.navigate(['/catalog'], { queryParams });
  }
}
