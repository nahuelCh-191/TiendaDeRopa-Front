import { TipoVendedor } from "./TipoVendedor";
export interface Vendedor {
  id: number;
  version: number;
  tipoVendedor: TipoVendedor;
  email: string;
}