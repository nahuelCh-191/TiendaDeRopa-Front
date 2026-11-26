import { TipoVendedor } from "./TipoVendedor";
export interface VendedorDTO {
  version?: number;
  tipoVendedor: TipoVendedor;
  email: string;
  contrasenia?: string;
}