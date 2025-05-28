import {Component, inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MovementsService} from '../../movements.service';
import {CurrencyPipe, DatePipe, NgForOf} from '@angular/common';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ModalReceiptComponent} from '../../../../shared/components/modal-receipt/modal-receipt.component';

@Component({
  selector: 'app-movements-list',
  imports: [
    NgForOf,
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './movements-list.component.html',
  styleUrl: './movements-list.component.scss'
})
export class MovementsListComponent implements OnInit {
  /** injects **/
  public router = inject(Router);
  private service = inject(MovementsService);
  private modalService = inject(NgbModal);

  movements = this.service.movements;

  ngOnInit() {
    this.service.getAllMovements();
  }

  showImageModal(url: string) {
    const modalRef = this.modalService.open(ModalReceiptComponent, {size: 'lg'});
    modalRef.componentInstance.imageUrl = url;
  }

  async delete(id: string, receiptUrl?: string) {
    if (confirm('¿Eliminar movimiento?')) {
      await this.service.delete(id, receiptUrl);
    }
  }
}
