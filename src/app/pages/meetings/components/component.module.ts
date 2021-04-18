import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ModalContactsComponent } from './modal-contacts/modal-contacts.component';

@NgModule({
  declarations: [
    ModalContactsComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule
  ],
  exports: [
    ModalContactsComponent
  ]
})
export class ComponentModule { }