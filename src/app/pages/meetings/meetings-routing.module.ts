import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ChatPage } from './chat/chat.page';
import { ModalContactsComponent } from './components/modal-contacts/modal-contacts.component';
import { ModalListContactsComponent } from './components/modal-list-contacts/modal-list-contacts.component';
import { CreatePage } from './create/create.page';
import { DetailsPage } from './details/details.page';
import { EditPage } from './edit/edit.page';
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
      { path: ':id/details', component: DetailsPage },
      { path: ':id/edit', component: EditPage },
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
    EditPage,
    ChatPage,
    MapPage,
    DetailsPage,
    SubpointPage,
    ModalContactsComponent,
    ModalListContactsComponent
  ],
})
export class MeetingsRoutingModule {}
