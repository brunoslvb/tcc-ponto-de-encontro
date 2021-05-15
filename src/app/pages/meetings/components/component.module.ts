import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ModalContactsComponent } from './modal-contacts/modal-contacts.component';
import { ModalListContactsComponent } from './modal-list-contacts/modal-list-contacts.component';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    BrowserModule,
    IonicModule,
    RouterModule
  ],
  exports: [

  ]
})
export class ComponentModule { }