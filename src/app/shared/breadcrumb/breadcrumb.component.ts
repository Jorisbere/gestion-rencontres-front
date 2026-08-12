import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

export interface BreadcrumbSegment {
  label: string;
  /** Peut contenir le gabarit ':id', remplacé par le paramètre de route de la page active. */
  link?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly segments = signal<BreadcrumbSegment[]>([]);

  ngOnInit(): void {
    this.recalculer();
    this.router.events
      .pipe(
        filter((evenement): evenement is NavigationEnd => evenement instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.recalculer());
  }

  private recalculer(): void {
    // Les routes de l'app sont plates (un seul niveau d'enfants sous app-shell) : la
    // route active courante porte donc directement le "chemin" complet du fil d'Ariane
    // dans ses data, indépendamment de sa profondeur d'imbrication réelle dans l'arbre.
    let route = this.router.routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }

    const brut = (route.snapshot.data['breadcrumb'] as BreadcrumbSegment[] | undefined) ?? [];
    const id = route.snapshot.paramMap.get('id');

    this.segments.set(
      brut.map((segment) => ({
        label: segment.label,
        link: segment.link && id ? segment.link.replace(':id', id) : segment.link
      }))
    );
  }
}
