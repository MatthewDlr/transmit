import { Component } from '@angular/core';
import {ReactiveFormsModule} from "@angular/forms";
import {UserProfileService} from "../../../shared/services/user-profile/user-profile.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-onboarding-form',
  standalone: true,
    imports: [
        ReactiveFormsModule
    ],
  templateUrl: './onboarding-form.component.html',
  styleUrl: './onboarding-form.component.css'
})
export class OnboardingFormComponent {

  constructor(private userService: UserProfileService, private router: Router) {
  }

  setNameAndFirstName(name: string, last_name: string) {
    if(name.length > 0 && last_name.length > 0) {
      this.userService.setInfo(name, last_name).then(r => {
        this.userService.onboard().then(r => console.log("Onboarding done !"));
        this.router.navigate(["/feed"]).then(r => console.log("Onboarding finished!"));
      });
    }
  }

}
