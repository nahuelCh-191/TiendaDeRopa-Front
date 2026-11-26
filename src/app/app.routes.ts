import { Routes } from '@angular/router';
import { Login } from './Components/login/login';
import { Categorias } from './Components/categorias/categorias';
import { SubCategorias } from './Components/sub-categorias/sub-categorias';
import { PrendaEspecifica } from './Components/prenda-especifica/prenda-especifica';
import { ConjuntoPrendas } from './Components/conjunto-prendas/conjunto-prendas';
import { Vendedores } from './Components/vendedores/vendedores';
import { VendedorEspecifico } from './Components/vendedor-especifico/vendedor-especifico';
import { Venta } from './Components/venta/venta';
import { Etiquetas } from './Components/etiquetas/etiquetas';
import { VentasPorMes } from './Components/ventas-por-mes/ventas-por-mes';

export const routes: Routes = [
    {path:'', redirectTo:'login', pathMatch:'full'},
    {path:'login', component:Login, title:'login'},
    {path:'categorias', component:Categorias},
    {path:'subCategoria/:id', component:SubCategorias},
    {path:'prendaEspecifica/:id', component:PrendaEspecifica},
    {path:'conjuntoPrendas/por-nombre/:nombre', component:ConjuntoPrendas},
    {path:'conjuntoPrendas/por-valor/:valor', component:ConjuntoPrendas},
    {path:'vendedores', component:Vendedores},
    {path:'vendedorEspecifico/:id', component:VendedorEspecifico},
    {path:'venta/:id/:idVendedor', component:Venta},
    {path:'etiquetas',component:Etiquetas},
    {path:'ventasPorMes',component:VentasPorMes},
    { path: '**', redirectTo: 'login' }
];
