import {Component, inject, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-users-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users-edit.component.html',
  styleUrl: './users-edit.component.scss'
})
export class UsersEditComponent implements OnInit {
  /** injects **/
  private fb = inject(FormBuilder);
  public activeModal = inject(NgbActiveModal);

  /** io **/
  @Input() displayName!: string;
  @Input() role!: 'ADMINISTRADOR' | 'USUARIO';

  public form: FormGroup = this.fb.group({
    displayName: ['', Validators.required],
    role: ['', Validators.required]
  });

  ngOnInit() {
    this.form.patchValue({displayName: this.displayName, role: this.role});
  }

  save() {
    if (this.form.valid) {
      this.activeModal.close(this.form.value);
    }
  }
}
