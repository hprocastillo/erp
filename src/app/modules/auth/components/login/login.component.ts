import {Component, inject} from '@angular/core';
import {AuthService} from '../../auth.service';
import {ReactiveFormsModule} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  /** injects **/
  private authService = inject(AuthService);
  private router = inject(Router);

  async loginWithGoogle() {
    try {
      await this.authService.loginWithGoogle();
      await this.router.navigate(['/dashboard']);

    } catch (e: any) {
      alert(e.message || 'Error de autenticación');
    }
  }
}
