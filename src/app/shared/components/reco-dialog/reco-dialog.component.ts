import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Article } from '../../../core/interfaces/article';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { filter, switchMap } from 'rxjs';

@Component({
  selector: 'app-reco-dialog',
  imports: [CommonModule, FormsModule],
  templateUrl: './reco-dialog.component.html',
  styleUrl: './reco-dialog.component.css',
})
export class RecoDialogComponent implements OnInit {
  articles: Article[] = [];
  toastr = inject(ToastrService);
  dialog = inject(MatDialog);

  constructor(
    public dialogRef: MatDialogRef<RecoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Article[]
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.articles = this.data;
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  send(): void {
    //TODO
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
