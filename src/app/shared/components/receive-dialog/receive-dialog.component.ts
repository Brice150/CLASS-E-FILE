import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { SessionType } from '../../../core/enums/fitness/session-type.enum';
import { RecipeType } from '../../../core/enums/food/recipe-type.enum';
import { SessionGroup } from '../../../core/interfaces/fitness/recipe-group';
import { Session } from '../../../core/interfaces/fitness/session';
import { Recipe } from '../../../core/interfaces/food/recipe';
import { RecipeGroup } from '../../../core/interfaces/food/recipe-group';
import { User } from '../../../core/interfaces/user';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-receive-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './receive-dialog.component.html',
  styleUrl: './receive-dialog.component.css',
})
export class ReceiveDialogComponent implements OnInit, OnDestroy {
  receiveForm!: FormGroup;
  fb = inject(FormBuilder);
  recipeGroups: RecipeGroup[] = [];
  sessionGroups: SessionGroup[] = [];
  recipes: Recipe[] = [];
  sessions: Session[] = [];
  type: string = '';
  userService = inject(UserService);
  toastr = inject(ToastrService);
  users: User[] = [];
  destroyed$ = new Subject<void>();
  loading = true;

  get recipesCtrl() {
    return this.receiveForm.get('recipes');
  }

  get sessionsCtrl() {
    return this.receiveForm.get('sessions');
  }

  get usersCtrl() {
    return this.receiveForm.get('users');
  }

  constructor(
    public dialogRef: MatDialogRef<ReceiveDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { recipes: Recipe[]; sessions: Session[] },
  ) {}

  ngOnInit(): void {
    const fbGroup: ReceiveFormControls = {};

    if (this.data?.recipes?.length) {
      this.recipes = this.data.recipes;
      this.recipeGroups = this.groupRecipesByType(this.recipes);

      const defaultRecipes = this.recipes.length === 1 ? [this.recipes[0]] : [];
      fbGroup.recipes = [defaultRecipes, Validators.required];

      this.type = 'Recette' + (this.recipes.length > 1 ? 's' : '');
      this.loading = false;
      this.receiveForm = this.fb.group(fbGroup);
    } else if (this.data?.sessions?.length) {
      this.sessions = this.data.sessions;
      this.sessionGroups = this.groupSessionsByType(this.sessions);

      const defaultSessions =
        this.sessions.length === 1 ? [this.sessions[0]] : [];
      fbGroup.sessions = [defaultSessions, Validators.required];

      this.type = 'Session' + (this.sessions.length > 1 ? 's' : '');

      this.userService
        .getUsers()
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: (users: User[]) => {
            this.users = users.sort((a, b) => a.order - b.order);
            fbGroup.users = [[this.users[0]], Validators.required];
            this.receiveForm = this.fb.group(fbGroup);
            this.loading = false;
          },
          error: (error: HttpErrorResponse) => {
            if (
              !error.message.includes('Missing or insufficient permissions.')
            ) {
              this.toastr.error(error.message, 'Erreur', {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              });
            }
          },
        });
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  groupRecipesByType(recipes: Recipe[]): RecipeGroup[] {
    const types: RecipeType[] = [
      RecipeType.ENTREE,
      RecipeType.PLAT,
      RecipeType.DESSERT,
      RecipeType.BOISSON,
    ];

    const groups: Record<RecipeType, Recipe[]> = {
      [RecipeType.ENTREE]: [],
      [RecipeType.PLAT]: [],
      [RecipeType.DESSERT]: [],
      [RecipeType.BOISSON]: [],
    };

    recipes.forEach((recipe) => {
      groups[recipe.type].push(recipe);
    });

    return types
      .filter((type) => groups[type].length > 0)
      .map((type) => ({
        name: type.toUpperCase(),
        recipes: groups[type].sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }

  groupSessionsByType(sessions: Session[]): SessionGroup[] {
    const types: SessionType[] = [
      SessionType.MUSCULATION,
      SessionType.CARDIO,
      SessionType.COURSE,
      SessionType.VELO,
      SessionType.NATATION,
      SessionType.YOGA,
      SessionType.PILATES,
      SessionType.MARCHE,
      SessionType.RANDONNEE,
      SessionType.FOOTBALL,
      SessionType.BASKETBALL,
      SessionType.TENNIS,
      SessionType.DANSE,
      SessionType.MEDITATION,
      SessionType.AUTRE,
    ];

    const groups: Record<SessionType, Session[]> = types.reduce(
      (acc, type) => ({ ...acc, [type]: [] }),
      {} as Record<SessionType, Session[]>,
    );

    sessions.forEach((session) => {
      groups[session.type].push(session);
    });

    return types
      .filter((type) => groups[type].length > 0)
      .map((type) => ({
        name: type.toUpperCase(),
        sessions: groups[type].sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    if (this.receiveForm.valid) {
      this.dialogRef.close(this.receiveForm.value);
    } else {
      this.receiveForm.markAllAsTouched();
    }
  }
}

type ReceiveFormControls = {
  recipes?: [Recipe[], ValidatorFn | ValidatorFn[]];
  sessions?: [Session[], ValidatorFn | ValidatorFn[]];
  users?: [User[], ValidatorFn | ValidatorFn[]];
};
