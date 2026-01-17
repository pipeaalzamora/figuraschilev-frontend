import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Figura } from '../../../core/models/figura.model';

@Component({
  selector: 'app-figura-detail-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatIconModule,
    MatChipsModule,
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './figura-detail-dialog.component.html',
  styleUrl: './figura-detail-dialog.component.css'
})
export class FiguraDetailDialogComponent {
  data = inject<Figura>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<FiguraDetailDialogComponent>);

  allImages: string[] = [this.data.imagenPrincipal, ...this.data.imagenesAdicionales];
  currentImage = this.data.imagenPrincipal;

  close(): void {
    this.dialogRef.close();
  }
}
