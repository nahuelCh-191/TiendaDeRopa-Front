import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Categoria } from "../Models/Categoria";
import { SubCategoria } from "../Models/SubCategoria";
import { RenombrarDTO } from "../Models/Renombrar";

@Injectable({
    providedIn:"root"
})

export class ServiceCategoria{
    private readonly http=inject(HttpClient);
    private readonly apiUrl= 'http://localhost:8080/Categoria';

    agregarCategoria(nombre:string){
        return this.http.post<void>(`${this.apiUrl}/AgregarCategoria/${encodeURIComponent(nombre)}`,null);
    }

    agregarSubcategoria(nombreSub:string,id:number){
        return this.http.post<void>(`${this.apiUrl}/AgregarSubCategoria/${encodeURIComponent(id)}/${encodeURIComponent(nombreSub)}`,null);
    }

    eliminarcategoria(id:number){
        return this.http.delete<void>(`${this.apiUrl}/EliminarCategoria/${encodeURIComponent(id)}`)
    }

    obtenerTodas(){
        return this.http.get<Categoria[]>(`${this.apiUrl}/ObtenerTodas`)
    }

    obtenerCategoria(id:number){
        return this.http.get<Categoria>(`${this.apiUrl}/ObtenerCategoria/${encodeURIComponent(id)}`)
    }

    cambiarNombreCategoria(id:number,body:RenombrarDTO){
        return this.http.put<void>(`${this.apiUrl}/CambiarNombreCategoria/${encodeURIComponent(id)}`,body)
    }
}