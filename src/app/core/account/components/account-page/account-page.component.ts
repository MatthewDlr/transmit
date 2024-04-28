import { Component } from '@angular/core';
import { LogoutFormComponent } from '../../../../auth/components/logout-form/logout-form.component';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [LogoutFormComponent],
  templateUrl: './account-page.component.html',
  styleUrl: './account-page.component.css'
})
export class AccountPageComponent {

}
