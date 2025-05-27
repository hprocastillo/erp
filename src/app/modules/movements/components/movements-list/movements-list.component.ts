import {Component, inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MovementsService} from '../../movements.service';
import {CurrencyPipe, DatePipe, DecimalPipe, NgForOf} from '@angular/common';

@Component({
  selector: 'app-movements-list',
  imports: [
    NgForOf,
    DecimalPipe,
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

  movements = this.service.movements;

  ngOnInit() {
    this.service.listenAll();
  }

  async delete(id: string, receiptUrl?: string) {
    if (confirm('¿Eliminar movimiento?')) {
      await this.service.delete(id, receiptUrl);
    }
  }
}
