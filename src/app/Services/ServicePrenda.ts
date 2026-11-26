import { HttpClient } from "@angular/common/http";
import { Injectable,inject } from "@angular/core";
import { Prenda } from "../Models/Prenda";
import { PrendaDTO } from "../Models/PrendaDTO";
import { Etiqueta } from "../Models/Etiqueta";
import { PrendaVendida } from "../Models/PrendaVendida";

@Injectable({
    providedIn:"root"
})

export class ServicePrenda{
    private readonly http= inject(HttpClient)
    private readonly apiURL=`http://localhost:8080/Prendas`

    obtenerDeSubCategoria(id:number){
        return this.http.get<Prenda[]>(`${this.apiURL}/ObtenerPrendas/${encodeURIComponent(id)}`)
    }

    obtenerPrenda(id:number){
        return this.http.get<Prenda>(`${this.apiURL}/ObtenerPrendaEspecifica/${encodeURIComponent(id)}`)
    }

    venderPrenda(prenda:Prenda,idVendedor:number,nombreCliente:string){
        return this.http.post<PrendaVendida>(`${this.apiURL}/VenderPrenda/${encodeURIComponent(prenda.id)}/${encodeURIComponent(idVendedor)}/${encodeURIComponent(nombreCliente)}/${encodeURIComponent(prenda.version)}`,null)
    }

    modificarPrenda(id:number,dto:PrendaDTO){
        return this.http.put<Prenda>(`${this.apiURL}/ModificarPrenda/${encodeURIComponent(id)}`,dto)
    }

    eliminarPrenda(id:number){
        return this.http.delete<string>(`${this.apiURL}/EliminarPrenda/${encodeURIComponent(id)}`)
    }

    obtenerMenorAlPrecio(precio:number){
        return this.http.get<Prenda[]>(`${this.apiURL}/ObtenerPorPrecio/${encodeURIComponent(precio)}`)
    }

    prendasActivasSubCategoria(id:number){
        return this.http.get<Prenda[]>(`${this.apiURL}/PrendasActivas/${encodeURIComponent(id)}`)
    }

    prendasInactivasSubCategoria(id:number){
        return this.http.get<Prenda[]>(`${this.apiURL}/PrendasDesactivadas/${encodeURIComponent(id)}`)
    }

    obtenerPorEtiqueta(id:number){
        return this.http.get<Prenda[]>(`${this.apiURL}/ObtenerPorEtiqueta/${encodeURIComponent(id)}`)
    }

    obtenerPorNombreDeEtiqueta(nombre:string){
        return this.http.get<Prenda[]>(`${this.apiURL}/ObtenerPorNombreEtiqueta/${encodeURIComponent(nombre)}`)
    }

    agregarEtiquetas(prenda:Prenda,lista:number[]){
        return this.http.put<Prenda>(`${this.apiURL}/AgregarEtiquetas/${encodeURIComponent(prenda.id)}/${encodeURIComponent(prenda.version)}`,lista)
    }

    obtenerVentasDePrenda(id:number){
        return this.http.get<PrendaVendida[]>(`${this.apiURL}/ObtenerVentas/${encodeURIComponent(id)}`)
    }

    buscarPorNombre(nombre:string){
        return this.http.get<Prenda[]>(`${this.apiURL}/BuscarPorNombre/${encodeURIComponent(nombre)}`)
    }

    quitarEtiqueta(prenda: Prenda, idEtiqueta: number) {
        return this.http.put<Prenda>(
            `${this.apiURL}/QuitarEtiqueta/${encodeURIComponent(prenda.id)}/${encodeURIComponent(idEtiqueta)}/${encodeURIComponent(prenda.version)}`,
            null
        )
    }
}