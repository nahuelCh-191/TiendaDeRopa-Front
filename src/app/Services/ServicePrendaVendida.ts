import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable,inject } from "@angular/core";
import { PrendaVendida } from "../Models/PrendaVendida";
import { TotalMensual } from "../Models/TotalMensual";

@Injectable({
    providedIn:"root"
})

export class ServicePrendavendida{
    private readonly http=inject(HttpClient)
    private readonly apiURL=`http://localhost:8080/PrendaVendida`

    obtenerPrendaVendida(id:number){
        return this.http.get<PrendaVendida>(`${this.apiURL}/PrendaEspecifica/${encodeURIComponent(id)}`)
    }

    prendasVendedorMesPasado(id:number){
        return this.http.get<PrendaVendida[]>(`${this.apiURL}/VendedorMesPasado/${encodeURIComponent(id)}`)
    }

    prendasEsteMesVendedor(id:number){
        return this.http.get<PrendaVendida[]>(`${this.apiURL}/VendedorEsteMes/${encodeURIComponent(id)}`)
    }

    prendasHoyVendedor(id:number){
        return this.http.get<PrendaVendida[]>(`${this.apiURL}/VendedorHoy/${encodeURIComponent(id)}`)
    }

    totalRecaudadoVendedorMesPasado(id:number){
        return this.http.get<number>(`${this.apiURL}/TotalVendedorMesPasado/${encodeURIComponent(id)}`)
    }

    totalRecaudadoVendedorEsteMes(id:number){
        return this.http.get<number>(`${this.apiURL}/TotalVendedorEsteMes/${encodeURIComponent(id)}`)
    }

    totalRecaudadoVendedorHoy(id:number){
        return this.http.get<number>(`${this.apiURL}/TotalVendedorHoy/${encodeURIComponent(id)}`)
    }

    prendasVendidasEsteMes(){
        return this.http.get<PrendaVendida[]>(`${this.apiURL}/VentasDelMes`)
    }

    prendasVendidasMesPasado(){
        return this.http.get<PrendaVendida[]>(`${this.apiURL}/VentasDelMesPasado`)
    }

    prendasVendidasHoy(){
        return this.http.get<PrendaVendida[]>(`${this.apiURL}/VentasDeHoy`)
    }

    montoTotalVentasEsteMes(){
        return this.http.get<number>(`${this.apiURL}/TotalDeVentasDelMes`)
    }

    montoTotalVentasMesPasado(){
        return this.http.get<number>(`${this.apiURL}/TotalDeVentasDelMesPasado`)
    }

    montoTotalVentasHoy(){
        return this.http.get<number>(`${this.apiURL}/TotalDeVentasDeHoy`)
    }

    eliminarPrenda(id:number){
        return this.http.delete<void>(`${this.apiURL}/EliminarPrendaVendida/${encodeURIComponent(id)}`)
    }

    ventasVendedorEnRango(idVendedor: number, desde: string, hasta: string) {
        const params = new HttpParams().set('desde', desde).set('hasta', hasta);
        return this.http.get<PrendaVendida[]>(`${this.apiURL}/ObtenerVentasVendedorEnRango/${idVendedor}`,{ params });
    }

    ventasEnRango(desde: string, hasta: string) {
        const params = new HttpParams().set('desde', desde).set('hasta', hasta);
        return this.http.get<PrendaVendida[]>(`${this.apiURL}/ObtenerVentasEnRango`,{ params });
    }

    verTotalPorMes(cantidadMeses:number){
        return this.http.get<TotalMensual[]>(`${this.apiURL}/TotalesPorMes/${cantidadMeses}`);
    }
}