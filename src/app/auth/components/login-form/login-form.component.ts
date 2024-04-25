import { Component } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-login-form",
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: "./login-form.component.html",
  styleUrl: "./login-form.component.css",
})
export class LoginFormComponent {
  stage = "wait_submit";
  signupError = "";

  signInForm = this.formBuilder.group({
    email: "",
  });

  constructor(private readonly auth: AuthService, private readonly formBuilder: FormBuilder) {}

  async onSubmit(): Promise<void> {
    try {
      this.stage = "sent";
      this.signupError = "";
      const email = this.signInForm.value.email as string;
      const { error } = await this.auth.signIn(email);

      if (error) throw error;
      this.stage = "success";
    } catch (error) {
      if (error instanceof Error) {
        this.stage = "error";
        this.signupError = error.message;
      }
    } finally {
      this.signInForm.reset();
    }
  }
}
