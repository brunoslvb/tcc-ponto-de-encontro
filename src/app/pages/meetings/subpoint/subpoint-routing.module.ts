import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SubpointPage } from './subpoint.page';

const routes: Routes = [
  {
    path: '',
    component: SubpointPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubpointPageRoutingModule {}
