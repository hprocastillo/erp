import {Component, inject, OnInit} from '@angular/core';
import {CurrencyPipe, DatePipe, DecimalPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ModalReceiptComponent} from '../../../../shared/components/modal-receipt/modal-receipt.component';
import {User} from '../../../users/interfaces/user';
import {MovementsService} from '../../movements.service';
import {UsersService} from '../../../users/users.service';
import {Movement} from '../../interfaces/movement';

@Component({
  selector: 'app-movements-list',
  imports: [NgForOf, CurrencyPipe, FormsModule, DatePipe, NgIf, NgClass, DecimalPipe],
  templateUrl: './movements-list.component.html',
  styleUrl: './movements-list.component.scss'
})
export class MovementsListComponent implements OnInit {
  /** injects **/
  public router: Router = inject(Router);
  private modalService = inject(NgbModal);
  private movementsService: MovementsService = inject(MovementsService);
  private usersServices: UsersService = inject(UsersService);

  /** variables **/
    // public users$: Observable<User[]> = this.usersServices.getAllUsers();
  public movements: Movement[] = [];
  public users: User[] = [];
  public filteredMovements: Movement[] = [];
  public sumatoria: number = 0;

  /** Filters **/
  showFilters = false;
  selectedUserId: string = '';
  selectedType: string = '';
  selectedPayment: string = '';
  selectedMonth: number | '' = '';
  selectedYear: number | '' = '';

  months = [
    {value: 1, name: 'Enero'}, {value: 2, name: 'Febrero'},
    {value: 3, name: 'Marzo'}, {value: 4, name: 'Abril'},
    {value: 5, name: 'Mayo'}, {value: 6, name: 'Junio'},
    {value: 7, name: 'Julio'}, {value: 8, name: 'Agosto'},
    {value: 9, name: 'Septiembre'}, {value: 10, name: 'Octubre'},
    {value: 11, name: 'Noviembre'}, {value: 12, name: 'Diciembre'}
  ];

  years: number[] = [];

  paymentMethods = [
    'EFECTIVO', 'YAPE', 'TARJETA', 'TRANSFERENCIA'
  ];

  constructor() {
    this.usersServices.getAllUsers().subscribe(users => {
      this.users = users;
    })
    this.movementsService.getAllMovements().subscribe(movements => {
      this.movements = movements;
      this.applyFilters();
    });
  }

  ngOnInit(): void {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JS: 0-indexed, filtro: 1-indexed

    this.years = Array.from({length: 11}, (_, i) => (currentYear - 5) + i);
    this.selectedYear = currentYear;
    this.selectedMonth = currentMonth;

    this.movementsService.getAllMovements().subscribe(movements => {
      this.movements = movements;
      // Solo mostramos del mes actual:
      this.applyFilters(); // Aplica filtro inicial de mes y año actual
    });
    // const currentYear = new Date().getFullYear();
    // this.years = Array.from({length: 10}, (_, i) => currentYear - i);
    // this.movementsService.getAllMovements().subscribe(movements => {
    //   this.movements = movements;
    //   this.filteredMovements = movements;
    // });
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  // applyFilters() {
  //   this.filteredMovements = this.movements.filter(movement => {
  //     let valid = true;
  //     if (this.selectedUserId) valid = valid && movement.createdBy === this.selectedUserId;
  //     if (this.selectedType) valid = valid && movement.type === this.selectedType;
  //     if (this.selectedPayment) valid = valid && movement.paymentMethod === this.selectedPayment;
  //     if (this.selectedMonth && this.selectedYear) {
  //       const movDate = movement.createdAt.toDate();
  //       valid = valid &&
  //         movDate.getFullYear() === Number(this.selectedYear) &&
  //         (movDate.getMonth() + 1) === Number(this.selectedMonth);
  //     }
  //     return valid;
  //   });
  // }
  applyFilters() {
    this.filteredMovements = this.movements.filter(movement => {
      let valid = true;
      if (this.selectedUserId) valid = valid && movement.createdBy === this.selectedUserId;
      if (this.selectedType) valid = valid && movement.type === this.selectedType;
      if (this.selectedPayment) valid = valid && movement.paymentMethod === this.selectedPayment;
      if (this.selectedMonth && this.selectedYear) {
        const movDate = movement.createdAt.toDate();
        valid = valid &&
          movDate.getFullYear() === this.selectedYear &&
          (movDate.getMonth() + 1) === this.selectedMonth;
      } else if (this.selectedYear && !this.selectedMonth) {
        const movDate = movement.createdAt.toDate();
        valid = valid && movDate.getFullYear() === this.selectedYear;
      }
      return valid;
    });

    // Sumar ingresos y egresos de los movimientos filtrados:
    const ingresos = this.filteredMovements
      .filter(m => m.type === 'INGRESO')
      .reduce((acc, m) => acc + (m.amount || 0), 0);
    const egresos = this.filteredMovements
      .filter(m => m.type === 'EGRESO')
      .reduce((acc, m) => acc + (m.amount || 0), 0);

    this.sumatoria = ingresos - egresos;
  }

  // limpiarFiltros() {
  //   this.selectedUserId = '';
  //   this.selectedType = '';
  //   this.selectedPayment = '';
  //   this.selectedMonth = '';
  //   this.selectedYear = '';
  //   this.filteredMovements = this.movements;
  // }
  limpiarFiltros() {
    const now = new Date();
    this.selectedUserId = '';
    this.selectedType = '';
    this.selectedPayment = '';
    this.selectedMonth = now.getMonth() + 1;
    this.selectedYear = now.getFullYear();
    this.applyFilters();
  }

  showImageModal(url: string) {
    const modalRef = this.modalService.open(ModalReceiptComponent, {size: 'lg'});
    modalRef.componentInstance.imageUrl = url;
  }
}
