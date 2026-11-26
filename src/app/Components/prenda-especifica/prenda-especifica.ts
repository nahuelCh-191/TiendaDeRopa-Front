import { Component, OnInit, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicePrenda } from '../../Services/ServicePrenda';
import { ServiceSubCategoria } from '../../Services/ServiceSubCategoria';
import { ServiceVendedor } from '../../Services/ServiceVendedor';
import { AuthService } from '../../Services/auth.service';
import { Prenda } from '../../Models/Prenda';
import { PrendaDTO } from '../../Models/PrendaDTO';
import { PrendaVendida } from '../../Models/PrendaVendida';
import { Etiqueta } from '../../Models/Etiqueta';
// BORRADO: Inject, ServicePrendavendida y ServiceEtiqueta. No se usaban: el historial
// de ventas sale de ServicePrenda y las etiquetas permitidas de ServiceSubCategoria.
 
@Component({
  selector: 'app-prenda-especifica',
  imports: [ReactiveFormsModule],
  templateUrl: './prenda-especifica.html',
  styleUrl: './prenda-especifica.css',
})
export class PrendaEspecifica implements OnInit {
  private readonly servicePrenda = inject(ServicePrenda);
  private readonly serviceSubcategoria = inject(ServiceSubCategoria);
  private readonly serviceVendedor = inject(ServiceVendedor);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder); // CAMBIO: antes se llamaba "form" y se confundía con formularioPrenda
  private readonly route = inject(ActivatedRoute);
  private readonly ruta = inject(Router);
 
  isAdmin = false;
  prenda: Prenda | null = null;
  ventas: PrendaVendida[] = [];
  etiquetasPermitidas: Etiqueta[] = [];
 
  // NUEVO: los errores iban solo a la consola. Con esto el HTML puede mostrarlos
  // (por ejemplo el 409 cuando dos personas tocan la misma prenda a la vez).
  mensajeError = '';
  // NUEVO: avisos que no son errores, como "se desactivó en lugar de eliminarse".
  mensajeInfo = '';
 
  // NUEVO: guardo el id de la ruta para que cargarPrenda() se pueda llamar de nuevo
  // (después de vender o modificar) sin abrir otra suscripción a paramMap cada vez.
  private idPrenda = 0;
  private idVendedor = 0;
 
  // CAMBIO: ya no es el "estado" de la pantalla (empezaba con ceros y textos vacíos, y si
  // algo lo mandaba así pisaba la prenda real). Ahora es un borrador que se arma justo
  // antes de cada envío, con cargarDTO() o deFormularioADTO().
  prendaDTO: PrendaDTO = {
    version: 0,
    nombrePrenda: '',
    descripcionPrenda: '',
    precioPrenda: 0,
    cantidad: 0,
    prendaActiva: true,
    idEtiquetas: [],
  };
 
  formularioPrenda = this.fb.nonNullable.group({
    version: [0],
    nombrePrenda: ['', [Validators.required, Validators.maxLength(100)]],
    descripcionPrenda: ['', [Validators.required, Validators.maxLength(100)]],
    precioPrenda: [0, [Validators.required, Validators.min(0)]],
    cantidad: [0, [Validators.required, Validators.min(0)]],
    prendaActiva: [true],
    idEtiquetas: [[] as number[]],
  });
 
  ngOnInit(): void {
    const email = this.auth.getEmail();
 
    if (!email) {
      this.ruta.navigateByUrl('/login'); // no hay sesión
      return;
    }
 
    this.isAdmin = this.auth.esAdministrador();
 
    this.serviceVendedor.obtenerPorEmail(email).subscribe({
      next: (dato) => (this.idVendedor = dato.id),
      // CAMBIO: antes solo console.log; ahora el usuario se entera de que no se podrá vender.
      error: (err) => this.mostrarError(err, 'No se pudo identificar al vendedor'),
    });
 
    // CAMBIO: la suscripción a paramMap se hace UNA sola vez acá. Antes estaba adentro de
    // cargarPrenda(), y cada vez que la llamabas (al vender, al modificar...) se sumaba otra.
    this.route.paramMap.subscribe((params) => {
      this.idPrenda = Number(params.get('id'));
      // Al pasar a otra prenda, se limpia lo de la anterior.
      this.prenda = null;
      this.ventas = [];
      this.etiquetasPermitidas = [];
      this.mensajeError = '';
      this.mensajeInfo = '';
      this.cargarPrenda();
    });
    // BORRADO: la llamada a obtenerHistorialDeVentas() que había acá. Corría antes de que la
    // prenda llegara, con this.prenda en null: Number(undefined) es NaN y pedía /ObtenerVentas/NaN.
  }

  quitarEtiqueta(id:number){
    const prenda=this.prenda
    if (!prenda) return;
    this.servicePrenda.quitarEtiqueta(prenda,id).subscribe({
      next:(dato)=>{
        this.cargarPrenda()
      },
      error:(err)=>{
        this.mostrarError(err,"No se pudo quitar la etiqueta.")
      }
    })
  }
 
  cargarPrenda() {
    this.servicePrenda.obtenerPrenda(this.idPrenda).subscribe({
      next: (dato) => {
        this.prenda = dato;
        // ARREGLO: todo lo que depende de la prenda se pide acá, cuando ya existe.
        this.cargarFormulario(dato);
        this.cargarEtiquetasPermitidas(dato.subCategoria.id);
        // El historial se pide solo para el admin (es lo que muestra la pantalla y lo que
        // usa eliminar() para saber si la prenda tiene ventas).
        if (this.isAdmin) this.obtenerHistorialDeVentas(dato.id);
      },
      error: (err) => this.mostrarError(err, 'No se pudo cargar la prenda'),
    });
  }
 
  // CAMBIO: ahora es el "guardar" del formulario de edición. Antes mandaba prendaDTO
  // tal cual, y nadie lo llenaba con los datos del formulario.
  modificarPrenda() {
    if (this.formularioPrenda.invalid) {
      this.formularioPrenda.markAllAsTouched();
      return;
    }
    this.deFormularioADTO();
    this.enviarModificacion();
  }
 
  // NUEVO: lo comparten modificarPrenda() y sumarCantidadPrendas(); envía el borrador prendaDTO.
  private enviarModificacion() {
    const prenda = this.prenda;
    if (!prenda) return;
 
    this.mensajeError = '';
    this.mensajeInfo = '';
    this.servicePrenda.modificarPrenda(prenda.id, this.prendaDTO).subscribe({
      // Se recarga: la versión cambia con cada modificación, y sin la nueva
      // la siguiente da conflicto.
      next: () => this.cargarPrenda(),
      error: (err) => this.mostrarError(err, 'No se pudo modificar la prenda'),
    });
  }
 
  sumarCantidadPrendas(cantidad: number) {
    const prenda = this.prenda;
    if (!prenda) return;
 
    // NUEVO: el stock no puede quedar negativo (el back también lo rechaza, pero así
    // el usuario ve el motivo).
    if (prenda.cantidad + cantidad < 0) {
      this.mensajeError = 'El stock no puede quedar negativo.';
      return;
    }
 
    // ARREGLO: antes sumaba sobre prendaDTO, que estaba vacío si nadie llamaba a cargarDTO().
    // Ahora el borrador se arma desde la prenda cargada, y se cambia solo la cantidad.
    // (No usa lo que haya a medio escribir en el formulario.)
    this.cargarDTO(prenda);
    this.prendaDTO.cantidad = prenda.cantidad + cantidad;
    this.enviarModificacion();
  }
 
  // ARREGLO: antes el subscribe estaba vacío. No recargaba la prenda (el stock y la versión
  // cambian con cada venta, así que la segunda venta seguida daba conflicto) y no avisaba errores.
  venderPrenda(cliente: string) {
    const prenda = this.prenda;
    if (!prenda) return;
 
    // NUEVO: si la búsqueda del vendedor falló, idVendedor queda en 0 y la venta saldría
    // a nombre de nadie.
    if (this.idVendedor === 0) {
      this.mensajeError = 'No se pudo identificar al vendedor. Volvé a iniciar sesión.';
      return;
    }
    if (!prenda.prendaActiva || prenda.cantidad <= 0) {
      this.mensajeError = 'Esta prenda no está disponible para la venta.';
      return;
    }
    if (!cliente.trim()) {
      this.mensajeError = 'Ingresá el cliente.';
      return;
    }
 
    this.mensajeError = '';
    this.mensajeInfo = '';
    this.servicePrenda.venderPrenda(prenda, this.idVendedor, cliente.trim()).subscribe({
      next: () => this.cargarPrenda(),
      error: (err) => this.mostrarError(err, 'No se pudo registrar la venta'),
    });
  }
 
  // NUEVO: agrega etiquetas a la prenda (las opciones salen de etiquetasDisponibles).
  agregarEtiquetas(ids: number[]) {
    const prenda = this.prenda;
    if (!prenda || ids.length === 0) return;
 
    this.mensajeError = '';
    this.mensajeInfo = '';
    this.servicePrenda.agregarEtiquetas(prenda, ids).subscribe({
      next: () => this.cargarPrenda(),
      error: (err) => this.mostrarError(err, 'No se pudieron agregar las etiquetas'),
    });
  }
 
  // NUEVO: las etiquetas permitidas de la subcategoría que la prenda todavía no tiene.
  get etiquetasDisponibles(): Etiqueta[] {
    const actuales = this.prenda?.listaEtiquetasPrenda ?? [];
    return this.etiquetasPermitidas.filter((e) => !actuales.some((a) => a.id === e.id));
  }
 
  // NUEVO: solo admin (el back lo restringe igual). Si la prenda tiene ventas, el back no la
  // borra: la desactiva. Por eso se mira el historial antes de decidir a dónde ir.
  eliminar() {
    const prenda = this.prenda;
    if (!prenda) return;
 
    const confirmado = confirm(
      '¿Eliminar esta prenda? Si ya tiene ventas, se desactiva en lugar de eliminarse.'
    );
    if (!confirmado) return;
 
    this.mensajeError = '';
    const teniaVentas = this.ventas.length > 0;
 
    // Requiere que ServicePrenda.eliminarPrenda use { responseType: 'text' }: el back
    // devuelve un texto plano y, sin eso, Angular intenta leerlo como JSON y da error.
    this.servicePrenda.eliminarPrenda(prenda.id).subscribe({
      next: (mensaje) => {
        if (teniaVentas) {
          this.mensajeInfo = mensaje; // quedó desactivada: la prenda sigue existiendo
          this.cargarPrenda();
        } else {
          this.irASubCategoria(); // se borró de verdad: no hay nada más que mostrar
        }
      },
      error: (err) => this.mostrarError(err, 'No se pudo eliminar la prenda'),
    });
  }
 
  // NUEVO: volver a la subcategoría de la prenda (para el link de arriba y tras eliminar).
  irASubCategoria() {
    const sub = this.prenda?.subCategoria;
    if (sub) this.ruta.navigateByUrl(`/subCategoria/${sub.id}`);
  }
 
  // CAMBIO: recibe el id en vez de leer this.prenda?.id, que podía ser undefined.
  private obtenerHistorialDeVentas(id: number) {
    this.servicePrenda.obtenerVentasDePrenda(id).subscribe({
      next: (dato) => (this.ventas = dato),
      error: (err) => this.mostrarError(err, 'No se pudo cargar el historial de ventas'),
    });
  }
 
  // CAMBIO: mismo motivo; además nadie la llamaba, así que las opciones nunca se cargaban.
  private cargarEtiquetasPermitidas(idSubCategoria: number) {
    this.serviceSubcategoria.obtenerEtiquetasPermitidas(idSubCategoria).subscribe({
      next: (dato) => (this.etiquetasPermitidas = dato),
      error: (err) => this.mostrarError(err, 'No se pudieron cargar las etiquetas'),
    });
  }
 
  // ---------- Pasos entre la prenda, el borrador (prendaDTO) y el formulario ----------
 
  // ARREGLO: antes asignaba this.prenda?.campo, que puede ser undefined y no entra en un
  // PrendaDTO (error de tipos). Ahora recibe una prenda que seguro existe.
  private cargarDTO(p: Prenda) {
    this.prendaDTO = {
      version: p.version,
      nombrePrenda: p.nombrePrenda,
      descripcionPrenda: p.descripcionPrenda,
      precioPrenda: p.precioPrenda,
      cantidad: p.cantidad,
      prendaActiva: p.prendaActiva,
      idEtiquetas: p.listaEtiquetasPrenda.map((e) => e.id),
    };
  }
 
  // ARREGLO: formularioPrenda.value devuelve una copia nueva en cada lectura, así que
  // asignarle propiedades no cambiaba el formulario y quedaba vacío. patchValue sí lo llena.
  private cargarFormulario(p: Prenda) {
    this.formularioPrenda.patchValue({
      version: p.version,
      nombrePrenda: p.nombrePrenda,
      descripcionPrenda: p.descripcionPrenda,
      precioPrenda: p.precioPrenda,
      cantidad: p.cantidad,
      prendaActiva: p.prendaActiva,
      idEtiquetas: p.listaEtiquetasPrenda.map((e) => e.id),
    });
  }
 
  // CAMBIO: getRawValue() ya trae los tipos correctos (con nonNullable no hay null), así que
  // no hace falta pasar campo por campo con Number() y String().
  private deFormularioADTO() {
    this.prendaDTO = this.formularioPrenda.getRawValue();
  }
 
  // ---------- Errores ----------
 
  // NUEVO: el mismo que en sub-categorias.
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