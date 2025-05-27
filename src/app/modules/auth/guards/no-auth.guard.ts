import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from '../auth.service';
import {map, take} from 'rxjs';

export const NoAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.userGuard$.pipe(
    take(1), // Solo una vez
    map(user => {
      if (user) {
        router.navigate(['/dashboard']); // o donde quieras
        return false;
      }
      return true;
    })
  );
};
