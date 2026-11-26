import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Vendedor } from "../Models/Vendedor";
import { VendedorDTO } from "../Models/VendedorDTO";

@Injectable({
    providedIn:"root"
})

export class ServiceVendedor{
    private readonly http=inject(HttpClient)
    private readonly apiURL=`http://localhost:8080/Vendedor`

    obtenerVendedor(id:number){
        return this.http.get<Vendedor>(`${this.apiURL}/ObtenerVendedor/${encodeURIComponent(id)}`)
    }

    eliminarVendedor(id:number){
        return this.http.delete(`${this.apiURL}/EliminarVendedor/${encodeURIComponent(id)}`,{ responseType: 'text' })
    }

    agregarVendedor(dto:VendedorDTO){
        return this.http.post<void>(`${this.apiURL}/AgregarVendedor`,dto)
    }

    obtenerTodos(){
        return this.http.get<Vendedor[]>(`${this.apiURL}/ObtenerTodos`)
    }

    modificarVendedor(id:number,dto:VendedorDTO){
        return this.http.put<Vendedor>(`${this.apiURL}/ModificarVendedor/${encodeURIComponent(id)}`,dto)
    }

    obtenerPorEmail(email:string){
        return this.http.get<Vendedor>(`${this.apiURL}/ObtenerPorEmail/${email}`)
    }
}