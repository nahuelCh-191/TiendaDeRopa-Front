import { Categoria } from "./Categoria";
 
export interface SubCategoria {
  id: number;
  version: number;
  nombreSubCategoria: string;
  categoria: Categoria;
}