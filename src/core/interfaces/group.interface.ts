interface CompanyEntity {
  code: string;
  name: string;
  currency: string;
}

export interface Group extends CompanyEntity {
  companies: Company[];
}

export interface Company extends CompanyEntity {
  parent: string;
  accounts: AccountBalance[];
}

export interface AccountBalance {
  name: string;
  code: number;
  companyCode: string;
  balance: number;
}
