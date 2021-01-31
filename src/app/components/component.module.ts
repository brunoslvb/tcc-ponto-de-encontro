import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from './card/card.component';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ModalContactsComponent } from './modal-contacts/modal-contacts.component';

@NgModule({
  declarations: [
    CardComponent,
    ModalContactsComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule
  ],
  exports: [
    CardComponent,
    ModalContactsComponent
  ]
})
export class ComponentModule { }