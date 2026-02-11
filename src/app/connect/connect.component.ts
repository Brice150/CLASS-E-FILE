import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../environments/environment';
import { ForgotComponent } from './forgot/forgot.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

@Component({
  selector: 'app-connect',
  imports: [
    CommonModule,
    LoginComponent,
    RegisterComponent,
    ForgotComponent,
    RouterModule,
  ],
  templateUrl: './connect.component.html',
  styleUrl: './connect.component.css',
})
export class ConnectComponent implements OnInit, OnDestroy {
  imagePath: string = environment.imagePath;
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  destroyed$ = new Subject<void>();
  type: string = 'login';
  allowedTypes = ['login', 'register'];
  previous?: string;

  ngOnInit(): void {
    this.activatedRoute.paramMap
      .pipe(takeUntil(this.destroyed$))
      .subscribe((params) => {
        const type = params.get('type');
        if (type && this.allowedTypes.includes(type)) {
          this.type = type;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  toggleLogin(): void {
    this.previous = this.type;
    this.type = 'login';
  }

  toggleRegister(): void {
    this.previous = this.type;
    this.type = 'register';
  }

  toggleForgotPassword(): void {
    this.previous = this.type;
    this.type = 'forgot';
  }

  back(): void {
    if (this.previous) {
      this.type = this.previous;
      this.previous = undefined;
    } else {
      this.router.navigate(['/']);
    }
  }
}
