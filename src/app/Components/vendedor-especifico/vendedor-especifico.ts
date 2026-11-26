import { Component, inject } from '@angular/core';
import { ServicePrendavendida } from '../../Services/ServicePrendaVendida';
import { PrendaVendida } from '../../Models/PrendaVendida';
import { AuthService } from '../../Services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ServiceVendedor } from '../../Services/ServiceVendedor';
import { Vendedor } from '../../Models/Vendedor';

@Component({
  selector: 'app-vendedor-especifico',
  imports: [],
  templateUrl: './vendedor-especifico.html',
  styleUrl: './vendedor-especifico.css',
})
export class VendedorEspecifico implements OnInit {
  private readonly auth=inject(AuthService)
  private readonly rout=inject(Router)
  private readonly rutaActiva=inject(ActivatedRoute)
  private readonly servicePrendaVendida=inject(ServicePrendavendida)
  private readonly servicevendedor=inject(ServiceVendedor)

  id:number|null=0
  errorInfo=""
  errorMensaje=""

  totalRecaudadoVendedorHoy=0
  totalRecaudadoVendedorMes=0
  totalRecaudadoVendedorMesPasado=0

  prendaHoyVendedor:PrendaVendida[]=[]
  prendaMesPasadoVendedor:PrendaVendida[]=[]
  prendaMesVendedor:PrendaVendida[]=[]

  vendedor:Vendedor|null=null
  periodo: 'hoy' | 'mes' | 'mesPasado' = 'hoy';


  ngOnInit(): void {
    if(!this.auth.getEmail()){
      this.rout.navigateByUrl('/login')
      return;
    }

    if(!this.auth.esAdministrador()){
      this.rout.navigateByUrl('/login')
      return;
    }

    this.rutaActiva.paramMap.subscribe((params)=>{
      this.id=Number(params.get('id'))
      this.errorMensaje = ''
      if (Number.isNaN(this.id)) {
        this.errorMensaje = 'Vendedor inválido'
        return
      }
      this.obtenerVendedor()
      this.prendaHoy()
      this.prendaEsteMes()
      this.prendaMesPasado()
      this.totalHoyVendedor()
      this.totalEsteMesVendedor()
      this.totalMespasadoVendedor()
    })
  }

  prendaHoy(){
    this.errorInfo=""
    this.servicePrendaVendida.prendasHoyVendedor(Number(this.id)).subscribe({
      next:(dato)=>{
        this.prendaHoyVendedor = this.masRecientesPrimero(dato)
      },
      error:(err)=>{
        this.mostrarError(err,"No se pudo cargar las prendas vendidas de hoy")
      }
    })
  }

  prendaEsteMes(){
    this.errorInfo=""
    this.servicePrendaVendida.prendasEsteMesVendedor(Number(this.id)).subscribe({
      next:(dato)=>{
        this.prendaMesVendedor=this.masRecientesPrimero(dato)
      },
      error:(err)=>{
        this.mostrarError(err,"No se pudo cargar las prendas vendidas de este Mes")
      }
    })
  }

  prendaMesPasado(){
    this.errorInfo=""
    this.servicePrendaVendida.prendasVendedorMesPasado(Number(this.id)).subscribe({
      next:(dato)=>{
        this.prendaMesPasadoVendedor=this.masRecientesPrimero(dato)
      },
      error:(err)=>{
        this.mostrarError(err,"No se pudo cargar las prendas vendidas del Mes Pasado")
      }
    })
  }

  totalHoyVendedor(){
    this.errorInfo=""
    this.servicePrendaVendida.totalRecaudadoVendedorHoy(Number(this.id)).subscribe({
      next:(dato)=>{
        this.totalRecaudadoVendedorHoy=dato
      },
      error:(err)=>{
        this.mostrarError(err,"No se pudo cargar el total recaudado hoy del vendedor")
      }
    })
  }

  totalEsteMesVendedor(){
    this.errorInfo=""
    this.servicePrendaVendida.totalRecaudadoVendedorEsteMes(Number(this.id)).subscribe({
      next:(dato)=>{
        this.totalRecaudadoVendedorMes=dato
      },
      error:(err)=>{
        this.mostrarError(err,"No se pudo cargar el total recaudado este Mes del vendedor")
      }
    })
  }

  totalMespasadoVendedor(){
    this.errorInfo=""
    this.servicePrendaVendida.totalRecaudadoVendedorMesPasado(Number(this.id)).subscribe({
      next:(dato)=>{
        this.totalRecaudadoVendedorMesPasado=dato
      },
      error:(err)=>{
        this.mostrarError(err,"No se pudo cargar el total recaudado del mes pasado de este vendedor")
      }
    })
  }

  obtenerVendedor(){
    this.servicevendedor.obtenerVendedor(Number(this.id)).subscribe({
      next:(dato)=>{
        this.vendedor=dato
      },
      error:(err)=>{
        this.mostrarError(err,"No se encontro al vendedor relacionado")
      }
    })
  }

  get variacionMes(): number | null {
    if (this.totalRecaudadoVendedorMesPasado === 0) return null
    return ((this.totalRecaudadoVendedorMes - this.totalRecaudadoVendedorMesPasado) / this.totalRecaudadoVendedorMesPasado) * 100
  }

  get ventasDelPeriodo(): PrendaVendida[] {
    if (this.periodo === 'hoy') return this.prendaHoyVendedor;
    if (this.periodo === 'mesPasado') return this.prendaMesPasadoVendedor;
    return this.prendaMesVendedor;
  }

  get totalDelPeriodo(): number {
    if (this.periodo === 'hoy') return this.totalRecaudadoVendedorHoy
    if (this.periodo === 'mesPasado') return this.totalRecaudadoVendedorMesPasado
    return this.totalRecaudadoVendedorMes
  }

  private masRecientesPrimero(ventas: PrendaVendida[]): PrendaVendida[] {
    return [...ventas].sort((a, b) => b.id - a.id)
  }

  seleccionarPrenda(id: number) {
    this.rout.navigateByUrl(`/venta/${id}/${this.id}`)
  }

  volver() {
    this.rout.navigateByUrl('/vendedores')
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
