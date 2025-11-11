import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  @Output() logoutEvent = new EventEmitter<void>();
  menuOpen = false;
  router = inject(Router);

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.menuOpen) {
          this.menuOpen = false;
        }
      });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout(): void {
    this.logoutEvent.emit();
  }
}
