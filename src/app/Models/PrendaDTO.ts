export interface PrendaDTO {
  version?: number;
  nombrePrenda: string;
  descripcionPrenda: string;
  precioPrenda: number;
  cantidad: number;
  prendaActiva?: boolean;
  idEtiquetas?: number[];
}