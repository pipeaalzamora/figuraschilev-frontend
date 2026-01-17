export interface Figura {
  _id?: string;
  nombre: string;
  descripcionCorta: string;
  descripcionLarga: string;
  precio: number;
  imagenPrincipal: string;
  imagenesAdicionales: string[];
  historia: string;
  fechaCompra: Date;
  lugarCompra: string;
  categoria?: string;
  destacado?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FiguraCreate {
  nombre: string;
  descripcionCorta: string;
  descripcionLarga: string;
  precio: number;
  imagenPrincipal: string;
  imagenesAdicionales: string[];
  historia: string;
  fechaCompra: Date;
  lugarCompra: string;
  categoria?: string;
  destacado?: boolean;
}
