import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicePrendavendida } from '../../Services/ServicePrendaVendida';
import { TotalMensual } from '../../Models/TotalMensual';
import { AuthService } from '../../Services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-ventas-por-mes',
  imports: [],
  templateUrl: './ventas-por-mes.html',
  styleUrl: './ventas-por-mes.css',
})
export class VentasPorMes implements OnInit {
  private readonly auth=inject(AuthService)
  private readonly route=inject(Router)
  private readonly rutaActiva=inject(ActivatedRoute)
  private readonly servicePrendavendida=inject(ServicePrendavendida)

  idVendedor=0
  listaTotales:TotalMensual[]=[]
  mensajeError = ''
  mesesElegidos = 12
  anioActual=9999

  ngOnInit(): void {
    if (!this.auth.getEmail()) {
      this.route.navigateByUrl('/login')
      return
    }
    if (!this.auth.esAdministrador()) {
      this.route.navigateByUrl('/categorias')
      return
    }

    this.rutaActiva.paramMap.subscribe((parametro)=>{
      this.idVendedor=Number(parametro.get('idVendedor'))
    })

    this.buscarPorMes(this.mesesElegidos)
  }

  buscarPorMes(meses:number){
    if (!Number.isInteger(meses) || meses < 1 || meses > 120) {
      this.mensajeError = 'Elegí una cantidad de meses entre 1 y 120.'
      return
    }
    this.mensajeError = ''
    this.mesesElegidos = meses
    this.anioActual=9999
    this.servicePrendavendida.verTotalPorMes(meses).subscribe({
      next:(dato)=>{
        this.listaTotales=dato;
      }
    })
  }

  cambioarAnioActual(anio:number){
    this.anioActual=anio
  }

  private mostrarError(err: HttpErrorResponse, mensajePorDefecto: string) {
  if (err.status === 403) {
    this.mensajeError = 'No tenés permiso para hacer esto.'
  } else if (err.status === 0) {
    this.mensajeError = 'No se pudo conectar con el servidor.'
  } else {
    this.mensajeError = mensajePorDefecto
  }
}
}
