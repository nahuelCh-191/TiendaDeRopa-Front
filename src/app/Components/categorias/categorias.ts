import { Component,inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule,Validators } from '@angular/forms';
import { Categoria } from '../../Models/Categoria';
import { Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { ServiceCategoria } from '../../Services/ServiceCategoria';
import { ServiceSubCategoria } from '../../Services/ServiceSubCategoria';
import { SubCategoria } from '../../Models/SubCategoria';
import { RenombrarDTO } from '../../Models/Renombrar';
import { AuthService } from '../../Services/auth.service';


@Component({
  selector: 'app-categorias',
  imports: [ReactiveFormsModule],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css',
})
export class Categorias implements OnInit {
  private readonly routes=inject(Router)
  private readonly categorias=inject(ServiceCategoria)
  private readonly subcategorias=inject(ServiceSubCategoria)
  private readonly auth=inject(AuthService)
  private readonly form=inject(FormBuilder)
  
  ListaCategoria:Categoria[]=[]
  ListaSubcategorias:SubCategoria[]=[]
  categoriaAbierta: number | null = null;
  estadoSubcategorias: 'cargando' | 'listo' | 'error' = 'listo';
  categoriaRenombrando: number | null = null;
  isAdmin=false


  ngOnInit(): void {
    if (!this.auth.getEmail()) {
      this.routes.navigateByUrl('/login'); // no hay sesión
      return;
    }

    this.isAdmin=this.auth.esAdministrador()

    this.cargarCategorias();
  }

  alternarCategoria(id: number) {
    if (this.categoriaAbierta === id) {
      this.categoriaAbierta = null;   // clic en la abierta: se cierra
      return;
    }
    this.categoriaAbierta = id;
    this.ListaSubcategorias = [];
    this.cargarSubcategorias(id);
  }

  cargarSubcategorias(id: number) {
    this.estadoSubcategorias = 'cargando';
    this.subcategorias.obtenerPorCategoria(id).subscribe({
      next: (dato) => {
        if (this.categoriaAbierta !== id) return;   // el usuario ya abrió otra
        this.ListaSubcategorias = dato;
        this.estadoSubcategorias = 'listo';
      },
      error: (err) => {
        console.log(err);
        if (this.categoriaAbierta === id) this.estadoSubcategorias = 'error';
      },
    });
  }

  cambiarNombreCategoria(nombre: string, id: number, ver: number) {
    const dto: RenombrarDTO = { nombre, version: ver };
    this.categorias.cambiarNombreCategoria(id, dto).subscribe({
      next: () => this.cargarCategorias(),
      error: (err) => console.log(err),
    });
  }

  seleccionarSubCategoria(id:number){
    this.routes.navigateByUrl(`/subCategoria/${id}`)
  }

  agregarSubCategoria(id:number,nuevaSubCategoria:string){
    this.categorias.agregarSubcategoria(nuevaSubCategoria,id).subscribe({
      next:(dato)=>{
        this.cargarSubcategorias(id);
      },
      error:(err)=>{
        console.log(err)
      }
    })
  }

  cargarCategorias(){
    this.ListaCategoria=[]
    this.categorias.obtenerTodas().subscribe({
      next:(dato)=>{
        this.ListaCategoria=dato;
      },
      error:(err)=> {
        console.log(err)
      }
    })
  }

  agregarCategoria(nombre: string) {
    this.categorias.agregarCategoria(nombre).subscribe({
      next: () => this.cargarCategorias(),
      error: (err) => console.log(err),
    });
  }

  eliminarCategoria(id: number) {
    if (!confirm('¿Eliminar esta categoría? Se eliminarán también sus subcategorías y prendas (si alguna tiene ventas, no se podrá).')) return;
    this.categorias.eliminarcategoria(id).subscribe({
      next: () => this.cargarCategorias(),
      error: (err) => console.log(err),
    });
  }

  formNuevaCategoria = this.form.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
  });

  formNuevaSubcategoria = this.form.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
  });

  formRenombrar = this.form.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
  });

  crearCategoria(): void {
    if (this.formNuevaCategoria.invalid) {
      this.formNuevaCategoria.markAllAsTouched();
      return;
    }

    const nombre = this.formNuevaCategoria.getRawValue().nombre.trim();
      if (!nombre) return;

      this.agregarCategoria(nombre);
      this.formNuevaCategoria.reset({ nombre: '' });
  }

  crearSubcategoria(id: number): void {
    if (this.formNuevaSubcategoria.invalid) {
      this.formNuevaSubcategoria.markAllAsTouched();
      return;
    }

    const nombre = this.formNuevaSubcategoria.getRawValue().nombre.trim();
    if (!nombre) return;

    this.agregarSubCategoria(id, nombre);
    this.formNuevaSubcategoria.reset({ nombre: '' });
  }

  iniciarRenombrado(cat: Categoria): void {
    this.categoriaRenombrando = cat.id;
    this.formRenombrar.setValue({
      nombre: cat.nombreCategoria,
    });
  }

  cancelarRenombrado(): void {
    this.categoriaRenombrando = null;
    this.formRenombrar.reset({ nombre: '' });
  }

  guardarNombreCategoria(cat: Categoria): void {
    if (this.formRenombrar.invalid) {
      this.formRenombrar.markAllAsTouched();
      return;
    }

    const nombre = this.formRenombrar.getRawValue().nombre.trim();
    if (!nombre) return;

    this.cambiarNombreCategoria(nombre, cat.id, cat.version);
    this.cancelarRenombrado();
  }

}
