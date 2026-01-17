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
    MatCheckboxModule
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

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>URL Imagen Principal</mat-label>
          <input matInput formControlName="imagenPrincipal" placeholder="https://..." />
          <mat-icon matSuffix>image</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>URLs Imágenes Adicionales (separadas por coma)</mat-label>
          <textarea matInput formControlName="imagenesAdicionales" rows="2" placeholder="url1, url2, url3"></textarea>
          <mat-hint>Separa cada URL con una coma</mat-hint>
        </mat-form-field>

        <mat-checkbox formControlName="destacado">Marcar como destacada</mat-checkbox>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button 
        mat-raised-button 
        color="primary" 
        [disabled]="form.invalid || saving()"
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
  isEditing = false;

  ngOnInit(): void {
    this.isEditing = !!this.data;
    this.initForm();
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
      imagenesAdicionales: [this.data?.imagenesAdicionales?.join(', ') || ''],
      destacado: [this.data?.destacado || false]
    });
  }

  save(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    const formValue = this.form.value;

    const figura = {
      ...formValue,
      imagenesAdicionales: formValue.imagenesAdicionales
        ? formValue.imagenesAdicionales.split(',').map((url: string) => url.trim()).filter(Boolean)
        : []
    };

    const request = this.isEditing
      ? this.figuraService.update(this.data!._id!, figura)
      : this.figuraService.create(figura);

    request.subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: () => {
        // Mock success para desarrollo
        this.dialogRef.close(true);
      }
    });
  }
}
