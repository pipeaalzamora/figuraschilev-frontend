import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FiguraService } from '../../../../core/services/figura.service';
import { Figura } from '../../../../core/models/figura.model';

@Component({
  selector: 'app-figura-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressBarModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './figura-form-dialog.component.html',
  styleUrl: './figura-form-dialog.component.css'
})
export class FiguraFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private figuraService = inject(FiguraService);
  private dialogRef = inject(MatDialogRef<FiguraFormDialogComponent>);
  data = inject<Figura | null>(MAT_DIALOG_DATA);

  form!: FormGroup;
  saving = signal(false);
  uploadingMain = signal(false);
  uploadingAdditional = signal(false);
  isEditing = false;

  mainImagePreview = signal<string>('');
  additionalPreviews = signal<string[]>([]);
  
  isDraggingMain = signal(false);
  isDraggingAdditional = signal(false);

  precioFormateado = signal<string>('');

  ngOnInit(): void {
    this.isEditing = !!this.data;
    this.initForm();

    if (this.data) {
      this.mainImagePreview.set(this.data.imagenPrincipal);
      this.additionalPreviews.set([...this.data.imagenesAdicionales]);
      this.precioFormateado.set(this.formatNumber(this.data.precio));
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      nombre: [this.data?.nombre || '', Validators.required],
      descripcionCorta: [this.data?.descripcionCorta || '', Validators.required],
      descripcionLarga: [this.data?.descripcionLarga || ''],
      historia: [this.data?.historia || ''],
      precio: [this.data?.precio || 0, [Validators.required, Validators.min(0)]],
      fechaCompra: [this.data?.fechaCompra ? new Date(this.data.fechaCompra) : new Date(), Validators.required],
      lugarCompra: [this.data?.lugarCompra || '', Validators.required],
      categoria: [this.data?.categoria || ''],
      imagenPrincipal: [this.data?.imagenPrincipal || '', Validators.required],
      imagenesAdicionales: [this.data?.imagenesAdicionales || []],
      destacado: [this.data?.destacado || false]
    });
  }

  formatNumber(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  onPrecioInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value.replace(/\D/g, '');
    const numericValue = parseInt(rawValue, 10) || 0;
    
    this.form.patchValue({ precio: numericValue });
    this.precioFormateado.set(this.formatNumber(numericValue));
  }

  onDragOver(event: DragEvent, type: 'main' | 'additional'): void {
    event.preventDefault();
    event.stopPropagation();
    if (type === 'main') {
      this.isDraggingMain.set(true);
    } else {
      this.isDraggingAdditional.set(true);
    }
  }

  onDragLeave(type: 'main' | 'additional'): void {
    if (type === 'main') {
      this.isDraggingMain.set(false);
    } else {
      this.isDraggingAdditional.set(false);
    }
  }

  onDrop(event: DragEvent, type: 'main' | 'additional'): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.isDraggingMain.set(false);
    this.isDraggingAdditional.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (this.isValidImage(file)) {
        if (type === 'main') {
          this.uploadMainImage(file);
        } else {
          this.uploadAdditionalImage(file);
        }
      }
    }
  }

  isValidImage(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;
    return validTypes.includes(file.type) && file.size <= maxSize;
  }

  onMainImageSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && this.isValidImage(file)) {
      this.uploadMainImage(file);
    }
  }

  onAdditionalImageSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && this.isValidImage(file)) {
      this.uploadAdditionalImage(file);
    }
  }

  private uploadMainImage(file: File): void {
    this.uploadingMain.set(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      this.mainImagePreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    this.figuraService.uploadImage(file).subscribe({
      next: (response) => {
        this.mainImagePreview.set(response.url);
        this.form.patchValue({ imagenPrincipal: response.url });
        this.uploadingMain.set(false);
      },
      error: () => {
        this.mainImagePreview.set('');
        this.uploadingMain.set(false);
      }
    });
  }

  private uploadAdditionalImage(file: File): void {
    this.uploadingAdditional.set(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const tempUrl = e.target?.result as string;
      this.additionalPreviews.update(current => [...current, tempUrl]);
    };
    reader.readAsDataURL(file);

    this.figuraService.uploadImage(file).subscribe({
      next: (response) => {
        this.additionalPreviews.update(current => {
          const updated = [...current];
          updated[updated.length - 1] = response.url;
          return updated;
        });
        this.form.patchValue({ imagenesAdicionales: this.additionalPreviews() });
        this.uploadingAdditional.set(false);
      },
      error: () => {
        this.additionalPreviews.update(current => current.slice(0, -1));
        this.uploadingAdditional.set(false);
      }
    });
  }

  removeAdditionalImage(index: number): void {
    this.additionalPreviews.update(current => current.filter((_, i) => i !== index));
    this.form.patchValue({ imagenesAdicionales: this.additionalPreviews() });
  }

  save(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    const figura = this.form.value;

    const request = this.isEditing
      ? this.figuraService.update(this.data!._id!, figura)
      : this.figuraService.create(figura);

    request.subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: () => {
        this.saving.set(false);
      }
    });
  }
}
