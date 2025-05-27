import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from '../auth.service';
import {map, take} from 'rxjs';

export const AuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.userGuard$.pipe(
    take(1),
    map(user => {
      if (!user) {
        router.navigate(['/auth']);
        return false;
      }
      return true;
    })
  );
};
