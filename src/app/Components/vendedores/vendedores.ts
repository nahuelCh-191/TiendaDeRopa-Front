import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceVendedor } from '../../Services/ServiceVendedor';
import { Vendedor } from '../../Models/Vendedor';
import { VendedorDTO } from '../../Models/VendedorDTO';
import { OnInit } from '@angular/core';
import { AuthService } from '../../Services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TipoVendedor } from '../../Models/TipoVendedor';
import { HttpErrorResponse } from '@angular/common/http'

@Component({
  selector: 'app-vendedores',
  imports: [ReactiveFormsModule],
  templateUrl: './vendedores.html',
  styleUrl: './vendedores.css',
})
export class Vendedores implements OnInit  {
  private readonly auth = inject(AuthService)
  private readonly serviceVendedor = inject(ServiceVendedor)
  private readonly fb = inject(FormBuilder)
  private readonly rute= inject(Router)


  mensajeInfo=""
  mensajeError=""
  email=""
  tipoVendedor:TipoVendedor|null = 'EMPLEADO'
  vendedores:Vendedor[]=[]
  vendedor: Vendedores|null= null
  editandoId: number | null = null


  private vendedorDTO:VendedorDTO={
    version: 0,
    tipoVendedor:this.tipoVendedor?? "EMPLEADO", 
    email:"",
    contrasenia:""
  }

  formVemdedor=this.fb.nonNullable.group({
    version: [0],
    tipoVendedor:['EMPLEADO' as TipoVendedor,[Validators.required]],
    email:["",[Validators.required, Validators.maxLength(100)]],
    contrasenia:["",[Validators.required,Validators.maxLength(100)]]
  })

  ngOnInit(): void {
    const email=this.auth.getEmail()
    if(!email){
      this.rute.navigateByUrl('/login'); // no hay sesión
      return;
    }

    this.email=String(email??null)
    this.cargarVendedores()
  }

  cargarVendedores(){
    this.serviceVendedor.obtenerTodos().subscribe({
      next:(dato)=>{
        this.vendedores=dato
      },
      error: (err) => this.mostrarError(err, 'No se pudieron cargar los vendedores'),
    })
  }

  seleccionarVendedor(vend: Vendedor) {
    this.editandoId = vend.id
    this.formVemdedor.reset({
      version: vend.version,
      tipoVendedor: vend.tipoVendedor,
      email: vend.email,
      contrasenia: '',
    })
    this.contraseniaObligatoria(false)
  }

  private contraseniaObligatoria(obligatoria: boolean) {
    const control = this.formVemdedor.controls.contrasenia
    control.setValidators(
      obligatoria
        ? [Validators.required, Validators.maxLength(100)]
        : [Validators.maxLength(100)]
    )
    control.updateValueAndValidity()
  }

  nuevoVendedor() {
    this.editandoId = null
    this.formVemdedor.reset()   // vuelve a los valores iniciales (EMPLEADO, vacío)
    this.contraseniaObligatoria(true)
  }

  rellenarDTO(){
    this.vendedorDTO = this.formVemdedor.getRawValue()
  }

  modificarVendedor(){
    this.serviceVendedor.modificarVendedor(Number(this.editandoId),this.vendedorDTO).subscribe({
      next:(dato)=>{
        this.formVemdedor.reset()
        this.mensajeInfo = 'Vendedor guardado'
        this.nuevoVendedor()        // limpia el formulario Y el editandoId
        this.cargarVendedores()     // refresca la lista
      },
      error: (err) => this.mostrarError(err, 'No se pudo guardar el vendedor. Revisá que el email no esté repetido.'),
    })
  }

  agregarVendedor(){
    this.serviceVendedor.agregarVendedor(this.vendedorDTO).subscribe({
      next:(dato)=>{
        this.formVemdedor.reset()
        this.mensajeInfo = 'Vendedor guardado'
        this.nuevoVendedor()        // limpia el formulario Y el editandoId
        this.cargarVendedores()     // refresca la lista
      },
      error: (err) => this.mostrarError(err, 'No se pudo guardar el vendedor. Revisá que el email no esté repetido.'),
    })
  }

  eliminarVendedor(id: number) {
    this.mensajeError = ''
    this.mensajeInfo = ''
    const vend = this.vendedores.find((v) => v.id === id)
    if (vend?.email === this.email) {
      this.mensajeError = 'No podés eliminar tu propia cuenta.'
      return
    }
    if (!confirm('¿Eliminar este vendedor? Si tiene ventas, se desactiva en lugar de eliminarse.')) return

    this.serviceVendedor.eliminarVendedor(id).subscribe({
      next: (mensaje) => {
        this.mensajeInfo = mensaje
        this.cargarVendedores()
      },
      error: (err) => this.mostrarError(err, 'No se pudo eliminar el vendedor'),
    })
  }

  guardar() {
    this.mensajeError = ''
    this.mensajeInfo = ''
    if (this.formVemdedor.invalid) {
      this.formVemdedor.markAllAsTouched()
      return
    }
    this.rellenarDTO()
    if (this.editandoId === null) this.agregarVendedor()
    else this.modificarVendedor()
  }

  private mostrarError(err: HttpErrorResponse, mensajePorDefecto: string) {
    if (err.status === 409) {
      this.mensajeError = 'Otro usuario modificó esto mientras lo editabas. Recargá e intentá de nuevo.'
    } else if (err.status === 403) {
      this.mensajeError = 'No tenés permiso para hacer esto.'
    } else if (err.status === 0) {
      this.mensajeError = 'No se pudo conectar con el servidor.'
    } else {
      this.mensajeError = mensajePorDefecto
    }
  }

  seleccionarvendedor(id:number){
    this.rute.navigateByUrl(`/vendedorEspecifico/${id}`)
  }
}
