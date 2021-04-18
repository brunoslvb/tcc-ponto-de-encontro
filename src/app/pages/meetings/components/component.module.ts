import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ModalContactsComponent } from './modal-contacts/modal-contacts.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@NgModule({
  declarations: [
    ModalContactsComponent,
    SidebarComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule
  ],
  exports: [
    ModalContactsComponent,
    SidebarComponent
  ]
})
export class ComponentModule { }