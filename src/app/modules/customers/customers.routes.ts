import {Routes} from '@angular/router';
import {CustomersListComponent} from './components/customers-list/customers-list.component';
import {CustomersNewComponent} from './components/customers-new/customers-new.component';
import {CustomersEditComponent} from './components/customers-edit/customers-edit.component';
import {CustomersViewComponent} from './components/customers-view/customers-view.component';

export const CUSTOMERS_ROUTES: Routes = [
  {
    path: '', redirectTo: 'list', pathMatch: 'full'
  },
  {
    path: 'list', component: CustomersListComponent
  },
  {
    path: 'new', component: CustomersNewComponent
  },
  {
    path: 'edit/:id', component: CustomersEditComponent
  },
  {
    path: 'view/:id', component: CustomersViewComponent
  }
];
