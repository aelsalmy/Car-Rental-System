import { Component , signal} from '@angular/core';
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input' 
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatCardModule , MatFormFieldModule , FormsModule , MatInputModule , MatButtonModule , MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {

    hide = signal(true)

    switchVisibility(event: MouseEvent){
        this.hide.set(!this.hide());
        event.stopPropagation();
    }

    onLogin(){
      console.log('suiii')
    }

}