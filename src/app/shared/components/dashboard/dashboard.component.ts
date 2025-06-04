import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  /** injects **/
  public router = inject(Router);

  /** variables **/
  public listModules = [
    {name: "Movimientos", url: "/movements/list", icon: "fa-solid fa-money-bill-transfer"},
    {name: "Proyectos", url: "/projects/list", icon: "fa-solid fa-building-user"},
    {name: "Clientes", url: "/customers/list", icon: "fa-solid fa-users"},
  ];
}
