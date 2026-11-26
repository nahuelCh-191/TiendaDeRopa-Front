import { Component,Inject,inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { Router } from '@angular/router';
import { LoginRequest } from '../../Models/Auth'; 

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb=inject(FormBuilder)
  private readonly auth=inject(AuthService)
  private router=inject(Router)
  mensajeError = '';

  private request: LoginRequest ={
      email:"",
      contrasenia: ""
  }

  form=this.fb.nonNullable.group({
    correo:['',[Validators.required]],
    password:['',[Validators.required]]
  })

  Login(){

    if(this.form.invalid){
      alert("Completa los campos necesarios para el formulario")
      return;
    }

    const { correo, password } = this.form.getRawValue();
    this.request.email = correo;
    this.request.contrasenia = password;

    this.mensajeError = '';
    
    this.auth.login(this.request).subscribe({
     next: (resp) => {
  console.log('1. Login exitoso');
  console.log('2. Token recibido:', !!resp.token);

  localStorage.setItem('token', resp.token);

  this.router.navigateByUrl('/categorias').then(
    (resultado) => {
      console.log('3. Resultado de navegación:', resultado);
      console.log('4. URL actual:', this.router.url);
    },
    (error) => {
      console.error('Error al navegar:', error);
    }
  );
},
      error:(err)=>{
        if (err.status === 401) {
          this.mensajeError = 'Email o contraseña incorrectos';
        } else if (err.status === 0) {
          this.mensajeError = 'No se pudo conectar con el servidor';
        } else {
          this.mensajeError = 'Ocurrió un error inesperado, intentá de nuevo';
        }
      }
    })

  }
}
