import { Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Figura } from '../../../core/models/figura.model';

@Component({
  selector: 'app-figura-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, CurrencyPipe],
  template: `
    <mat-card class="figura-card" (click)="cardClick.emit(figura())">
      <img 
        mat-card-image 
        [src]="figura().imagenPrincipal" 
        [alt]="figura().nombre"
        class="figura-image"
      />
      <mat-card-content>
        <h3 class="figura-nombre">{{ figura().nombre }}</h3>
        <p class="figura-descripcion">{{ figura().descripcionCorta }}</p>
        <div class="figura-precio">
          {{ figura().precio | currency:'CLP':'symbol-narrow':'1.0-0' }}
        </div>
      </mat-card-content>
      <mat-card-actions>
        <button mat-button color="primary">
          <mat-icon>visibility</mat-icon>
          Ver más
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .figura-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .figura-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .figura-image {
      height: 200px;
      object-fit: cover;
    }

    mat-card-content {
      flex: 1;
      padding: 16px;
    }

    .figura-nombre {
      margin: 0 0 8px 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
    }

    .figura-descripcion {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .figura-precio {
      font-size: 1.25rem;
      font-weight: 700;
      color: #e91e63;
    }

    mat-card-actions {
      padding: 8px 16px;
    }
  `]
})
export class FiguraCardComponent {
  figura = input.required<Figura>();
  cardClick = output<Figura>();
}
