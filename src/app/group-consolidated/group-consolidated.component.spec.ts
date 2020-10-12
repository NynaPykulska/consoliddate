import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GroupConsolidatedComponent} from './group-consolidated.component';
import {BehaviorSubject} from 'rxjs';
import {Group} from '../../core/interfaces/group.interface';
import {AppStateService} from '../../core/app-state.service';
import {ActivatedRoute} from '@angular/router';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

const groupCurrencyExchange = 100;
const companyCurrencyExchange = 1000;
const account1Balance = 1;
const account2Balance = -2;
const exchangeRateData = [{rate: companyCurrencyExchange, currency: 'EUR'}, {rate: groupCurrencyExchange, currency: 'DKK'}];
const groupData: Group = {
  code: 'ASD',
  name: 'Groupity group',
  currency: 'DKK',
  companies: [{
    name: 'Business',
    code: 'HJK',
    currency: 'EUR',
    parent: 'ASD',
    accounts: [
      {
        name: 'Revenue',
        code: 1234,
        balance: account1Balance,
        companyCode: 'HJK',
      }, {
        name: 'salary',
        code: 1234,
        balance: account2Balance,
        companyCode: 'HJK',
      }
    ]
  }]
};

class MockAppState {
  groups$ = new BehaviorSubject([groupData]);
  exchangeRates$ = new BehaviorSubject(exchangeRateData);

  deleteAccount(group: string, company: string, code: number): void {
  }
}

describe('GroupConsolidatedComponent', () => {
  let component: GroupConsolidatedComponent;
  let fixture: ComponentFixture<GroupConsolidatedComponent>;
  let service: AppStateService;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GroupConsolidatedComponent],
      imports: [MatInputModule, MatFormFieldModule, MatButtonModule,
        MatSelectModule, MatIconModule, FormsModule, BrowserAnimationsModule
      ],
      providers: [{
        provide: AppStateService,
        useClass: MockAppState
      }, {
        provide: ActivatedRoute, useValue: {
          snapshot: {params: {groupCode: 'ASD'}}
        }
      }]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupConsolidatedComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(AppStateService);
    fixture.detectChanges();
  });

  it('should calculate value for the whole group', () => {
    const value = component.calculateOverviewValue();
    const expectedBalance = (account1Balance + account2Balance) * companyCurrencyExchange / groupCurrencyExchange;
    expect(value).toBe(expectedBalance);
  });

  it('should calculate value for the whole company', () => {
    const value = component.calculateCompanyValue(groupData.companies[0]);
    const expectedBalance = (account1Balance + account2Balance) * companyCurrencyExchange / groupCurrencyExchange;
    expect(value).toBe(expectedBalance);
  });

  it('should calculate value for account', () => {
    const value = component.calculateAccountBalance(groupData.companies[0].accounts[0], 'EUR');
    const expectedBalance = account1Balance * companyCurrencyExchange / groupCurrencyExchange;
    expect(value).toBe(expectedBalance);
  });

  it('should render group elements', () => {
    const groupDetails = fixture.nativeElement.querySelector('.group-details');
    expect(groupDetails).toBeTruthy();
    const companyDetails = fixture.nativeElement.querySelectorAll('.company-details');
    expect(companyDetails.length).toBe(1);
    const accountDetails = fixture.nativeElement.querySelectorAll('.account-details');
    expect(accountDetails.length).toBe(2);
  });

  it('should delete an account when clicking delete button', () => {
    const deleteButton = fixture.nativeElement.querySelector('[data-ui-element="delete-account"]');
    const deleteSpy = spyOn(service, 'deleteAccount');
    deleteButton.click();
    fixture.detectChanges();
    expect(deleteSpy).toHaveBeenCalled();
  });

  it('should enable balance editing when button is clicked', () => {
    const editButton = fixture.nativeElement.querySelector('[data-ui-element="edit-balance-button"]');
    let editInput = fixture.nativeElement.querySelector('[data-ui-element="edit-balance-input"]');
    expect(editInput).toBeFalsy();
    editButton.click();
    fixture.detectChanges();
    editInput = fixture.nativeElement.querySelector('[data-ui-element="edit-balance-input"]');
    expect(editInput).toBeTruthy();
  });
});
