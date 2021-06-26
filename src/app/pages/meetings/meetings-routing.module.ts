import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ChatPage } from './chat/chat.page';
import { ModalContactsComponent } from './components/modal-contacts/modal-contacts.component';
import { ModalListContactsComponent } from './components/modal-list-contacts/modal-list-contacts.component';
import { CreatePage } from './create/create.page';
import { ListPage } from './list/list.page';
import { MapPage } from './map/map.page';
import { SubpointPage } from './subpoint/subpoint.page';

const routes: Routes = [
  { path: '',
    children: [
      { path: '', component: ListPage },
      { path: 'create', component: CreatePage },
      { path: ':id/chat', component: ChatPage },
      { path: ':id/map', component: MapPage },
      { path: ':id/subpoint', component: SubpointPage },
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    ListPage,
    CreatePage,
    ChatPage,
    MapPage,
    SubpointPage,
    ModalContactsComponent,
    ModalListContactsComponent
  ],
})
export class MeetingsRoutingModule {}
