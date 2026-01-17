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
  templateUrl: './figura-card.component.html',
  styleUrl: './figura-card.component.css'
})
export class FiguraCardComponent {
  figura = input.required<Figura>();
  cardClick = output<Figura>();
}
