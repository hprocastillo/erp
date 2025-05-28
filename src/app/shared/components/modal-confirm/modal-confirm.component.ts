import {Component, inject, Input} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-confirm',
  imports: [],
  templateUrl: './modal-confirm.component.html',
  styleUrl: './modal-confirm.component.scss'
})
export class ModalConfirmComponent {
  public activeModal = inject(NgbActiveModal);
  @Input() title: string = 'Confirmar';
  @Input() message: string = '¿Está seguro de eliminar este registro?';


}
