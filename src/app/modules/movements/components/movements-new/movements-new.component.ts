import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MovementsService} from '../../movements.service';
import {Location, NgIf} from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-movements-new',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './movements-new.component.html',
  styleUrl: './movements-new.component.scss'
})
export class MovementsNewComponent {
  /** injects **/
  public router = inject(Router);
  public location = inject(Location);
  private fb = inject(FormBuilder);
  private service = inject(MovementsService);

  form: FormGroup;
  public loading = false;
  public error: string | null = null;
  private selectedFile: File | null = null;
  public imagePreviewUrl: string | null = null;

  constructor() {
    this.form = this.fb.group({
      type: ['INGRESO', Validators.required],
      paymentMethod: ['EFECTIVO', Validators.required],
      description: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      comments: ['']
    });
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;

      // Preview de la imagen
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeSelectedImage() {
    this.selectedFile = null;
    this.imagePreviewUrl = null;
    // También puedes limpiar el input file si lo necesitas
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) input.value = '';
  }

  async onSubmit() {
    this.error = null;
    this.loading = true;
    try {
      await this.service.createMovement(this.form.value, this.selectedFile!);
      await this.router.navigate(['/movements']);
    } catch (e: any) {
      this.error = e.message || 'Error al guardar';
    }
    this.loading = false;
  }
}
