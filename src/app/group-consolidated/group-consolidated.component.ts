import {Component, OnDestroy, OnInit} from '@angular/core';
import {AppStateService} from '../../core/app-state.service';
import {ActivatedRoute} from '@angular/router';
import {AccountBalance, Company, Group} from '../../core/interfaces/group.interface';
import {ReplaySubject} from 'rxjs';
import {filter, map, takeUntil} from 'rxjs/operators';
import {CurrencyExchangeModel} from '../../core/dto/currency-exchange.model';

@Component({
  selector: 'app-group-consolidated',
  templateUrl: './group-consolidated.component.html',
  styleUrls: ['./group-consolidated.component.css']
})
export class GroupConsolidatedComponent implements OnInit, OnDestroy {

  activeGroup: Group;
  exchangeRates: CurrencyExchangeModel[];

  activeAccountEdit: number = null;

  newAccountName: string;
  newAccountCode: number;
  newAccountCompany: string;

  newCompanyName: string;
  newCompanyCode: string;
  newCompanyCurrency: string;

  private componentDestroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private state: AppStateService, private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    const groupCode = this.activatedRoute.snapshot.params.groupCode;
    this.state.groups$.pipe(
      takeUntil(this.componentDestroyed$),
      filter(data => !!data),
      map(groups => groups.find(g => g.code === groupCode))
    ).subscribe(group => this.activeGroup = group);
    this.state.exchangeRates$.pipe(
      takeUntil(this.componentDestroyed$),
      filter(data => !!data)
    ).subscribe(rates => this.exchangeRates = rates);
  }

  calculateOverviewValue(): number {
    return this.activeGroup.companies.reduce((value, company) => {
      return value + this.calculateAccountsValue(company.accounts, company.currency, this.activeGroup.currency);
    }, 0);
  }

  calculateCompanyValue(company: Company): number {
    return this.calculateAccountsValue(company.accounts, company.currency, this.activeGroup.currency);
  }

  calculateAccountBalance(account: AccountBalance, accountCurrency: string): number {
    const parentRate = this.exchangeRates.find(rate => rate.currency === this.activeGroup.currency)?.rate;
    const accountRate = this.exchangeRates.find(rate => rate.currency === accountCurrency)?.rate;
    return account.balance * accountRate / parentRate;
  }

  private calculateAccountsValue(
    accounts: AccountBalance[],
    accountsCurrency: string,
    parentCurrency: string): number {
    const parentRate = this.exchangeRates.find(rate => rate.currency === parentCurrency)?.rate;
    const accountRate = this.exchangeRates.find(rate => rate.currency === accountsCurrency)?.rate;
    return accounts.reduce((value, account) => value + account.balance, 0) * accountRate / parentRate;
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next(true);
    this.componentDestroyed$.complete();
  }

  updateAccountBalance(companyCode: string, accountCode: number, newBalanceInput: string): void {
    const newBalance = parseFloat(newBalanceInput);
    if (isNaN(newBalance)) {
      return;
    }
    this.state.updateAccountBalane(this.activeGroup.code, companyCode, accountCode, newBalance);
    this.activeAccountEdit = null;
  }

  deleteAccount(companyCode: string, accountCode: number): void {
    this.state.deleteAccount(this.activeGroup.code, companyCode, accountCode);
  }

  createAccount(): void {
    this.state.createAccount(this.activeGroup.code, this.newAccountCompany, this.newAccountName, this.newAccountCode, 0);
    this.newAccountName = null;
    this.newAccountCode = null;
    this.newAccountCompany = null;

  }

  createCompany(): void {
    this.state.createCompany(this.activeGroup.code, this.newCompanyCode, this.newCompanyName, this.newCompanyCurrency);
    this.newCompanyName = null;
    this.newCompanyCode = null;
    this.newCompanyCurrency = null;
  }
}
