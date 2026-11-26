import { Component,inject } from '@angular/core';
import { ServicePrendavendida } from '../../Services/ServicePrendaVendida';
import { ActivatedRoute, Router } from '@angular/router';
import { PrendaVendida } from '../../Models/PrendaVendida';
import { AuthService } from '../../Services/auth.service';
import { OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-venta',
  imports: [],
  templateUrl: './venta.html',
  styleUrl: './venta.css',
})
export class Venta implements OnInit {
  private readonly auth=inject(AuthService)
  private readonly route=inject(Router)
  private readonly rutaActiva=inject(ActivatedRoute)
  private readonly servicePrendavendida=inject(ServicePrendavendida)

  id=0
  idVendedor=0
  errorMensaje=""
  prendaVendida:PrendaVendida|null=null

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
      this.id=Number(parametro.get('id'))
      this.idVendedor=Number(parametro.get('idVendedor'))

      this.errorMensaje=""
      this.prendaVendida=null
      // NUEVO: con un id que no es número, el pedido saldría a /ObtenerPrendaEspecifica/NaN
      if (Number.isNaN(this.id)) {
        this.errorMensaje="Venta inválida"
        return
      }
      
      this.obtenerPrendaVendida()
    })
  }

  obtenerPrendaVendida(){
    this.servicePrendavendida.obtenerPrendaVendida(this.id).subscribe({
      next:(dato)=>{
        this.prendaVendida=dato
      },
      error:(err)=>{
        this.mostrarError(err,"No se pudo cargar la venta")
      }
    })
  }

  eliminarPrenda(){
    if (!confirm('¿Eliminar esta venta? Esta acción no se puede deshacer.')) return
    this.servicePrendavendida.eliminarPrenda(this.id).subscribe({
      next:()=>{
        this.volver()
      },
      error:(err)=>{
        this.mostrarError(err,"No se pudo eliminar la venta")
      }
    })
  }

  volver(){
    this.route.navigateByUrl(this.idVendedor ? `/vendedorEspecifico/${this.idVendedor}` : '/vendedores')
  }

  private mostrarError(err: HttpErrorResponse, mensajePorDefecto: string) {
    if (err.status === 409) {
      this.errorMensaje = 'Otro usuario modificó esto mientras lo editabas. Recargá e intentá de nuevo.';
    } else if (err.status === 403) {
      this.errorMensaje = 'No tenés permiso para hacer esto.';
    } else if (err.status === 0) {
      this.errorMensaje = 'No se pudo conectar con el servidor.';
    } else {
      this.errorMensaje = mensajePorDefecto;
    }
  }
}
