import {Routes} from '@angular/router';
import {MovementsListComponent} from './components/movements-list/movements-list.component';
import {MovementsNewComponent} from './components/movements-new/movements-new.component';
import {MovementsEditComponent} from './components/movements-edit/movements-edit.component';
import {MovementsViewComponent} from './components/movements-view/movements-view.component';

export const MOVEMENTS_ROUTES: Routes = [
  {
    path: '', redirectTo: 'list', pathMatch: 'full'
  },
  {
    path: 'list', component: MovementsListComponent
  },
  {
    path: 'new', component: MovementsNewComponent
  },
  {
    path: 'edit/:id', component: MovementsEditComponent
  },
  {
    path: 'view/:id', component: MovementsViewComponent
  }
];
