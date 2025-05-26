import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'fdrivi';
public isAuthenticated = false;
public isAdmin = false;

constructor() {
  const token = localStorage.getItem('token');
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    this.isAuthenticated = true;
    this.isAdmin = payload?.roles?.includes('ADMIN');
  }

  window.addEventListener('scroll', this.handleScroll);
}

  handleScroll = () => {
    const header = document.querySelector('.site-header');
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 400);
    }
  }
}
