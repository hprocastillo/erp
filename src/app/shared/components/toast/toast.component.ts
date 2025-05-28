import {Component, inject} from '@angular/core';
import {NgForOf} from '@angular/common';
import {ToastService} from '../../services/toast.service';
import {NgbToastModule} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-toast',
  imports: [NgForOf, NgbToastModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {
  /** injects **/
  service = inject(ToastService);
  toasts = this.service.messages;
}
