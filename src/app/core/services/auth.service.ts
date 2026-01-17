import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly isAuthenticated = signal(false);
  
  readonly isLoggedIn = this.isAuthenticated.asReadonly();

  constructor(private router: Router) {
    // Verificar si hay sesión guardada
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token');
      this.isAuthenticated.set(!!token);
    }
  }

  login(password: string): boolean {
    // Por ahora usamos una contraseña simple
    // TODO: Implementar autenticación real con backend
    if (password === 'figuras2024') {
      this.isAuthenticated.set(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_token', 'authenticated');
      }
      return true;
    }
    return false;
  }

  logout(): void {
    this.isAuthenticated.set(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
    }
    this.router.navigate(['/']);
  }
}
