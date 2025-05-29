import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {UsersService} from '../../users.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {User} from '../../interfaces/user';
import {ModalConfirmComponent} from '../../../../shared/components/modal-confirm/modal-confirm.component';
import {UsersEditComponent} from '../users-edit/users-edit.component';
import {ToastService} from '../../../../shared/services/toast.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-users-list',
  imports: [], templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent implements OnInit, OnDestroy {
  /** injects **/
  public router = inject(Router);
  private service = inject(UsersService);
  private modalService = inject(NgbModal);
  private toast = inject(ToastService);

  /** variables **/


  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

  /** Editar usuario **/
  async edit(user: User): Promise<void> {
    const modalRef = this.modalService.open(UsersEditComponent, {backdrop: 'static', keyboard: false});
    modalRef.componentInstance.displayName = user.displayName;
    modalRef.componentInstance.role = user.role;

    try {
      const result = await modalRef.result;
      await this.service.updateUser(user.uid, {
        displayName: result.displayName,
        role: result.role
      });
      this.toast.show('Usuario actualizado con éxito', 'success');
    } catch {
      this.toast.show('Usuario no se pudo actualizar', 'danger');
    }
  }

  /** Borrar usuario **/
  delete(user: User): void {
    const modalRef = this.modalService.open(ModalConfirmComponent, {size: 'sm', backdrop: 'static', keyboard: false});
    modalRef.componentInstance.title = 'Eliminar usuario';
    modalRef.componentInstance.message = `¿Seguro que quieres eliminar a ${user.displayName}?`;
    modalRef.result.then(
      async (result) => {
        if (result) {
          await this.service.deleteUser(user.uid);
          this.toast.show('Usuario eliminado con éxito', 'success');
        }
      },
      (): void => {
      }
    );
  }

  /** Exportar listado a excel **/
  // exportToExcel(): void {
  //   const users = this.users();
  //
  //   /** Prepara los datos (quita los campos no necesarios) **/
  //   const data = users.map(u => ({
  //     "Nombre": u.displayName,
  //     "Correo": u.email,
  //     "Rol": u.role,
  //     "Último inicio": u.lastLogin?.toDate().toLocaleString() ?? '',
  //     "Fecha de registro": u.createdAt?.toDate().toLocaleString() ?? '',
  //     "Registrado por": u.createdByName ?? u.createdBy,
  //   }));
  //
  //   /** Crea la hoja y el libro **/
  //   const worksheet = XLSX.utils.json_to_sheet(data);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');
  //
  //   /** Descarga el archivo **/
  //   XLSX.writeFile(workbook, 'usuarios.xlsx');
  // }

  /** Imprimir la tabla **/
  printTable() {
    const printContents = document.querySelector('.table-responsive')?.innerHTML;
    const win = window.open('', '', 'width=900,height=700');
    if (win && printContents) {
      win.document.write(`
      <html>
        <head>
          <title>Imprimir usuarios</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
        </head>
        <body>
          <div class="container mt-4">${printContents}</div>
        </body>
      </html>
    `);
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
        win.close();
      }, 400);
    }
  }

}
