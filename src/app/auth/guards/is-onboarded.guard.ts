import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {UserProfileService} from "../../shared/services/user-profile/user-profile.service";

export const isOnboarded: CanActivateFn = async () => {
  const userService = inject(UserProfileService);
  const router = inject(Router);

  if (await userService.isOnboarded()) {
    return true;
  }
  router.navigate(["/onboarding"]);
  return false;
};
