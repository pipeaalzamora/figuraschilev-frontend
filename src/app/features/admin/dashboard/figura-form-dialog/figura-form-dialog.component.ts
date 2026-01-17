import { Component, inject, signal, OnInit, computed } from '@angular/core';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FiguraService } from '../../../../core/services/figura.service';
import { Figura } from '../../../../core/models/figura.model';

interface ImagePreview {
  id: string;
  url: string;
  uploading: boolean;
}

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
    MatProgressBarModule,
    MatProgressSpinnerModule
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
  isEditing = false;

  imagePreviews = signal<ImagePreview[]>([]);
  isDragging = signal(false);
  draggedIndex: number | null = null;

  precioFormateado = signal<string>('');

  isUploading = computed(() => this.imagePreviews().some(img => img.uploading));

  ngOnInit(): void {
    this.isEditing = !!this.data;
    this.initForm();

    if (this.data) {
      const images: ImagePreview[] = [];
      if (this.data.imagenPrincipal) {
        images.push({ id: this.generateId(), url: this.data.imagenPrincipal, uploading: false });
      }
      this.data.imagenesAdicionales.forEach(url => {
        images.push({ id: this.generateId(), url, uploading: false });
      });
      this.imagePreviews.set(images);
      this.precioFormateado.set(this.formatNumber(this.data.precio));
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      nombre: [this.data?.nombre || '', Validators.required],
      descripcionLarga: [this.data?.descripcionLarga || ''],
      historia: [this.data?.historia || ''],
      precio: [this.data?.precio || 0, [Validators.required, Validators.min(0)]],
      fechaCompra: [this.data?.fechaCompra ? new Date(this.data.fechaCompra) : new Date(), Validators.required],
      lugarCompra: [this.data?.lugarCompra || '', Validators.required],
      categoria: [this.data?.categoria || ''],
      destacado: [this.data?.destacado || false]
    });
  }

  generateId(): string {
    return Math.random().toString(36).substring(2, 9);
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

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(): void {
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.uploadFiles(Array.from(files));
    }
  }

  onImagesSelect(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      this.uploadFiles(Array.from(files));
      (event.target as HTMLInputElement).value = '';
    }
  }

  private uploadFiles(files: File[]): void {
    const validFiles = files.filter(file => this.isValidImage(file));
    
    validFiles.forEach(file => {
      const id = this.generateId();
      
      // Agregar preview temporal
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreviews.update(current => [
          ...current,
          { id, url: e.target?.result as string, uploading: true }
        ]);
      };
      reader.readAsDataURL(file);

      // Subir a S3
      this.figuraService.uploadImage(file).subscribe({
        next: (response) => {
          this.imagePreviews.update(current =>
            current.map(img => img.id === id ? { ...img, url: response.url, uploading: false } : img)
          );
        },
        error: () => {
          this.imagePreviews.update(current => current.filter(img => img.id !== id));
        }
      });
    });
  }

  isValidImage(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;
    return validTypes.includes(file.type) && file.size <= maxSize;
  }

  removeImage(index: number): void {
    this.imagePreviews.update(current => current.filter((_, i) => i !== index));
  }

  moveImageToFirst(index: number): void {
    this.imagePreviews.update(current => {
      const newArray = [...current];
      const [removed] = newArray.splice(index, 1);
      newArray.unshift(removed);
      return newArray;
    });
  }

  // Drag & drop para reordenar
  onImageDragStart(event: DragEvent, index: number): void {
    this.draggedIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onImageDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onImageDrop(event: DragEvent, targetIndex: number): void {
    event.preventDefault();
    if (this.draggedIndex !== null && this.draggedIndex !== targetIndex) {
      this.imagePreviews.update(current => {
        const newArray = [...current];
        const [removed] = newArray.splice(this.draggedIndex!, 1);
        newArray.splice(targetIndex, 0, removed);
        return newArray;
      });
    }
    this.draggedIndex = null;
  }

  save(): void {
    if (this.form.invalid || this.imagePreviews().length === 0) return;

    this.saving.set(true);
    
    const images = this.imagePreviews().filter(img => !img.uploading);
    const figura = {
      ...this.form.value,
      descripcionCorta: this.form.value.descripcionLarga?.substring(0, 100) || '',
      imagenPrincipal: images[0]?.url || '',
      imagenesAdicionales: images.slice(1).map(img => img.url)
    };

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
