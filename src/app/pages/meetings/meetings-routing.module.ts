import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ChatPage } from './chat/chat.page';
import { CreatePage } from './create/create.page';
import { ListPage } from './list/list.page';
import { MapPage } from './map/map.page';

const routes: Routes = [
  { path: '',
    children: [
      { path: '', component: ListPage },
      { path: 'create', component: CreatePage },
      { path: ':id/chat', component: ChatPage },
      { path: ':id/map', component: MapPage },
    ]
  },
  {
    path: 'map',
    loadChildren: () => import('./map/map.module').then( m => m.MapPageModule)
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
    MapPage
  ],
})
export class MeetingsRoutingModule {}
