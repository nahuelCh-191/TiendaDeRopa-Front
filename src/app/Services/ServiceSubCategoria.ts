import { HttpClient } from "@angular/common/http";
import { inject,Injectable } from "@angular/core";
import { SubCategoria } from "../Models/SubCategoria";
import { PrendaDTO } from "../Models/PrendaDTO";
import { RenombrarDTO } from "../Models/Renombrar";
import { Etiqueta } from "../Models/Etiqueta";
 

@Injectable({
    providedIn:"root"
})

export class ServiceSubCategoria{
    private readonly http=inject(HttpClient)
    private readonly apiURL='http://localhost:8080/SubCategoria'

    agregarPrenda(id:number,dto:PrendaDTO){
        return this.http.post<void>(`${this.apiURL}/AgregarPrenda/${encodeURIComponent(id)}`,dto)
    }

    obtenerPorCategoria(id:number){
        return this.http.get<SubCategoria[]>(`${this.apiURL}/ObtenerPorIDCategoria/${encodeURIComponent(id)}`)
    }

    eliminarSubCategoria(id:number){
        return this.http.delete<void>(`${this.apiURL}/EliminarSubCategoria/${encodeURIComponent(id)}`)
    }

    modificarSubCategoria(id:number,dto:RenombrarDTO){
        return this.http.put<SubCategoria>(`${this.apiURL}/ModificarSubCategoria/${encodeURIComponent(id)}`,dto)
    }

    obtenerSubCategoria(id:number){
        return this.http.get<SubCategoria>(`${this.apiURL}/ObtenerSubCategoria/${encodeURIComponent(id)}`)
    }

    agregarEtiquetas(id:number,lista:number[],vercionSubCategoria:number){
        return this.http.post<SubCategoria>(`${this.apiURL}/AgregarEtiquetas/${encodeURIComponent(id)}/${encodeURIComponent(vercionSubCategoria)}`,lista)
    }

    obtenerEtiquetasPermitidas(id:number){
        return this.http.get<Etiqueta[]>(`${this.apiURL}/ObtenerEtiquetasPermitidas/${encodeURIComponent(id)}`)
    }

    quitarEtiqueta(idSubCategoria:number,idEtiqueta:number,ver:number){
        return this.http.put<SubCategoria>(`${this.apiURL}/QuitarEtiqueta/${encodeURIComponent(idSubCategoria)}/${encodeURIComponent(idEtiqueta)}/${encodeURIComponent(ver)}`,null)      
    }
}