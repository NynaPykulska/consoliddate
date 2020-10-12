import {Component, OnDestroy, OnInit} from '@angular/core';
import {AppStateService} from '../../core/app-state.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ReplaySubject} from 'rxjs';
import {Group} from '../../core/interfaces/group.interface';
import {filter, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-group-selector',
  templateUrl: './group-selector.component.html',
  styleUrls: ['./group-selector.component.css']
})
export class GroupSelectorComponent implements OnInit, OnDestroy {

  groups: Group[];
  availableCurrencies: string[];

  newGroupName: string;
  newGroupCode: string;
  newGroupCurrency: string;

  private componentDestroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private state: AppStateService, private router: Router, private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.state.groups$
      .pipe(takeUntil(this.componentDestroyed$), filter(data => !!data))
      .subscribe(groups => this.groups = groups);
    this.state.exchangeRates$
      .pipe(takeUntil(this.componentDestroyed$), filter(data => !!data))
      .subscribe(rates => this.availableCurrencies = rates.map(rate => rate.currency));
  }

  goToGroup(code: string): void {
    this.router.navigate([code], {relativeTo: this.activatedRoute});
  }

  createGroup(): void {
    this.state.createGroup(this.newGroupName, this.newGroupCode, this.newGroupCurrency);
    this.newGroupName = null;
    this.newGroupCode = null;
    this.newGroupCurrency = null;
  }

  deleteGroup(code: string): void {
    this.state.deleteGroup(code);
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next(true);
    this.componentDestroyed$.complete();
  }
}
