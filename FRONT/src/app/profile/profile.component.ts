import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../servis/profile.service';
import { CarService, Car } from '../servis/car.service';
import { Router } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarCardComponent } from '../car-card/car-card.component';
import { CAR_BRANDS_MODELS } from '../servis/car-brands';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, CarCardComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user: any = null;
  section = 'profile';
  isEditing = false;
  password = '';
  updatedUser: any = {};
  doc1: any = null;
  doc2: any = null;
  docError = '';
  users: any[] = [];
  docsToModerate: any[] = [];
  userCars: Car[] = [];
  showAddCarForm = false;
  newCar: any = {
    name: '',
    carModel: '',
    description: '',
    price: '',
    carYear: '',
    carColor: '',
    carTransmission: '',
    carFuelType: '',
    carSeats: '',
    carLuggage: '',
    canDeliver: false,
    address: '',
  };
  carImages: File[] = [];
  carImagePreviews: string[] = [];
  brands = CAR_BRANDS_MODELS;
  availableModels: string[] = [];
  transmissions = ['Механика', 'Автомат '];
  fuelTypes = ['Бензиновый ', 'Дизель', 'Электро'];
  seatsOptions = [2, 4, 5, 7, 8];
  years = Array.from({ length: 2026 - 2000 }, (_, i) => 2000 + i).reverse();

  constructor(
    private profileService: ProfileService,
    private carService: CarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.section = localStorage.getItem('profile-section') || 'profile';
    this.loadProfile();
    if (this.section === 'my-cars') {
      this.loadUserCars();
    }
  }

  setSection(sec: string) {
    this.section = sec;
    localStorage.setItem('profile-section', sec);
    if (sec === 'my-cars') {
      this.loadUserCars();
    }
  }

  loadProfile() {
    this.profileService.getProfile().subscribe({
      next: (res) => {
        this.user = res.user;
        this.updatedUser = { ...res.user };
      },
      error: () => {
        this.router.navigate(['/auth']);
      },
    });
  }
  private parseImageField(image: any): string[] {
  const apiUrl = 'http://localhost:5000';
  if (Array.isArray(image)) {
    return image.map((img: string) =>
      img.startsWith('http')
        ? img.replace(/\\/g, '/')
        : `${apiUrl}/${img.replace(/\\/g, '/')}`
    );
  } else if (typeof image === 'string') {
    return image
      .split(',')
      .map(img => img.trim())
      .filter(img => img.length > 0)
      .map(img =>
        img.startsWith('http')
          ? img.replace(/\\/g, '/')
          : `${apiUrl}/${img.replace(/\\/g, '/')}`
      );
  }
  return [];
}

