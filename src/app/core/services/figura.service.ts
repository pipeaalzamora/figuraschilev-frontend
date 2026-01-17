import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { Figura, FiguraCreate, PaginatedResponse, FiguraStats } from '../models/figura.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FiguraService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/figuras`;

  // Cache simple
  private cache = signal<PaginatedResponse<Figura> | null>(null);
  private cacheKey = signal<string>('');

  getAll(page = 1, limit = 20, search = '', forceRefresh = false): Observable<PaginatedResponse<Figura>> {
    const key = `${page}-${limit}-${search}`;
    
    if (!forceRefresh && this.cache() && this.cacheKey() === key) {
      return of(this.cache()!);
    }

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedResponse<Figura>>(this.apiUrl, { params }).pipe(
      tap(response => {
        this.cache.set(response);
        this.cacheKey.set(key);
      })
    );
  }

  getById(id: string): Observable<Figura> {
    return this.http.get<Figura>(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<FiguraStats> {
    return this.http.get<FiguraStats>(`${this.apiUrl}/stats`);
  }

  create(figura: FiguraCreate): Observable<Figura> {
    return this.http.post<Figura>(this.apiUrl, figura).pipe(
      tap(() => this.invalidateCache())
    );
  }

  update(id: string, figura: Partial<FiguraCreate>): Observable<Figura> {
    return this.http.put<Figura>(`${this.apiUrl}/${id}`, figura).pipe(
      tap(() => this.invalidateCache())
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.invalidateCache())
    );
  }

  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ url: string }>(`${environment.apiUrl}/upload/image`, formData);
  }

  invalidateCache(): void {
    this.cache.set(null);
    this.cacheKey.set('');
  }
}
