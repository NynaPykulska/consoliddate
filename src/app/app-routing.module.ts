import {NgModule} from '@angular/core';
import {GroupSelectorComponent} from './group-selector/group-selector.component';
import {GroupConsolidatedComponent} from './group-consolidated/group-consolidated.component';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'groups',
  },
  {
    path: 'groups',
    pathMatch: 'full',
    component: GroupSelectorComponent,

  }, {
    path: 'groups/:groupCode',
    pathMatch: 'full',
    component: GroupConsolidatedComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