loadUserCars() {
  this.carService.getUserCars().subscribe({
    next: (cars) => {
      this.userCars = cars.map(car => ({
        ...car,
        image: this.parseImageField(car.image)
      }));
    },
    error: (err) => {
      console.error('Ошибка при загрузке автомобилей:', err);
      this.userCars = [];
    },
  });
}

  canAddCar(): boolean {
    const isProfileFilled =
      this.user &&
      this.user.name &&
      this.user.surname &&
      this.user.phone &&
      this.user.drivingExperience;
    return isProfileFilled && this.user.documentsVerified;
  }

  showAddCarFormToggle() {
    this.showAddCarForm = !this.showAddCarForm;
    if (!this.showAddCarForm) {
      this.resetCarForm();
    }
  }

  updateModels() {
    const brand = this.brands.find((b) => b.name === this.newCar.name);
    this.availableModels = brand ? brand.models : [];
    if (!brand && this.newCar.carModel) {
      this.newCar.carModel = '';
    }
  }

  onCarFileChange(e: any) {
    const files = Array.from(e.target.files) as File[];
    if (files.length < 4 || files.length > 10) {
      alert('Загрузите от 4 до 10 изображений');
      this.carImages = [];
      this.carImagePreviews = [];
      return;
    }
    this.carImages = files;
    this.carImagePreviews = files.map((file) => URL.createObjectURL(file));
  }

  addCar() {
    const requiredFields = [
      { key: 'name', value: this.newCar.name, label: 'Марка' },
      { key: 'carModel', value: this.newCar.carModel, label: 'Модель' },
      { key: 'description', value: this.newCar.description, label: 'Описание' },
      { key: 'price', value: this.newCar.price, label: 'Цена' },
      { key: 'carYear', value: this.newCar.carYear, label: 'Год' },
      { key: 'carColor', value: this.newCar.carColor, label: 'Цвет' },
      { key: 'carTransmission', value: this.newCar.carTransmission, label: 'Коробка передач' },
      { key: 'carFuelType', value: this.newCar.carFuelType, label: 'Топливо' },
      { key: 'carSeats', value: this.newCar.carSeats, label: 'Количество мест' },
      { key: 'carLuggage', value: this.newCar.carLuggage, label: 'Объём багажника' },
      { key: 'address', value: this.newCar.address, label: 'Адрес' },
    ];

    const missingFields = requiredFields
      .filter(field => !field.value || field.value === '')
      .map(field => field.label);

    if (missingFields.length > 0) {
      alert(`Заполните обязательные поля: ${missingFields.join(', ')}`);
      return;
    }

    if (this.carImages.length < 4 || this.carImages.length > 10) {
      alert('Загрузите от 4 до 10 изображений');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.newCar.name);
    formData.append('carModel', this.newCar.carModel);
    formData.append('description', this.newCar.description);
    formData.append('price', this.newCar.price);
    formData.append('carYear', this.newCar.carYear);
    formData.append('carColor', this.newCar.carColor);
    formData.append('carTransmission', this.newCar.carTransmission);
    formData.append('carFuelType', this.newCar.carFuelType);
    formData.append('carSeats', this.newCar.carSeats);
    formData.append('carLuggage', this.newCar.carLuggage);
    formData.append('canDeliver', String(this.newCar.canDeliver));
    formData.append('address', this.newCar.address);
    this.carImages.forEach((file) => formData.append('image[]', file));

    this.carService.addCar(formData).subscribe({
      next: () => {
        this.loadUserCars();
        this.showAddCarForm = false;
        this.resetCarForm();
      },
      error: (err) => {
        console.error('Ошибка при добавлении авто:', err);
        alert('Не удалось добавить автомобиль: ' + (err.error?.message || 'Проверьте данные'));
      },
    });
  }

  deleteCar(id: string) {
    if (confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
      this.carService.deleteCar(id).subscribe({
        next: () => {
          this.userCars = this.userCars.filter(car => car._id !== id);
        },
        error: (err) => {
          console.error('Ошибка при удалении авто:', err);
          alert('Не удалось удалить автомобиль: ' + (err.error?.message || 'Попробуйте снова'));
        },
      });
    }
  }

  resetCarForm() {
    this.newCar = {
      name: '',
      carModel: '',
      description: '',
      price: '',
      carYear: '',
      carColor: '',
      carTransmission: '',
      carFuelType: '',
      carSeats: '',
      carLuggage: '',
      canDeliver: false,
      address: '',
    };
    this.carImages = [];
    this.carImagePreviews = [];
    this.availableModels = [];
  }

  removeAllDocs() {
    const fake = new File([new Uint8Array()], 'empty.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('passport', fake);
    formData.append('passport', fake);

    this.profileService.uploadDocuments(formData).subscribe(() => {
      this.doc1 = null;
      this.doc2 = null;
      this.user.passportFiles = [];
      this.user.documentsVerified = false;
    });
  }

  getTempPreview(side: number): string | null {
    const file = side === 1 ? this.doc1 : this.doc2;
    return file ? URL.createObjectURL(file) : null;
  }

  hasDocChanges(): boolean {
    return !!(this.doc1 || this.doc2);
  }

  removeSavedDoc(index: number) {
    if (this.user.passportFiles && this.user.passportFiles.length > index) {
      this.user.passportFiles[index] = null;
    }
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/auth']);
    location.reload();
  }

  deleteAccount() {
    this.profileService.deleteAccount().subscribe(() => {
      localStorage.removeItem('token');
      this.router.navigate(['/auth']);
    });
  }

  enableEdit() {
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
    this.updatedUser = { ...this.user };
    this.password = '';
  }

  saveProfile() {
    const payload = { ...this.updatedUser };
    if (this.password) {
      payload.password = this.password;
    }
    this.profileService.updateProfile(payload).subscribe((res) => {
      this.user = res.user;
      this.updatedUser = { ...res.user };
      this.isEditing = false;
      this.password = '';
    });
  }

  onFileChange(e: any, side: number) {
    if (e.target.files.length > 0) {
      if (side === 1) this.doc1 = e.target.files[0];
      if (side === 2) this.doc2 = e.target.files[0];
    }
  }

  uploadDocs() {
    if (!this.doc1 || !this.doc2) {
      this.docError = 'Загрузите обе стороны паспорта';
      return;
    }
    const formData = new FormData();
    formData.append('passport', this.doc1);
    formData.append('passport', this.doc2);
    this.profileService.uploadDocuments(formData).subscribe(() => {
      this.user.passportFiles = [this.doc1.name, this.doc2.name];
      this.user.documentsVerified = false;
      this.doc1 = null;
      this.doc2 = null;
      this.docError = '';
    });
    location.reload();
  }

  loadUsers() {
    this.profileService.getAllUsers().subscribe((res) => {
      this.users = res;
    });
  }

  loadModerationDocs() {
    this.profileService.getUnverifiedDocuments().subscribe((res) => {
      this.docsToModerate = res;
    });
  }

  approveDoc(id: string) {
    this.profileService.moderateDocuments(id, 'approve').subscribe(() => {
      this.docsToModerate = this.docsToModerate.filter((u) => u._id !== id);
    });
  }

  rejectDoc(id: string) {
    this.profileService.moderateDocuments(id, 'reject').subscribe(() => {
      this.docsToModerate = this.docsToModerate.filter((u) => u._id !== id);
    });
  }

  deleteUser(id: string) {
    this.profileService.deleteUser(id).subscribe(() => {
      this.users = this.users.filter((u) => u._id !== id);
    });
  }

  formatImage(path: string) {
    return 'http://localhost:5000/' + path.replace('\\', '/');
  }
}