import {Injectable} from '@angular/core';
import {map, take} from 'rxjs/operators';
import {CompanyModel} from './dto/company.model';
import {AccountBalance, Group} from './interfaces/group.interface';
import {BehaviorSubject, forkJoin, Observable} from 'rxjs';
import {AccountModel} from './dto/account.model';
import {BalanceModel} from './dto/balance.model';
import {ApiService} from './api.service';
import {CurrencyExchangeModel} from './dto/currency-exchange.model';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {

  groups$: BehaviorSubject<Group[]> = new BehaviorSubject(null);
  exchangeRates$: BehaviorSubject<CurrencyExchangeModel[]> = new BehaviorSubject(null);


  constructor(private api: ApiService) {
    this.getGroups().subscribe(groups => this.groups$.next(groups));
    this.api.getExchangeRates().subscribe(rates => this.exchangeRates$.next(rates));
  }

  getGroups(): Observable<Group[]> {
    return forkJoin([this.api.getCompanies(), this.api.getAccounts(), this.api.getBalances()])
      .pipe(take(1), map(([companyModels, accountModels, balanceModels]: [CompanyModel[], AccountModel[], BalanceModel[]]) => {
        const groups: Group[] = companyModels.filter(c => c.type === 'Group').map(g => ({
          code: g.code,
          name: g.name,
          currency: g.currency,
          companies: []
        }));

        const accountsData = this.mapModelsData(accountModels, balanceModels);

        companyModels.filter(c => c.type === 'Company').forEach(c => {
          groups.find(g => g.code === c.parent)?.companies.push({
            code: c.code,
            name: c.name,
            currency: c.currency,
            parent: c.parent,
            accounts: accountsData.filter(a => a.companyCode === c.code)
          });
        });

        return groups;
      }));
  }

  private mapModelsData(accountModels: AccountModel[], balanceModels: BalanceModel[]): AccountBalance[] {
    return balanceModels.map(balance => ({
      name: accountModels.find(a => a.code === balance.accountCode)?.name,
      code: balance.accountCode,
      companyCode: balance.companyCode,
      balance: balance.amount,
    }));
  }

  createGroup(code: string, name: string, currency: string): void {
    const currentGroups = this.groups$.value;
    const newGroup = {
      code,
      name,
      currency,
      companies: []
    };
    currentGroups.push(newGroup);
    this.groups$.next(currentGroups);
  }

  updateGroup(code: string, name: string, currency: string): void {
    const currentGroups = this.groups$.value;
    const selectedGroup = currentGroups.find(g => g.code === code);
    if (!selectedGroup) {
      return;
    }
    if (name) {
      selectedGroup.name = name;
    }

    if (currency) {
      selectedGroup.currency = currency;
    }
    this.groups$.next(currentGroups);
  }

  deleteGroup(code: string): void {
    const currentGroups = this.groups$.value;
    const groupIndex = currentGroups.findIndex(g => g.code === code);
    currentGroups.splice(groupIndex, 1);
    console.log(currentGroups);
    this.groups$.next(currentGroups);
  }

  createCompany(groupCode: string, code: string, name: string, currency: string): void {
    const currentGroups = this.groups$.value;
    const selectedGroup = currentGroups.find(g => g.code === groupCode);
    selectedGroup.companies.push({
      code,
      name,
      currency,
      parent: groupCode,
      accounts: []
    });
    this.groups$.next(currentGroups);
  }

  updateCompanyName(groupCode: string, code: string, name: string): void {
    const currentGroups = this.groups$.value;
    const selectedCompany = currentGroups.find(g => g.code === groupCode)?.companies?.find(c => c.code === code);
    selectedCompany.name = name;
    this.groups$.next(currentGroups);
  }

  deleteCompany(groupCode: string, code: string): void {
    const currentGroups = this.groups$.value;
    const selectedGroup = currentGroups.find(g => g.code === groupCode);
    const index = selectedGroup.companies.findIndex(c => c.code === code);
    selectedGroup.companies.splice(index, 1);
    this.groups$.next(currentGroups);
  }

  createAccount(groupCode: string, companyCode: string, name: string, code: number, balance: number): void {
    const currentGroups = this.groups$.value;
    const company = currentGroups.find(g => g.code === groupCode).companies.find(c => c.code === companyCode);
    company.accounts.push({
      name,
      code,
      companyCode,
      balance,
    });
    this.groups$.next(currentGroups);
  }

  updateAccountBalane(groupCode: string, companyCode: string, code: number, balance: number): void {
    const currentGroups = this.groups$.value;
    const account = currentGroups
      .find(g => g.code === groupCode).companies
      .find(c => c.code === companyCode)?.accounts
      .find(a => a.code === code);
    account.balance = balance;
    this.groups$.next(currentGroups);
  }

  deleteAccount(groupCode: string, companyCode: string, code: number): void {
    const currentGroups = this.groups$.value;
    const accounts = currentGroups
      .find(g => g.code === groupCode).companies
      .find(c => c.code === companyCode)?.accounts;
    const index = accounts.findIndex(a => a.code === code);
    accounts.splice(index, 1);
    this.groups$.next(currentGroups);
  }

}
