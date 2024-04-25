import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "login",
    loadComponent: () => import("./auth/components/login-form/login-form.component").then((m) => m.LoginFormComponent),
  },
  {
    path: "**",
    loadComponent: () => import("./auth/components/login-form/login-form.component").then((m) => m.LoginFormComponent),
  },
];
