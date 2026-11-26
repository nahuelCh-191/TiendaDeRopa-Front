import { Etiqueta } from "./Etiqueta";
import { SubCategoria } from "./SubCategoria";
export interface Prenda {
  id: number;
  version: number;
  nombrePrenda: string;
  descripcionPrenda: string;
  precioPrenda: number;
  cantidad: number;
  prendaActiva: boolean;
  listaEtiquetasPrenda: Etiqueta[];
  subCategoria: SubCategoria;
}