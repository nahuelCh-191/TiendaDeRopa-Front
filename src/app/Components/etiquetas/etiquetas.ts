import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceEtiqueta } from '../../Services/ServiceEtiqueta';
import { Etiqueta } from '../../Models/Etiqueta';
import { FormBuilder, Validator, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RenombrarDTO } from '../../Models/Renombrar';

@Component({
  selector: 'app-etiquetas',
  imports: [ReactiveFormsModule,FormsModule],
  templateUrl: './etiquetas.html',
  styleUrl: './etiquetas.css',
})
export class Etiquetas implements OnInit {
  private readonly auth=inject(AuthService)
  private readonly ruta=inject(Router)
  private readonly fb=inject(FormBuilder)
  private readonly serviceEtiqueta=inject(ServiceEtiqueta)

  errorMensaje=""
  textoBusqueda=""
  etiquetas:Etiqueta[]=[]
  etiquetasFiltradas:Etiqueta[]=[]
  filtrado=false
  
  id=0

  renombrarDTO : RenombrarDTO = {
    nombre: "",
    version: 0
  }

  renombrarFormulario=this.fb.nonNullable.group({
    nombre: ["",[Validators.maxLength(100),Validators.required]],
    version: [0]
  })

  ngOnInit(): void {
    this.renombrarFormulario.reset()

    if (!this.auth.getEmail()) {
      this.ruta.navigateByUrl('/login')
      return
    }

    if (!this.auth.esAdministrador()) {
      this.ruta.navigateByUrl('/categorias')
      return
    }

    this.cargarEtiquetas()
  }

  seleccionarEtiqueta(e: Etiqueta) {
    this.id = e.id
    this.renombrarFormulario.reset({ nombre: e.nombreEtiqueta, version: e.version })
  }

  cancelarEdicion() {
    this.id = 0
    this.renombrarFormulario.reset()
  }

  cargarEtiquetas(){
    this.serviceEtiqueta.obtenerTodos().subscribe({
      next:(dato)=>{
        this.etiquetas=dato
      },
      error:(err)=>{
        this.mostrarError(err,"No se pudieron cargar las etiquetas")
      }
    })
  }

  modificarEtiqueta(){
    if (this.id === 0) return

    if (this.renombrarFormulario.invalid) {
      this.renombrarFormulario.markAllAsTouched()
      return
    }

    this.renombrarDTO = this.renombrarFormulario.getRawValue()

    this.errorMensaje = ''
    this.serviceEtiqueta.modificarEtiqueta(this.id,this.renombrarDTO).subscribe({
      next:()=>{
        this.cargarEtiquetas()
        this.cancelarEdicion()
      },
      error:(err)=>{
        this.mostrarError(err,"No se pudo modificar la etiqueta")
      }
    })
  }

  agregarEtiqueta(nombre:string){
    const limpio = nombre.trim()
    if (!limpio) {
      this.errorMensaje = 'Ingresá un nombre para la etiqueta.'
      return
    }
    this.errorMensaje = ''
    this.serviceEtiqueta.agregarEtiqueta(limpio).subscribe({
      next:()=>{
        this.cargarEtiquetas()
      },
      error:(err)=>{
        this.mostrarError(err,"Error al guardar una nueva etiqueta")
      }
    })
  }

  eliminarEtiqueta(id: number) {
    if (!confirm('¿Eliminar esta etiqueta?')) return
    this.errorMensaje = ''
    this.serviceEtiqueta.eliminarEtiqueta(id).subscribe({
      next: () => {
        if (this.id === id) this.cancelarEdicion()   // NUEVO: si se estaba editando, se sale
        this.cargarEtiquetas()
      },
      error: (err) => this.mostrarError(err, 'No se pudo eliminar la etiqueta. Puede estar en uso.'),
    })
  }

  filtrarPorNombre(){
    this.filtrado=true
    this.etiquetasFiltradas=this.etiquetas.filter(item=>item.nombreEtiqueta.toLowerCase().startsWith(this.textoBusqueda.toLocaleLowerCase()))
  }

  dejarFiltrar(){
    this.filtrado=false
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
