import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SubpointPageRoutingModule } from './subpoint-routing.module';

import { SubpointPage } from './subpoint.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SubpointPageRoutingModule
  ],
  declarations: []
})
export class SubpointPageModule {}
