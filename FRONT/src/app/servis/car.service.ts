import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface Car {
  _id: string;
  name: string;
  carModel: string;
  price: number;
  carYear: number;
  carColor: string;
  carTransmission: string;
  carFuelType: string;
  carSeats: number;
  description: string;
  canDeliver: boolean;
  image: string[];
  ownerId: string;
}

@Injectable({ providedIn: 'root' })
export class CarService {
  private apiUrl = 'http://localhost:5000';
  private cachedCars: Car[] | null = null;

  constructor(private http: HttpClient) {}

  getCars(): Observable<Car[]> {
    if (this.cachedCars) {
      return of(this.cachedCars);
    }

    return this.http.get<any[]>(`${this.apiUrl}/product/products`).pipe(
      map((cars) =>
        cars.map((car) => ({
          ...car,
          image: this.parseImageField(car.image),
        }))
      ),
      tap((cars) => {
        this.cachedCars = cars;
      })
    );
  }

  getCarById(id: string): Observable<Car> {
    return this.http.get<any>(`${this.apiUrl}/product/product/${id}`).pipe(
      map((car) => ({
        ...car,
        image: this.parseImageField(car.image),
      }))
    );
  }

  getUserCars(): Observable<Car[]> {
    return this.http.get<any[]>(`${this.apiUrl}/product/my`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      map((cars) =>
        cars.map((car) => ({
          ...car,
          image: this.parseImageField(car.image),
        }))
      )
    );
  }

  addCar(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/product/addProduct`, formData, {
      headers: this.getAuthHeaders(false),
    });
  }

  updateCar(id: string, formData: FormData): Observable<any> {
    return this.http.patch(`${this.apiUrl}/product/update/${id}`, formData, {
      headers: this.getAuthHeaders(false),
    });
  }

  deleteCar(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/product/delproduct/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  private parseImageField(image: any): string[] {
    if (Array.isArray(image)) {
      return image.map((img) => img.trim());
    } else if (typeof image === 'string') {
      return image
        .split(',')
        .map((img) => img.trim())
        .filter((img) => img.length > 0);
    }
    return [];
  }

  private getAuthHeaders(includeJson = true): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    let headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    if (includeJson) {
      headers = headers.set('Content-Type', 'application/json');
    }
    return headers;
  }
}