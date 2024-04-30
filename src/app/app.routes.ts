import { Routes } from "@angular/router";
import { isNotLoggedInGuard } from "./auth/guards/is-not-logged-in.guard";
import { isLoggedIn } from "./auth/guards/is-logged-in.guard";

export const routes: Routes = [
  {
    path: "login",
    loadComponent: () => import("./auth/components/login-form/login-form.component").then((m) => m.LoginFormComponent),
    canActivate: [isNotLoggedInGuard],
  },
  {
    path: "feed",
    loadComponent: () => import("./core/feed/components/feed-page/feed-page.component").then((m) => m.FeedPageComponent),
    canActivate: [isLoggedIn],
  },
  {
    path: "explore",
    loadComponent: () => import("./core/explore/explore-page.component").then((m) => m.ExplorePageComponent),
    canActivate: [isLoggedIn],
  },
  {
    path: "account",
    loadComponent: () => import("./core/account/components/account-page/account-page.component").then((m) => m.AccountPageComponent),
    //canActivate: [isLoggedIn],
  },
  {
    path: "**",
    redirectTo: "feed",
  },
];
