import { HttpClient } from "@angular/common/http";
import { Injectable,inject } from "@angular/core";
import { Etiqueta } from "../Models/Etiqueta";
import { RenombrarDTO } from "../Models/Renombrar";

@Injectable({
    providedIn:"root"
})

export class ServiceEtiqueta{
    private readonly http=inject(HttpClient)
    private readonly apiUrl=`http://localhost:8080/Etiquetas`

    agregarEtiqueta(nombre:string){
        return this.http.post<void>(`${this.apiUrl}/AgregarEtiqueta/${encodeURIComponent(nombre)}`,null)
    }

    modificarEtiqueta(id:number,dto:RenombrarDTO){
        return this.http.put<Etiqueta>(`${this.apiUrl}/ModificarEtiqueta/${encodeURIComponent(id)}`,dto)
    }

    eliminarEtiqueta(id:number){
        return this.http.delete<void>(`${this.apiUrl}/EliminarEtiqueta/${encodeURIComponent(id)}`)
    }

    obtenerTodos(){
        return this.http.get<Etiqueta[]>(`${this.apiUrl}/ObtenerTodas`)
    }
}