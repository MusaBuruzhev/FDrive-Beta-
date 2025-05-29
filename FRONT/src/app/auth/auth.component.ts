import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  isSignUp = false;
  loginData = { username: '', password: '' };
  emailData = { email: '', code: '' };
  loginError = '';
  emailError = '';
  emailMessage = '';
  showCodeInput = false;
  showWelcome = false;
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient, private router: Router) {
    // Check for expired token on component initialization
    this.checkTokenExpiration();
  }

  // Store token with expiration timestamp (1 hour from now)
  private storeToken(token: string) {
    const expiration = Date.now() + 60 * 60 * 1000; // 1 hour in milliseconds
    localStorage.setItem('token', token);
    localStorage.setItem('tokenExpiration', expiration.toString());
  }

  // Check if token is expired and remove it if necessary
  private checkTokenExpiration(): boolean {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('tokenExpiration');

    if (token && expiration) {
      const expirationTime = parseInt(expiration, 10);
      if (Date.now() > expirationTime) {
        // Token has expired, remove it
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiration');
        this.router.navigate(['/auth']);
        return false;
      }
      return true;
    }
    return false;
  }

  onLogin() {
    this.http.post(`${this.apiUrl}/auth/login`, this.loginData).subscribe({
      next: (response: any) => {
        this.storeToken(response.token); // Use storeToken instead of setItem
        this.redirectBasedOnRole(response.token);
      },
      error: (err) => {
        this.loginError = err.error?.message || 'Неверный логин или пароль';
      }
    });
  }

  onEmailAuth() {
    if (!this.showCodeInput) {
      this.http.post(`${this.apiUrl}/auth/registration`, { email: this.emailData.email }).subscribe({
        next: () => {
          this.emailMessage = 'Код подтверждения отправлен на ваш email';
          this.emailError = '';
          this.showCodeInput = true;
        },
        error: (err) => {
          this.emailError = err.error?.message || 'Ошибка при отправке кода';
          this.emailMessage = '';
        }
      });
    } else {
      this.http.post(`${this.apiUrl}/auth/verify-email`, this.emailData).subscribe({
        next: (response: any) => {
          this.storeToken(response.token); // Use storeToken instead of setItem
          this.showWelcome = true;
          setTimeout(() => {
            this.redirectBasedOnRole(response.token);
          }, 1000);
        },
        error: (err) => {
          this.emailError = err.error?.message || 'Неверный код подтверждения';
          this.emailMessage = '';
        }
      });
    }
  }

  redirectBasedOnRole(token: string) {
    // Check if token is still valid before proceeding
    if (!this.checkTokenExpiration()) {
      return; // If token is expired, checkTokenExpiration already handles redirect
    }

    this.http.get(`${this.apiUrl}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (profile: any) => {
        console.log('Ответ от /auth/profile:', profile);
        console.log('Роли:', profile.user.roles);
        if (profile.user.roles && Array.isArray(profile.user.roles) && profile.user.roles.includes('ADMIN')) {
          console.log('Роль ADMIN, редирект на /admin');
          this.router.navigate(['/admin']);
        } else {
          console.log('Роль не ADMIN, редирект на /profile');
          this.router.navigate(['/profile']);
        }
      },
      error: (err) => {
        console.error('Ошибка при запросе профиля:', err);
        this.emailError = 'Ошибка получения профиля: ' + (err.error?.message || 'Попробуйте снова');
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiration'); 
        this.router.navigate(['/auth']);
      }
    });
  }
}