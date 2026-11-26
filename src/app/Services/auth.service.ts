import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
 
// Ajustá las rutas según donde tengas la carpeta de modelos
import { LoginRequest,LoginResponse,VerificarTokenResponse } from '../Models/Auth';
import { TipoVendedor } from '../Models/TipoVendedor';
 
// Datos que el back guarda dentro del token (JWTServices.generarToken)
interface TokenPayload {
  sub: string;               // email del vendedor
  tipoVendedor: TipoVendedor;
  iat: number;               // emisión, en segundos
  exp: number;               // vencimiento, en segundos
}
 
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
 
  private readonly apiUrl = 'http://localhost:8080/auth';
  private readonly TOKEN_KEY = 'token';
 
  /** POST /auth/login. Si sale bien, guarda el token. */
  login(credenciales: LoginRequest): Observable<LoginResponse> {
    this.logout()
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credenciales)
      .pipe(tap((resp) => localStorage.setItem(this.TOKEN_KEY, resp.token)));
  }
 
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
 
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
 
  /** true si hay token y todavía no venció (dura 1 hora). */
  isLoggedIn(): boolean {
    const payload = this.getPayload();
    if (!payload) return false;
 
    const vencido = payload.exp * 1000 <= Date.now();
    if (vencido) this.logout();
    return !vencido;
  }
 
  getEmail(): string | null {
    return this.getPayload()?.sub ?? null;
  }
 
  getTipoVendedor(): TipoVendedor | null {
    return this.getPayload()?.tipoVendedor ?? null;
  }
 
  esAdministrador(): boolean {
    return this.getTipoVendedor() === 'ADMINISTRADOR';
  }
 
  /** GET /auth/verificarToken: consulta al back si el token sigue siendo válido. */
  verificarToken(): Observable<VerificarTokenResponse> {
    return this.http.get<VerificarTokenResponse>(`${this.apiUrl}/verificarToken`);
  }
 
  /** Lee el contenido del token sin validarlo (la validación real la hace el back). */
  private getPayload(): TokenPayload | null {
    const token = this.getToken();
    if (!token) return null;
 
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64)) as TokenPayload;
    } catch {
      return null;
    }
  }
}