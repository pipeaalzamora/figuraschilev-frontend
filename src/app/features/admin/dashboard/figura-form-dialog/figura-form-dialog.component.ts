import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
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
    MatNativeDateModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressBarModule
  ],
  template: `
    <h2 mat-dialog-title>
      {{ isEditing ? 'Editar' : 'Nueva' }} Figura
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="figura-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" placeholder="Ej: Goku Super Saiyan" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descripción corta</mat-label>
          <input matInput formControlName="descripcionCorta" placeholder="Breve descripción para la card" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descripción completa</mat-label>
          <textarea matInput formControlName="descripcionLarga" rows="3"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Historia</mat-label>
          <textarea matInput formControlName="historia" rows="3" placeholder="¿Cómo la conseguiste?"></textarea>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Precio (CLP)</mat-label>
            <input matInput type="number" formControlName="precio" />
            <span matPrefix>$&nbsp;</span>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Fecha de compra</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="fechaCompra" />
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Lugar de compra</mat-label>
            <input matInput formControlName="lugarCompra" placeholder="Ej: Persa Bio Bio" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Categoría</mat-label>
            <mat-select formControlName="categoria">
              <mat-option value="Anime">Anime</mat-option>
              <mat-option value="Comics">Comics</mat-option>
              <mat-option value="Videojuegos">Videojuegos</mat-option>
              <mat-option value="Películas">Películas</mat-option>
              <mat-option value="Pokémon">Pokémon</mat-option>
              <mat-option value="Otros">Otros</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <!-- Imagen Principal -->
        <div class="image-upload-section">
          <label>Imagen Principal</label>
          <div class="upload-area" (click)="mainImageInput.click()">
            @if (mainImagePreview()) {
              <img [src]="mainImagePreview()" alt="Preview" class="preview-image" />
            } @else {
              <mat-icon>cloud_upload</mat-icon>
              <span>Click para subir imagen</span>
            }
          </div>
          <input 
            #mainImageInput 
            type="file" 
            accept="image/*" 
            hidden 
            (change)="onMainImageSelect($event)"
          />
          @if (uploadingMain()) {
            <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          }
        </div>

        <!-- Imágenes Adicionales -->
        <div class="image-upload-section">
          <label>Imágenes Adicionales</label>
          <div class="additional-images">
            @for (img of additionalPreviews(); track img; let i = $index) {
              <div class="additional-image-item">
                <img [src]="img" alt="Adicional" />
                <button mat-icon-button (click)="removeAdditionalImage(i)" type="button">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            }
            <div class="upload-area small" (click)="additionalImageInput.click()">
              <mat-icon>add_photo_alternate</mat-icon>
            </div>
          </div>
          <input 
            #additionalImageInput 
            type="file" 
            accept="image/*" 
            hidden 
            (change)="onAdditionalImageSelect($event)"
          />
          @if (uploadingAdditional()) {
            <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          }
        </div>

        <mat-checkbox formControlName="destacado">Marcar como destacada</mat-checkbox>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button 
        mat-raised-button 
        color="primary" 
        [disabled]="form.invalid || saving() || uploadingMain() || uploadingAdditional()"
        (click)="save()"
      >
        {{ saving() ? 'Guardando...' : 'Guardar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .figura-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 500px;
    }

    .full-width {
      width: 100%;
    }

    .row {
      display: flex;
      gap: 16px;
    }

    .row mat-form-field {
      flex: 1;
    }

    .image-upload-section {
      margin: 16px 0;
    }

    .image-upload-section label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #666;
    }

    .upload-area {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .upload-area:hover {
      border-color: #667eea;
    }

    .upload-area.small {
      padding: 20px;
      width: 80px;
      height: 80px;
    }

    .upload-area mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #999;
    }

    .upload-area.small mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .preview-image {
      max-width: 200px;
      max-height: 200px;
      object-fit: contain;
    }

    .additional-images {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .additional-image-item {
      position: relative;
      width: 80px;
      height: 80px;
    }

    .additional-image-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }

    .additional-image-item button {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #f44336;
      color: white;
      width: 24px;
      height: 24px;
      line-height: 24px;
    }

    .additional-image-item button mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    mat-checkbox {
      margin-top: 8px;
    }

    @media (max-width: 600px) {
      .figura-form {
        min-width: auto;
      }

      .row {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
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

  ngOnInit(): void {
    this.isEditing = !!this.data;
    this.initForm();

    if (this.data) {
      this.mainImagePreview.set(this.data.imagenPrincipal);
      this.additionalPreviews.set([...this.data.imagenesAdicionales]);
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      nombre: [this.data?.nombre || '', Validators.required],
      descripcionCorta: [this.data?.descripcionCorta || '', Validators.required],
      descripcionLarga: [this.data?.descripcionLarga || ''],
      historia: [this.data?.historia || ''],
      precio: [this.data?.precio || 0, [Validators.required, Validators.min(0)]],
      fechaCompra: [this.data?.fechaCompra || new Date(), Validators.required],
      lugarCompra: [this.data?.lugarCompra || '', Validators.required],
      categoria: [this.data?.categoria || ''],
      imagenPrincipal: [this.data?.imagenPrincipal || '', Validators.required],
      imagenesAdicionales: [this.data?.imagenesAdicionales || []],
      destacado: [this.data?.destacado || false]
    });
  }

  onMainImageSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploadingMain.set(true);
    this.figuraService.uploadImage(file).subscribe({
      next: (response) => {
        this.mainImagePreview.set(response.url);
        this.form.patchValue({ imagenPrincipal: response.url });
        this.uploadingMain.set(false);
      },
      error: () => {
        this.uploadingMain.set(false);
      }
    });
  }

  onAdditionalImageSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploadingAdditional.set(true);
    this.figuraService.uploadImage(file).subscribe({
      next: (response) => {
        this.additionalPreviews.update(current => [...current, response.url]);
        this.form.patchValue({ imagenesAdicionales: this.additionalPreviews() });
        this.uploadingAdditional.set(false);
      },
      error: () => {
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
