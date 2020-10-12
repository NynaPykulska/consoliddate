import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupConsolidatedComponent } from './group-consolidated.component';

describe('GroupConsolidatedComponent', () => {
  let component: GroupConsolidatedComponent;
  let fixture: ComponentFixture<GroupConsolidatedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupConsolidatedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupConsolidatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
