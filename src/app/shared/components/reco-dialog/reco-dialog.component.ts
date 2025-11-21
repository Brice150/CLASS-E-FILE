import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ToastrService } from 'ngx-toastr';
import { filter } from 'rxjs';
import { Article } from '../../../core/interfaces/article';
import { UserService } from '../../../core/services/user.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-reco-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInput,
    MatCheckboxModule,
  ],
  templateUrl: './reco-dialog.component.html',
  styleUrl: './reco-dialog.component.css',
})
export class RecoDialogComponent implements OnInit {
  articles: Article[] = [];
  email?: string;
  toastr = inject(ToastrService);
  dialog = inject(MatDialog);
  userService = inject(UserService);

  constructor(
    public dialogRef: MatDialogRef<RecoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Article[]
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.articles = this.data;
    }
  }

  emailControlInvalid(): boolean {
    if (!this.email) return true;

    const EMAIL_REGEXP = /^[^\s@]{2,}@[^\s@]{2,}$/;
    return !EMAIL_REGEXP.test(this.email);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  send(): void {
    if (
      this.emailControlInvalid() ||
      !this.articles.some((article) => article.isRecommended)
    ) {
      this.toastr.error(
        'Il faut un email valide et au moins une recommandation',
        'Recommandations',
        {
          positionClass: 'toast-bottom-center',
          toastClass: 'ngx-toastr custom error',
        }
      );
      return;
    }

    //TODO: envoyer un email à this.email de this.userService.currentUserSig()?.email
    // avec la liste des articles.title dont isRecommended = true;

    this.email = undefined;
    this.toastr.info('Recommandations envoyées', 'Recommandations', {
      positionClass: 'toast-bottom-center',
      toastClass: 'ngx-toastr custom info',
    });
  }

  clean(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: 'nettoyer les recommandations de cette catégorie',
    });

    dialogRef
      .afterClosed()
      .pipe(filter((res: boolean) => res))
      .subscribe(() => this.dialogRef.close(true));
  }
}
