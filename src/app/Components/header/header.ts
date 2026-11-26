import { Component } from '@angular/core';
import { Router,RouterLink } from '@angular/router';
import { inject } from '@angular/core';
import { routes } from '../../app.routes';
import { AuthService } from '../../Services/auth.service';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit{
  private readonly ruta= inject(Router)
  private readonly auth= inject(AuthService)

  esAdmin=false

  ngOnInit(): void {
    if(!this.auth.getEmail()){
      this.ruta.navigateByUrl('/login');
      return
    }

    this.esAdmin=this.auth.esAdministrador()
  }

  buscarPorNombre(nombre:string){
    const texto = nombre.trim();
    if (!texto) return;                                    // no navega con el campo vacío
    this.ruta.navigate(['conjuntoPrendas/por-nombre', texto]);       // codifica el texto solo
  }

  buscarPorValor(valor:number){
    this.ruta.navigate(['conjuntoPrendas/por-valor', valor]);
  }

  buscar(modo: string, valor: string) {
    if (modo === 'precio') {
      const precio = Number(valor);
      if (valor.trim() === '' || Number.isNaN(precio) || precio < 0) return;
      this.buscarPorValor(precio);
    } else {
      this.buscarPorNombre(valor);
    }
  }

  cerrarSecion(){
    this.auth.logout();
    this.ruta.navigateByUrl('/login');
  }

  vendedores(){
    this.ruta.navigateByUrl('/vendedores');
  }

  etiquetas(){
    this.ruta.navigateByUrl('/etiquetas');
  }

  ventasPorMes(){
    this.ruta.navigateByUrl('/ventasPorMes');
  }

  irA(destino: string) {
    if (destino === 'vendedores') this.vendedores();
    if (destino === 'etiquetas') this.etiquetas();
    if (destino === 'ventasPorMes') this.ventasPorMes();
    // acá se suman los destinos futuros (ventas, etiquetas...)
  }
}
