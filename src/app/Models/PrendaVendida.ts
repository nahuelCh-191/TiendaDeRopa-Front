import { Prenda } from "./Prenda";
import { Vendedor } from "./Vendedor";

export interface PrendaVendida {
  id: number;
  prenda: Prenda;          // viene con la versión y el stock ya actualizados
  vendedor: Vendedor;
  valorVenta: number;      // precio congelado al momento de la venta
  fechaVenta: string;      // formato ISO: "2026-10-05"
  nombreCliente: string;
}
