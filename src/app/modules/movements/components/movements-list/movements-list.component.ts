import {Component, inject, OnInit} from '@angular/core';
import {CurrencyPipe, DatePipe, DecimalPipe, NgClass, NgForOf, NgIf, SlicePipe} from '@angular/common';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {ModalReceiptComponent} from '../../../../shared/components/modal-receipt/modal-receipt.component';
import {ModalConfirmComponent} from '../../../../shared/components/modal-confirm/modal-confirm.component';
import {User} from '../../../auth/interfaces/user';
import {MovementsService} from '../../movements.service';
import {Movement} from '../../interfaces/movement';
import * as XLSX from 'xlsx';
import {ToastService} from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-movements-list',
  imports: [NgForOf, CurrencyPipe, FormsModule, DatePipe, NgIf, NgClass, DecimalPipe, NgbPagination, SlicePipe],
  templateUrl: './movements-list.component.html',
  styleUrl: './movements-list.component.scss'
})
export class MovementsListComponent implements OnInit {
  /** injects **/
  public router: Router = inject(Router);
  private modalService = inject(NgbModal);
  private movementsService: MovementsService = inject(MovementsService);
  private toast = inject(ToastService);

  /** variables **/
  public movements: Movement[] = [];
  public users: User[] = [];
  public filteredMovements: Movement[] = [];
  public sumatoria: number = 0;
  public page: number = 1;
  public pageSize: number = 10;

  /** Filters **/
  showFilters = false;
  selectedUserId: string = '';
  selectedType: string = '';
  selectedPayment: string = '';
  selectedMonth: number | '' = '';
  selectedYear: number | '' = '';

  public months = [
    {value: 1, name: 'Enero'}, {value: 2, name: 'Febrero'},
    {value: 3, name: 'Marzo'}, {value: 4, name: 'Abril'},
    {value: 5, name: 'Mayo'}, {value: 6, name: 'Junio'},
    {value: 7, name: 'Julio'}, {value: 8, name: 'Agosto'},
    {value: 9, name: 'Septiembre'}, {value: 10, name: 'Octubre'},
    {value: 11, name: 'Noviembre'}, {value: 12, name: 'Diciembre'}
  ];

  public years: number[] = [];
  public paymentMethods = ['EFECTIVO', 'YAPE', 'TARJETA', 'TRANSFERENCIA'];

  constructor() {
    this.movementsService.getAllUsers().subscribe(users => {
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
      this.applyFilters();
    });
  }

  /** Visualizar filtros **/
  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  /** *************** **/
  /** Aplicar filtros **/
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

    /** Sumar ingresos y egresos de los movimientos filtrados **/
    const ingresos = this.filteredMovements
      .filter(m => m.type === 'INGRESO')
      .reduce((acc, m) => acc + (m.amount || 0), 0);
    const egresos = this.filteredMovements
      .filter(m => m.type === 'EGRESO')
      .reduce((acc, m) => acc + (m.amount || 0), 0);

    this.sumatoria = ingresos - egresos;
  }

  /** limpiar controles de filtros **/
  limpiarFiltros() {
    const now = new Date();
    this.selectedUserId = '';
    this.selectedType = '';
    this.selectedPayment = '';
    this.selectedMonth = now.getMonth() + 1;
    this.selectedYear = now.getFullYear();
    this.applyFilters();
  }

  /** show modal image receipt **/
  showImageModal(url: string) {
    const modalRef = this.modalService.open(ModalReceiptComponent, {size: 'lg'});
    modalRef.componentInstance.imageUrl = url;
  }

  /** ************************ **/
  /** Exportar listado a excel **/
  exportToExcel(): void {
    const movements: Movement[] = this.filteredMovements;
    const data = movements.map(m => {
      const fecha = m.createdAt?.toDate();
      const mesValue = fecha ? fecha.getMonth() + 1 : null;
      const mesObj = this.months.find(mes => mes.value === mesValue);
      const mesNombre = mesObj ? mesObj.name : '';
      return {
        "Tipo": m.type,
        "Método de Pago": m.paymentMethod,
        "Descripción": m.description,
        "Monto (S/.)": m.amount ? `S/. ${m.amount.toLocaleString('es-PE', {minimumFractionDigits: 2})}` : '',
        "Observaciones": m.comments,
        "Fecha de Movimiento": fecha ? fecha.toLocaleString('es-PE') : '',
        "Año": fecha ? fecha.getFullYear() : '',
        "Mes": mesNombre,
        "Registrado Por": m.createdByName ?? m.createdBy,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimientos');
    XLSX.writeFile(workbook, 'movimientos.xlsx');
  }

  /** ***************** **/
  /** Borrar movimiento **/
  delete(movement: Movement): void {
    const modalRef = this.modalService.open(ModalConfirmComponent, {size: 'sm', backdrop: 'static', keyboard: false});
    modalRef.componentInstance.title = 'Eliminar movimiento';
    modalRef.componentInstance.message = `¿Seguro que quieres eliminar el movimiento ${movement.description}?`;
    modalRef.result.then(
      async (result) => {
        if (result) {
          await this.movementsService.deleteMovement(movement.id);
          this.toast.show('Movimiento eliminado con éxito', 'success');
        }
      },
      (): void => {
      }
    );
  }
}
