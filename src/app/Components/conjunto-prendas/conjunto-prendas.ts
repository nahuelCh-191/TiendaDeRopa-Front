import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicePrenda } from '../../Services/ServicePrenda';
import { Prenda } from '../../Models/Prenda';
import { PrendaDTO } from '../../Models/PrendaDTO';
import { OnInit } from '@angular/core';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-conjunto-prendas',
  imports: [],
  templateUrl: './conjunto-prendas.html',
  styleUrl: './conjunto-prendas.css',
})
export class ConjuntoPrendas implements OnInit {
  private readonly servicePrenda=inject(ServicePrenda)
  private readonly ruta=inject(Router)
  private readonly activateRoute=inject(ActivatedRoute)
  private readonly auth=inject(AuthService)

  nombre=""
  valor=0
  esAdmin=true;
  prendas:Prenda[]=[]
  prendaSinFiltrar:Prenda[]=[]
  estado: 'cargando' | 'listo' | 'error' = 'cargando';
  vista: 'activas' | 'inactivas' | 'todas' = 'activas';

  ngOnInit(): void {

    if(!this.auth.getEmail()){
      this.ruta.navigateByUrl('/login'); // no hay sesión
      return;
    }

    this.esAdmin=this.auth.esAdministrador()

    this.activateRoute.paramMap.subscribe(params=>{
      if(params.has("nombre")){
        this.nombre= String(params.get('nombre') ?? "")
        this.cargarPrendasPorNombre(this.nombre);
      }

      if(params.has("valor")){
        this.valor=Number(params.get('valor')??0)
        if (Number.isNaN(this.valor)) {
          this.estado = 'error';
          return;
        }
        this.cargarPrendasPorValor(this.valor);
      }
    })
  }

  cargarPrendasPorNombre(nombre: string) {
    this.estado = 'cargando';
    this.servicePrenda.buscarPorNombre(nombre).subscribe({
      next: (dato) => {
        if (this.nombre !== nombre) return;   // llegó tarde: ya se buscó otra cosa
        this.prendaSinFiltrar = dato
        this.prendasActivas();
        this.estado = 'listo';
      },
      error: (err) => {
        console.log(err);
        if (this.nombre === nombre) this.estado = 'error';
      },
    });
  }

  cargarPrendasPorValor(valor:number){
    this.estado = 'cargando';
    this.servicePrenda.obtenerMenorAlPrecio(valor).subscribe({
      next: (dato) => {
        if (this.valor !== valor) return;   // llegó tarde: ya se buscó otra cosa
        this.prendaSinFiltrar = dato;
        this.prendasActivas();
        this.estado = 'listo';
      },
      error: (err) => {
        console.log(err);
        if (this.valor === valor) this.estado = 'error';
      },
    });
  }

  seleccionarPrenda(id: number) {
    this.ruta.navigateByUrl(`/prendaEspecifica/${id}`);
  }

  prendasActivas(){
    this.vista = 'activas';
    this.prendas=this.prendaSinFiltrar.filter(prenda=>prenda.prendaActiva===true)
  }

  prendasInactivas(){
    this.vista = 'inactivas';
    this.prendas=this.prendaSinFiltrar.filter(prenda=>prenda.prendaActiva===false)
  }

  todasPrendas(){
    this.vista = 'todas';
    this.prendas=this.prendaSinFiltrar
  }
}
