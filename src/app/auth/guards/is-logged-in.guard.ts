import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const isLoggedIn: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.session) {
    return true;
  }
  router.navigate(["/login"]);
  return false;
};
