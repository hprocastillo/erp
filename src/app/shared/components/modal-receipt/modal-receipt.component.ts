import {Component, Input} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-receipt',
  imports: [],
  templateUrl: './modal-receipt.component.html',
  styleUrl: './modal-receipt.component.scss'
})
export class ModalReceiptComponent {
  @Input() imageUrl!: string;
  constructor(public activeModal: NgbActiveModal) {}
}
