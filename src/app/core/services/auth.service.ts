import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly isAuthenticated = signal(false);
  readonly isLoggedIn = this.isAuthenticated.asReadonly();

  constructor() {
    this.checkAuth();
  }

  private checkAuth(): void {
    if (typeof window === 'undefined') return;
    
    this.http.get(`${this.apiUrl}/check`).pipe(
      catchError(() => of(null))
    ).subscribe(response => {
      this.isAuthenticated.set(!!response);
    });
  }

  login(password: string): Observable<boolean> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/login`, { password }).pipe(
      tap(() => this.isAuthenticated.set(true)),
      map(() => true),
      catchError(() => of(false))
    );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      complete: () => {
        this.isAuthenticated.set(false);
        this.router.navigate(['/']);
      }
    });
  }
}
