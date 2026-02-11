import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

export const noUserGuard: CanActivateFn = (route, state) => {
  const authenticationService = inject(AuthenticationService);
  const router = inject(Router);

  const waitForUser = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const checkUser = () => {
        const user = authenticationService.currentAuthenticationSig();

        if (user !== undefined) {
          if (user === null) {
            resolve(true);
          } else {
            router.navigate(['/dashboard']);
            resolve(false);
          }
        } else {
          setTimeout(checkUser, 100);
        }
      };

      checkUser();
    });
  };

  return waitForUser();
};
