import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Error de conexión';

      if (error.status === 401) {
        message = 'Sesión expirada';
        router.navigate(['/admin/login']);
      } else if (error.status === 403) {
        message = 'No autorizado';
      } else if (error.status === 404) {
        message = 'Recurso no encontrado';
      } else if (error.status >= 500) {
        message = 'Error del servidor';
      } else if (error.error?.error) {
        message = error.error.error;
      }

      snackBar.open(message, 'Cerrar', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      return throwError(() => error);
    })
  );
};
