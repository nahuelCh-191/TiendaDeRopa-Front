import { Component, inject, OnInit } from '@angular/core';
import { SubCategoria } from '../../Models/SubCategoria';
import { Prenda } from '../../Models/Prenda';
import { RenombrarDTO } from '../../Models/Renombrar';
import { PrendaDTO } from '../../Models/PrendaDTO';
import { Router, ActivatedRoute } from '@angular/router';
import { ServiceSubCategoria } from '../../Services/ServiceSubCategoria';
import { ServicePrenda } from '../../Services/ServicePrenda';
import { Etiqueta } from '../../Models/Etiqueta';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../Services/auth.service';
import { FormBuilder,ReactiveFormsModule,Validator, Validators  } from '@angular/forms';
import { ServiceEtiqueta } from '../../Services/ServiceEtiqueta';

@Component({
  selector: 'app-sub-categorias',
  imports: [ReactiveFormsModule],
  templateUrl: './sub-categorias.html',
  styleUrl: './sub-categorias.css',
})

export class SubCategorias implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly serviceSubCategoria = inject(ServiceSubCategoria);
  private readonly servicePrenda = inject(ServicePrenda);
  private readonly auth=inject(AuthService)
  private readonly form=inject(FormBuilder)
  private readonly serviceEtiqueta = inject(ServiceEtiqueta);
 
  id: number = 0;
  subCategoria: SubCategoria | null = null;
  ListaPrendas: Prenda[] = [];
  etiquetasPermitidas: Etiqueta[] = [];
  mensajeError = '';
  esAdmin=false
  etiquetasFiltro: number[] = [];
  todasLasEtiquetas: Etiqueta[] = []; 
  vista: 'activas' | 'inactivas' | 'todas' = 'activas';

  ngOnInit(): void {
    if(!this.auth.getEmail()){
      this.router.navigateByUrl('/login');
      return
    }

    this.esAdmin=this.auth.esAdministrador()
    // paramMap vuelve a emitir si cambia el :id sin destruir el componente,
    // por eso la carga va adentro y no después del subscribe
    this.route.paramMap.subscribe((params) => {
      this.vista = 'activas';
      this.id = Number(params.get('id') ?? 0);
      this.mensajeError = '';
      this.etiquetasFiltro = [];       
      this.formularioPrenda.reset();
      this.cargarSubCategoria();
      this.cargarPrendas();
      this.cargarEtiquetasPermitidas();
      this.cargarTodasLasEtiquetas();
    });
  }
 
  // ---------- Lecturas ----------
 
  private cargarSubCategoria() {
      this.serviceSubCategoria.obtenerSubCategoria(this.id).subscribe({
        next: (dato) => (this.subCategoria = dato),
        error: (err) => this.mostrarError(err, 'No se pudo cargar la subcategoría'),
      });
  }
 
  cargarPrendas() {
    this.servicePrenda.prendasActivasSubCategoria(this.id).subscribe({
      next: (dato) => (this.ListaPrendas = dato),
      error: (err) => this.mostrarError(err, 'No se pudieron cargar las prendas'),
    });
  }

  cargarInactivas(){
    if(this.esAdmin){
      this.servicePrenda.prendasInactivasSubCategoria(this.id).subscribe({
        next: (dato) => (this.ListaPrendas = dato),
        error: (err) => this.mostrarError(err, 'No se pudieron cargar las prendas'),
      })
    }else{
      console.log("no se es admin, no puede acceder a esto")
    }
  }

  cargarTodasPrendas(){
    this.servicePrenda.obtenerDeSubCategoria(this.id).subscribe({
        next: (dato) => (this.ListaPrendas = dato),
        error: (err) => this.mostrarError(err, 'No se pudieron cargar las prendas'),
      })
  }
 
  private cargarEtiquetasPermitidas() {
    this.serviceSubCategoria.obtenerEtiquetasPermitidas(this.id).subscribe({
      next: (dato) => (this.etiquetasPermitidas = dato),
      error: (err) => this.mostrarError(err, 'No se pudieron cargar las etiquetas'),
    });
  }
 
  // ---------- Acciones ----------

  quitarEtiqueta(id:number){
    const ver=this.subCategoria?.version
    if(ver === undefined){
      return
    }
    this.serviceSubCategoria.quitarEtiqueta(this.id,id,ver).subscribe({
      next:(dato)=>{
        this.cargarSubCategoria()
        this.cargarPrendas();
        this.cargarEtiquetasPermitidas();
        this.cargarTodasLasEtiquetas();
      },
      error:(err)=>{
        this.mostrarError(err,"No se pudo eliminar la etiqueta")
      }
    })
  }

  volver() {
    this.router.navigateByUrl('/categorias');
  }
 
  agregarPrenda(dto: PrendaDTO) {
     this.mensajeError = '';
     this.serviceSubCategoria.agregarPrenda(this.id, dto).subscribe({
       next: () => {
         this.vista = 'activas';
         this.formularioPrenda.reset();
         this.cargarPrendas();
       },
       error: (err) => this.mostrarError(err, 'No se pudo agregar la prenda'),
     });
  }
 
  renombrar(dto: RenombrarDTO) {
    this.mensajeError = '';
    this.serviceSubCategoria.modificarSubCategoria(this.id, dto).subscribe({
      // recargo en vez de usar la respuesta: así no depende de lo que devuelva el back
      next: () => this.cargarSubCategoria(),
      error: (err) => this.mostrarError(err, 'No se pudo renombrar la subcategoría'),
    });
  }
 
  agregarEtiquetas(idsEtiquetas: number[]) {
    if (!this.subCategoria) return;
    this.mensajeError = '';
 
    this.serviceSubCategoria
      .agregarEtiquetas(this.id, idsEtiquetas, this.subCategoria.version)
      .subscribe({
        next: () => {
          // recargo las dos: la subcategoría trae la versión nueva para el próximo cambio
          this.cargarSubCategoria();
          this.cargarEtiquetasPermitidas();
        },
        error: (err) => this.mostrarError(err, 'No se pudieron agregar las etiquetas'),
      });
  }
 
  eliminar() {
    const confirmado = confirm(
      '¿Eliminar esta subcategoría? Se eliminarán también sus prendas (si alguna tiene ventas, no se podrá).'
    );
    if (!confirmado) return;
 
    this.mensajeError = '';
    this.serviceSubCategoria.eliminarSubCategoria(this.id).subscribe({
      next: () => this.router.navigateByUrl('/categorias'),
      error: (err) => this.mostrarError(err, 'No se pudo eliminar la subcategoría'),
    });
  }
 
  seleccionarPrenda(id: number) {
    this.router.navigateByUrl(`/prendaEspecifica/${id}`);
  }

  crearPrenda() {
     if (this.formularioPrenda.invalid) {
       this.formularioPrenda.markAllAsTouched();
       return;
     }
     this.agregarPrenda(this.formularioPrenda.getRawValue());
  }

  alternarEtiquetaDePrenda(id: number) {
     const control = this.formularioPrenda.controls.idEtiquetas;
     const actuales = control.value;
     control.setValue(
       actuales.includes(id) ? actuales.filter((e) => e !== id) : [...actuales, id]
     );
  }

  alternarFiltroEtiqueta(id: number) {
     this.etiquetasFiltro = this.etiquetasFiltro.includes(id)
       ? this.etiquetasFiltro.filter((e) => e !== id)
       : [...this.etiquetasFiltro, id];
   }

  get prendasFiltradas(): Prenda[] {
    if (this.etiquetasFiltro.length === 0) return this.ListaPrendas;
    return this.ListaPrendas.filter((p) =>
      this.etiquetasFiltro.every((id) => p.listaEtiquetasPrenda.some((e) => e.id === id))
    );
  }

  get etiquetasDisponibles(): Etiqueta[] {
     return this.todasLasEtiquetas.filter(
       (e) => !this.etiquetasPermitidas.some((p) => p.id === e.id)
     );
  }

  private cargarTodasLasEtiquetas() {
  this.serviceEtiqueta.obtenerTodos().subscribe({   // usá el nombre real del método de tu service
    next: (dato) => (this.todasLasEtiquetas = dato),
    error: (err) => this.mostrarError(err, 'No se pudieron cargar las etiquetas'),
  });
}

  // ---------- Formulario ---------

  formularioPrenda= this.form.nonNullable.group({
    version: [0],
    nombrePrenda: ['', [Validators.required, Validators.maxLength(100)]],
    descripcionPrenda: ['', [Validators.required, Validators.maxLength(100)]],
    precioPrenda: [0, [Validators.required, Validators.min(0)]],
    cantidad: [0, [Validators.required, Validators.min(0)]],
    prendaActiva: [true],
    idEtiquetas: [[] as number[]],
  })
 
  // ---------- Errores ----------
 
  private mostrarError(err: HttpErrorResponse, mensajePorDefecto: string) {
    if (err.status === 409) {
      this.mensajeError = 'Otro usuario modificó esto mientras lo editabas. Recargá e intentá de nuevo.';
    } else if (err.status === 403) {
      this.mensajeError = 'No tenés permiso para hacer esto.';
    } else if (err.status === 0) {
      this.mensajeError = 'No se pudo conectar con el servidor.';
    } else {
      this.mensajeError = mensajePorDefecto;
    }
  }
}
