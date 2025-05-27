import {Component, computed, inject} from '@angular/core';
import {AuthService} from '../../../modules/auth/auth.service';
import {NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';
import {NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-navbar',
  imports: [
    NgIf,
    RouterLink,
    NgbDropdown,
    NgbDropdownMenu,
    NgbDropdownItem,
    NgbDropdownToggle
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  /** injects **/
  private auth = inject(AuthService);

  /** variables **/
  public collapsed: boolean = true;

  /** Signal reactiva para saber si hay usuario logeado **/
  isLoggedIn = computed(() => !!this.auth.user());

  /** Nombre del usuario, si está logeado **/
  displayName = computed(() => this.auth.user()?.displayName ?? 'Usuario');
  photoUrl = computed(() => this.auth.user()?.photoURL ?? '');

  async logout() {
    await this.auth.logout();
  }
}
