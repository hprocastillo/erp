import {Routes} from '@angular/router';
import {UsersListComponent} from './components/users-list/users-list.component';
import {UsersNewComponent} from './components/users-new/users-new.component';
import {UsersEditComponent} from './components/users-edit/users-edit.component';
import {UsersViewComponent} from './components/users-view/users-view.component';

export const USERS_ROUTES: Routes = [
  {
    path: '', redirectTo: 'list', pathMatch: 'full'
  },
  {
    path: 'list', component: UsersListComponent
  },
  {
    path: 'new', component: UsersNewComponent
  },
  {
    path: 'edit/:id', component: UsersEditComponent
  },
  {
    path: 'view/:id', component: UsersViewComponent
  }
];
