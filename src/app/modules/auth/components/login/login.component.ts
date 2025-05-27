import {Component, inject} from '@angular/core';
import {AuthService} from '../../auth.service';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {NgClass, NgIf} from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgClass
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  /** injects **/
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  /** variables **/
  public loginForm: FormGroup;
  public loading: boolean = false;
  public error: string | null = null;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  async onSubmit() {
    this.error = null;

    if (this.loginForm.invalid) return;
    this.loading = true;
    const {email, password} = this.loginForm.value;

    try {
      await this.authService.login(email, password);
      await this.router.navigate(['/dashboard']);

    } catch (e: any) {
      this.error = e.message || 'Error al iniciar sesión';

    } finally {
      this.loading = false;
    }
  }
}
