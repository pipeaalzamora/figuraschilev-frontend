import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Figura, FiguraCreate } from '../models/figura.model';

@Injectable({
  providedIn: 'root'
})
export class FiguraService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/figuras';

  getAll(): Observable<Figura[]> {
    return this.http.get<Figura[]>(this.apiUrl);
  }

  getById(id: string): Observable<Figura> {
    return this.http.get<Figura>(`${this.apiUrl}/${id}`);
  }

  create(figura: FiguraCreate): Observable<Figura> {
    return this.http.post<Figura>(this.apiUrl, figura);
  }

  update(id: string, figura: Partial<FiguraCreate>): Observable<Figura> {
    return this.http.put<Figura>(`${this.apiUrl}/${id}`, figura);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/upload`, formData);
  }
}
