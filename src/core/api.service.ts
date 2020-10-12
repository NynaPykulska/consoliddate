import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CompanyModel} from './dto/company.model';
import {AccountModel} from './dto/account.model';
import {BalanceModel} from './dto/balance.model';
import {CurrencyExchangeModel} from './dto/currency-exchange.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) {
  }

  getCompanies(): Observable<CompanyModel[]> {
    return this.http.get<CompanyModel[]>('/api/companies');
  }

  getAccounts(): Observable<AccountModel[]> {
    return this.http.get<AccountModel[]>('/api/accounts');
  }

  getBalances(): Observable<BalanceModel[]> {
    return this.http.get<BalanceModel[]>('/api/balances');
  }

  getExchangeRates(): Observable<CurrencyExchangeModel[]> {
    return this.http.get<CurrencyExchangeModel[]>('/api/exchangeRates');
  }

}
