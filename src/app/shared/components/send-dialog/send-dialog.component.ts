import { CommonModule } from '@angular/common';
import { Component, Inject, inject, OnInit } from '@angular/core';
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
import { SessionType } from '../../../core/enums/fitness/session-type.enum';
import { RecipeType } from '../../../core/enums/food/recipe-type.enum';
import { SessionGroup } from '../../../core/interfaces/fitness/recipe-group';
import { Session } from '../../../core/interfaces/fitness/session';
import { Recipe } from '../../../core/interfaces/food/recipe';
import { RecipeGroup } from '../../../core/interfaces/food/recipe-group';

@Component({
  selector: 'app-send-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './send-dialog.component.html',
  styleUrl: './send-dialog.component.css',
})
export class SendDialogComponent implements OnInit {
  sendForm!: FormGroup;
  fb = inject(FormBuilder);
  recipeGroups: RecipeGroup[] = [];
  sessionGroups: SessionGroup[] = [];
  recipes: Recipe[] = [];
  sessions: Session[] = [];
  type: string = '';

  get recipesCtrl() {
    return this.sendForm.get('recipes');
  }

  get sessionsCtrl() {
    return this.sendForm.get('sessions');
  }

  constructor(
    public dialogRef: MatDialogRef<SendDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { recipes: Recipe[]; sessions: Session[] },
  ) {}

  ngOnInit(): void {
    const fbGroup: SendFormControls = {
      receiverEmail: ['', [Validators.required, Validators.email]],
      message: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(200),
        ],
      ],
    };

    if (this.data?.recipes?.length) {
      this.recipes = this.data.recipes;
      this.recipeGroups = this.groupRecipesByType(this.recipes);

      const defaultRecipes = this.recipes.length === 1 ? [this.recipes[0]] : [];
      fbGroup.recipes = [defaultRecipes, Validators.required];

      this.type = 'Recette' + (this.recipes.length > 1 ? 's' : '');
    } else if (this.data?.sessions?.length) {
      this.sessions = this.data.sessions;
      this.sessionGroups = this.groupSessionsByType(this.sessions);

      const defaultSessions =
        this.sessions.length === 1 ? [this.sessions[0]] : [];
      fbGroup.sessions = [defaultSessions, Validators.required];

      this.type = 'Session' + (this.sessions.length > 1 ? 's' : '');
    }

    this.sendForm = this.fb.group(fbGroup);
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
    if (this.sendForm.valid) {
      this.dialogRef.close(this.sendForm.value);
    } else {
      this.sendForm.markAllAsTouched();
    }
  }
}

type SendFormControls = {
  receiverEmail: [string, ValidatorFn | ValidatorFn[]];
  message: [string, ValidatorFn | ValidatorFn[]];
  recipes?: [Recipe[], ValidatorFn | ValidatorFn[]];
  sessions?: [Session[], ValidatorFn | ValidatorFn[]];
};
