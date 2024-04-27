import { Routes } from "@angular/router";
import { isNotLoggedInGuard } from "./auth/guards/is-not-logged-in.guard";

export const routes: Routes = [
  {
    path: "login",
    loadComponent: () => import("./auth/components/login-form/login-form.component").then((m) => m.LoginFormComponent),
    canActivate: [isNotLoggedInGuard]
  },
  {
    path: "**",
    loadComponent: () => import("./auth/components/login-form/login-form.component").then((m) => m.LoginFormComponent),
  },
];
