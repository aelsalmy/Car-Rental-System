import { Component , signal} from '@angular/core';
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input' 
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { FormsModule } from '@angular/forms';
import { LoginService } from '../services/login.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatCardModule , MatFormFieldModule , FormsModule , MatInputModule , MatButtonModule , MatIconModule , CommonModule],
  providers: [LoginService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {

    hide = signal(true)
    username: string = ''
    password: string = ''
    errorFound = signal(false)
    errorMessage: string = ''

    constructor(private loginService: LoginService){ }

    switchVisibility(event: MouseEvent){
        this.hide.set(!this.hide());
        event.stopPropagation();
    }

    onLogin(): void{
        if(this.username == '' || this.password == ''){
          this.errorMessage = "Please enter Both Username and Password"
          this.errorFound.set(true)
          return
        }
        this.loginService.login(this.username , this.password).subscribe({
          next: (response) => {
            console.log(response)
            alert('User Logged in Successfully')
            this.errorFound.set(false)
            this.username = ''
            this.password = ''
          },
          error: (error) => {
             console.log('Error Found: ', error.status , error.error)
             this.errorMessage = "Invalid Credentials"
             this.errorFound.set(true)
             this.username = ''
             this.password = ''
          }
        })
    }

}