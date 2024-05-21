import { Routes } from "@angular/router";
import { isNotLoggedInGuard } from "./auth/guards/is-not-logged-in.guard";
import { isLoggedIn } from "./auth/guards/is-logged-in.guard";
import { UserProfilePageComponent } from "./core/explore/components/user-profile-page/user-profile-page.component";
import { ExplorePageComponent } from "./core/explore/components/explore-page/explore-page.component";
import { MyPostsPageComponent } from "./core/account/components/my-posts-page/my-posts-page.component";
import { RelationsPageComponent } from "./core/account/components/relations-page/relations-page.component";

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
    component: ExplorePageComponent,
    canActivate: [isLoggedIn],
  },
  {
    path: "account",
    loadComponent: () => import("./core/account/components/account-page/account-page.component").then((m) => m.AccountPageComponent),
    canActivate: [isLoggedIn],
  },
  {
    path: "explore/user/:id",
    component: UserProfilePageComponent,
    canActivate: [isLoggedIn],
  },
  {
    path: "myposts",
    component: MyPostsPageComponent,
    canActivate: [isLoggedIn],
  },
  {
    path: "relations",
    component: RelationsPageComponent,
    canActivate: [isLoggedIn],
  },
  {
    path: "about",
    loadComponent: () => import("./core/about/components/about-page/about-page.component").then((m) => m.AboutPageComponent),
  },
  {
    path: 'myposts',
    component: MyPostsPageComponent
  },
  {
    path: 'relations',
    component: RelationsPageComponent
  },
  {
    path: "**",
    redirectTo: "about",
  },
];
