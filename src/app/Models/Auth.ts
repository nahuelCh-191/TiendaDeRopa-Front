export interface LoginRequest {
  email: string;
  contrasenia: string;
}
 
export interface LoginResponse {
  token: string;
}
 
// GET /auth/verificarToken
export interface VerificarTokenResponse {
  nombre: string; // el email del vendedor autenticado
}