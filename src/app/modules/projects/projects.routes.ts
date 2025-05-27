import {Routes} from '@angular/router';
import {ProjectsListComponent} from './components/projects-list/projects-list.component';
import {ProjectsNewComponent} from './components/projects-new/projects-new.component';
import {ProjectsEditComponent} from './components/projects-edit/projects-edit.component';
import {ProjectsViewComponent} from './components/projects-view/projects-view.component';

export const PROJECTS_ROUTES: Routes = [
  {
    path: '', redirectTo: 'list', pathMatch: 'full'
  },
  {
    path: 'list', component: ProjectsListComponent
  },
  {
    path: 'new', component: ProjectsNewComponent
  },
  {
    path: 'edit/:id', component: ProjectsEditComponent
  },
  {
    path: 'view/:id', component: ProjectsViewComponent
  }
];
